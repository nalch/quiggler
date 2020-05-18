import { bindable, inject } from "aurelia-framework";
import { Store } from "aurelia-store";

import $ from "jquery";
import Picker from 'vanilla-picker';

import { setColour } from "./actions";

@inject(Store)
export class ColorPicker {
  colorPicker;
  @bindable pickerElement;

  @bindable color;

  constructor(store) {
    this.store = store;
    this.store.registerAction("setColour", setColour);
  }

  attached() {
    this.pickerElement = new Picker({
        parent: this.colorPicker,
        popup: false,
        alpha: false,
        editor: true,
        color: 'orangered',
        onChange: color => {
          this.color = color.rgbaString;
          this.store.dispatch(setColour, this.color);
        },
    });
  }
}
