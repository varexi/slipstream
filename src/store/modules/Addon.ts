import { VuexModule, Module, Action, Mutation } from "vuex-class-modules";
import addonManager from "@/addon/AddonManager";
import { makeAddonStatus, default as AddonStatus } from "@/addon/AddonStatus";
import {
  default as AddonReference,
  createAddonReference
} from "@/addon/AddonReference";

function referenceEqualForStatus(
  first: AddonReference,
  second: AddonReference
) {
  return (
    first.version === second.version &&
    first.description.id === second.description.id &&
    first.description.repository === second.description.repository
  );
}

@Module
export default class Addon extends VuexModule {
  // needs to be iniitalized from file on load
  // and updated when an install finishes
  installedAddons: AddonReference[] = [];

  searchResults: AddonReference[] = [];

  gameVersion = "";

  @Mutation
  setVersion(version: string) {
    this.gameVersion = version;
  }

  @Mutation
  setSearchResults(searchResults: AddonReference[]) {
    this.searchResults = searchResults;
  }

  @Mutation
  updateAddonStatus(params: { addon: AddonReference; status: AddonStatus }) {
    this.searchResults
      .filter((result) => referenceEqualForStatus(result, params.addon))
      .forEach((result) => {
        result.status = params.status;
      });

    // go through installed addons and update their status too.
  }

  @Action
  async search(searchTerm: string) {
    const searchResults = await addonManager.search(
      searchTerm,
      this.gameVersion
    );

    this.setSearchResults(
      searchResults.map((description) => {
        const reference = createAddonReference(
          description,
          this.gameVersion,
          makeAddonStatus("NotInstalled")
        );
        const status = this.installedAddons.find((installedAddon) =>
          referenceEqualForStatus(installedAddon, reference)
        )?.status;

        if (status) {
          reference.status = status;
        }

        return reference;
      })
    );
  }

  @Action
  async install(addon: AddonReference) {
    try {
      this.updateAddonStatus({
        addon,
        status: makeAddonStatus("Installing", 0, "Initializing")
      });

      await addonManager.install(
        addon.description,
        addon.version, // this isn't the installation directory, derive from the root dir in GameState
        (operation, percentage) => {
          this.updateAddonStatus({
            addon,
            status: makeAddonStatus("Installing", percentage, operation)
          });
        }
      );

      this.updateAddonStatus({ addon, status: makeAddonStatus("Installed") });
    } catch (error) {
      this.updateAddonStatus({
        addon,
        status: makeAddonStatus("Error")
      });
      console.log(error);
    }
  }
}
