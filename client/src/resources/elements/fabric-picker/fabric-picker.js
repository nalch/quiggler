import { inject } from "aurelia-framework";
import { Store, connectTo } from "aurelia-store";

import { pluck } from "rxjs/operators";

import { setFabric } from "./actions";

@inject(Store)
@connectTo((store) => store.state.pipe(pluck('editor')))
export class FabricPicker {
  constructor(store) {
    this.store = store;
    this.store.registerAction("setFabric", setFabric);
  }

  stateChanged(state) {
    this.fabrics = state.fabrics;
  }

  setFabric(fabric) {
    this.store.dispatch(setFabric, fabric);
  }

}
