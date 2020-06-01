import { bindable, inject } from "aurelia-framework";
import { Store } from "aurelia-store";

import { setZoom } from "./actions";

@inject(Store)
export class Zoom {
  @bindable level = 100;
  @bindable xOffset = 0;
  @bindable yOffset = 0;

  constructor(store) {
    this.store = store;
    this.store.registerAction("setZoom", setZoom);
  }

  levelChanged(level) {
    this.changeZoomSettings();
  }

  xOffsetChanged(offset) {
    this.changeZoomSettings();
  }

  yOffsetChanged(offset) {
    this.changeZoomSettings();
  }

  changeZoomSettings() {
    this.store.dispatch(setZoom, {level: this.level, xOffset: this.xOffset, yOffset: this.yOffset});
  }
}
