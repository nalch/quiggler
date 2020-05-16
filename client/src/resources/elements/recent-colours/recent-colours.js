import { bindable, inject } from "aurelia-framework";
import { Store, connectTo } from "aurelia-store";

import { pluck } from "rxjs/operators";

import { setColour } from "../color-picker/actions";

@inject(Store)
@connectTo((store) => store.state.pipe(pluck('editor')))
export class RecentColours {
  colours = [];

  constructor(store) {
    this.store = store;
  }

  stateChanged(state) {
    this.state = state;
    this.colours = new Set(this.state.faces.map(f => f.background));
  }

  setColour(colour) {
    this.store.dispatch(setColour, colour);
  }
}
