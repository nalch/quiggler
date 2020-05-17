import { bindable, inject } from "aurelia-framework";
import { Store, connectTo } from "aurelia-store";

import { pluck } from "rxjs/operators";

import { selectMode } from "./actions";
import { deselect } from "../../editor-actions";

@inject(Store)
@connectTo((store) => store.state.pipe(pluck('editor')))
export class SelectMode {
  @bindable mode = "face";

  constructor(store) {
    this.store = store;
    this.store.registerAction("selectMode", selectMode);
    this.store.registerAction("deselect", deselect);
  }

  modeChanged(mode) {
    this.store.dispatch(selectMode, mode);
    this.store.dispatch(deselect);
  }
}
