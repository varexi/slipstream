<template>
  <v-container fluid>
    <v-expansion-panels v-model="expansionPanel">
      <v-expansion-panel
        class="secondary darken-1"
        v-for="addon in addons"
        :key="addon.slipstreamId"
      >
        <v-expansion-panel-header>
          <v-row align="center" justify="start" no-gutters>
            <v-col cols="9">
              <v-avatar
                style="border: 1px solid white;"
                class="mr-4"
                width="48"
                height="48"
                left
                rounded="circle"
              >
                <v-img :src="addon.thumbnailUrl" class="transparent">
                  <template v-slot:placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="primary"
                      ></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </v-avatar>
              <span class="grey--text text--lighten-4 font-weight-medium">{{
                addon.title
              }}</span>
            </v-col>
            <v-col cols="3">
              <div class="text-center">
                <div
                  v-if="
                    statusMap[addon.slipstreamId].state === 'Installed' &&
                      updateAvailable(addon.slipstreamId)
                  "
                >
                  <v-tooltip left transition="fade-transition">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        color="primary"
                        fab
                        outlined
                        small
                        v-bind="attrs"
                        v-on="on"
                        @click.stop="updateButtonClicked(addon)"
                      >
                        <v-icon>mdi-sync</v-icon>
                      </v-btn>
                    </template>
                    <span>Update</span>
                  </v-tooltip>
                </div>
                <div
                  v-if="statusMap[addon.slipstreamId].state === 'NotInstalled'"
                >
                  <v-tooltip left transition="fade-transition">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        color="primary"
                        fab
                        outlined
                        small
                        v-bind="attrs"
                        v-on="on"
                        @click.stop="installButtonClicked(addon)"
                        ><v-icon>mdi-download</v-icon>
                      </v-btn>
                    </template>
                    <span>Install</span>
                  </v-tooltip>
                </div>
                <v-progress-circular
                  v-if="statusMap[addon.slipstreamId].state === 'Installing'"
                  color="primary"
                  height="36"
                  :indeterminate="
                    statusMap[addon.slipstreamId].progress.operation ===
                      'Initializing'
                  "
                  :value="
                    statusMap[addon.slipstreamId].progress.percentage * 100
                  "
                >
                </v-progress-circular>
                <v-icon
                  v-if="
                    statusMap[addon.slipstreamId].state === 'Installed' &&
                      !updateAvailable(addon.slipstreamId)
                  "
                  color="green darken-1"
                  >mdi-check-bold</v-icon
                >
              </div>
            </v-col>
          </v-row>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-container fluid>
            <v-row justify="start">
              <v-col cols="6">
                <v-list height="100%">
                  <v-list-item dense two-line>
                    <v-list-item-content>
                      <v-list-item-title>Summary</v-list-item-title>
                      <v-list-item-subtitle class="wrap-text">{{
                        addon.summary
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item dense two-line>
                    <v-list-item-content>
                      <v-list-item-title class="font-weight-bold"
                        >Author</v-list-item-title
                      >
                      <v-list-item-subtitle>{{
                        addon.author
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="6">
                <v-list height="100%">
                  <v-list-item
                    dense
                    two-line
                    v-if="installedAddonMap[addon.slipstreamId] !== undefined"
                  >
                    <v-list-item-content>
                      <v-list-item-title
                        >Installed Version
                        <v-tooltip right transition="fade-transition">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              v-if="
                                statusMap[addon.slipstreamId].state !==
                                  'NotInstalled'
                              "
                              :disabled="
                                !(
                                  statusMap[addon.slipstreamId].state ===
                                  'Installed'
                                )
                              "
                              class="pb-1"
                              icon
                              x-small
                              color="error"
                              v-bind="attrs"
                              v-on="on"
                              @click.stop="deleteButtonClicked(addon)"
                            >
                              <v-icon>mdi-delete</v-icon>
                            </v-btn>
                          </template>
                          <span>Uninstall</span>
                        </v-tooltip>
                      </v-list-item-title>
                      <v-list-item-subtitle>{{
                        installedAddonMap[addon.slipstreamId].displayVersion
                      }}</v-list-item-subtitle>
                      <v-list-item-subtitle>
                        {{
                          installedAddonMap[addon.slipstreamId].gameVersion
                        }}</v-list-item-subtitle
                      >
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item
                    dense
                    two-line
                    v-if="latestAddonMap[addon.slipstreamId] !== undefined"
                  >
                    <v-list-item-content>
                      <v-list-item-title>Latest Version</v-list-item-title>
                      <v-list-item-subtitle>{{
                        latestAddonMap[addon.slipstreamId].displayVersion
                      }}</v-list-item-subtitle>
                      <v-list-item-subtitle>
                        {{
                          latestAddonMap[addon.slipstreamId].gameVersion
                        }}</v-list-item-subtitle
                      >
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-container>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<style scoped>
.v-list-item__subtitle {
  white-space: normal;
}
</style>

<style>
.v-progress-circular__overlay {
  transition: none !important;
}
.v-progress-circular__underlay {
  stroke: #1d1d1d !important;
}
</style>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { GameVersionStateMap } from "@/store/index";
import AddonDescription from "@/addon/AddonDescription";

@Component
export default class AddonList extends Vue {
  expansionPanel: number | undefined = 0;

  @Prop({ type: String }) readonly gameVersion!: string;
  @Prop({ type: Array }) readonly addons!: string;

  get latestAddonMap() {
    return GameVersionStateMap[this.gameVersion]?.latestAddons || {};
  }

  get installedAddonMap() {
    return GameVersionStateMap[this.gameVersion]?.installedAddons || {};
  }

  get statusMap() {
    return GameVersionStateMap[this.gameVersion]?.addonStatus || {};
  }

  updateAvailable(slipstreamId: string): boolean {
    return GameVersionStateMap[this.gameVersion]?.updateAvailableForAddon(
      slipstreamId
    );
  }

  @Watch("gameVersion")
  onGameVersionChanged() {
    this.expansionPanel = undefined;
  }

  updateButtonClicked(addon: AddonDescription) {
    GameVersionStateMap[this.gameVersion]?.update(addon);
  }

  installButtonClicked(addon: AddonDescription) {
    GameVersionStateMap[this.gameVersion]?.install(addon);
  }

  deleteButtonClicked(addon: AddonDescription) {
    GameVersionStateMap[this.gameVersion]?.delete(addon);
  }
}
</script>
