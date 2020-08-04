import { inject } from "aurelia-framework";
import { HttpClient } from "aurelia-fetch-client";

import * as config from "../../../../config/environment.json";

@inject(HttpClient)
export class Home {

  constructor(client) {
    this.client = client.configure(c => {c.withBaseUrl(config.apiBase)});
  }

  activate() {
    this.client.fetch('quilts/')
    .then(response => response.json())
    .then(data => {
      this.quilts = data;
    });
  }

}
