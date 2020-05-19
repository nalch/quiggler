import { inject } from "aurelia-framework";
import { HttpClient, json } from "aurelia-fetch-client";
import { MdTapTarget, MdToastService } from "aurelia-materialize-bridge";

@inject(HttpClient, MdToastService)
export class QuiltModal {
  constructor(client, toast) {
    this.client = client;
    this.toast = toast;
  }

  create() {
    const quiltData = {
      name: this.name,
      width: Number(this.columns),
      height: Number(this.rows),
      public: Boolean(this.public),
      width_in_cm: Number(this.width),
      height_in_cm: Number(this.height),
      type: "square"
    };
    debugger;
    return this.client.fetch("quilts/", {
      method: 'POST',
      body: json(quiltData)
    }).then(response => {
      this.toast.show("Quilt created!", 4000, "rounded btn")
    }).catch(error => {this.toast.show("Could not create quilt!", 4000, "rounded red"); console.log(error);});
  }

  cancel() {}
}
