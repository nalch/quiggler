import { bindable, inject } from "aurelia-framework";
import { Store, connectTo } from "aurelia-store";

import { pluck } from "rxjs/operators";

import { connect } from "./actions";

@inject(Store)
@connectTo((store) => store.state.pipe(pluck('editor')))
export class Connect {
  connectable = true;

  constructor(store) {
    this.store = store;
    this.store.registerAction("connect", connect);
  }

  stateChanged(state) {
    this.connectable = state.nodes.filter(f => f.selected).length > 1;
  }

  connectSelected() {
    this.store.dispatch(connect);
  }
}
