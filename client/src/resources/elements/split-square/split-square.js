import { bindable, inject } from "aurelia-framework";
import { Store, connectTo } from "aurelia-store";

import { pluck } from "rxjs/operators";

import { splitSquare } from "./actions";

@inject(Store)
@connectTo((store) => store.state.pipe(pluck('editor')))
export class SplitSquare {

  constructor(store) {
    this.store = store;
    this.store.registerAction("splitSquare", splitSquare);
  }

  stateChanged(state) {
    this.state = state;
  }

  split(direction) {
    this.store.dispatch(splitSquare, direction);
  }
}
