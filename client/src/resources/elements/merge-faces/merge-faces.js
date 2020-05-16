import { bindable, inject } from "aurelia-framework";
import { Store, connectTo } from "aurelia-store";

import { pluck } from "rxjs/operators";

import { merge } from "./actions";

@inject(Store)
@connectTo((store) => store.state.pipe(pluck('editor')))
export class MergeFaces {
  mergeable = true;

  constructor(store) {
    this.store = store;
    this.store.registerAction("merge", merge);
  }

  stateChanged(state) {
    this.mergeable = state.faces.filter(f => f.selected).length > 1;
  }

  mergeSelected() {
    this.store.dispatch(merge);
  }
}
