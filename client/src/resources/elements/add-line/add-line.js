import { inject } from "aurelia-framework";
import { Store } from "aurelia-store";

import { addLine } from "./actions";

@inject(Store)
export class AddLine {
  constructor(store) {
    this.store = store;
    this.store.registerAction("addLine", addLine);
  }

  addLineAction() {
    this.store.dispatch(addLine, "column");
  }
}
