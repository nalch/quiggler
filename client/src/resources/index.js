import { PLATFORM } from "aurelia-framework";

export function configure(config) {
  config.globalResources([
    PLATFORM.moduleName("./elements/quilt-display/quilt-display"),
    PLATFORM.moduleName("./elements/color-picker/color-picker"),
    PLATFORM.moduleName("./elements/fabric-picker/fabric-picker"),
    PLATFORM.moduleName("./elements/recent-colours/recent-colours"),
    PLATFORM.moduleName("./elements/merge-faces/merge-faces"),
    PLATFORM.moduleName("./elements/split-square/split-square"),
    PLATFORM.moduleName("./elements/quilt-modal/quilt-modal"),
    PLATFORM.moduleName("./elements/select-mode/select-mode"),
    PLATFORM.moduleName("./elements/connect/connect"),
  ]);
}
