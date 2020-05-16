import { bindable, inject } from "aurelia-framework";
import { Store, connectTo } from "aurelia-store";

import { pluck } from "rxjs/operators";

import { triangulate } from "./actions";

@inject(Store)
@connectTo((store) => store.state.pipe(pluck('editor')))
export class Voronoi {

  constructor(store) {
    this.store = store;
    this.store.registerAction("triangulate", triangulate);
  }

  stateChanged(state) {
    this.state = state;
  }

  triangulateFace() {
    this.store.dispatch(triangulate);
  }
}
