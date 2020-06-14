import { inject } from "aurelia-framework";
import { HttpClient, json } from "aurelia-fetch-client";

@inject(HttpClient)
export class FabricModal {
  constructor(client) {
    this.client = client;

    this.client.configure(config => {
      config
        .withBaseUrl('http://127.0.0.1:8000/api/')
        .withDefaults({
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'Fetch'
          }
        })
        .rejectErrorResponses();
    });
  }

  select(fabric) {
    fabric.selected = !fabric.selected;
  }

  change(e) {
    console.log(this.textValue);
  }

  autocomplete(detail) {
    console.log(detail);
  }

  onOpenStart(e) {
    return this.client.fetch(`fabrics/`, {
      method: 'GET'
    }).then(response => response.json())
      .then(data => {
        this.fabrics = data;
        this.fabricNames = data.reduce((names, f) => {
          names[f.name] = null;
          return names;
        }, {});
      }).catch(console.error);
  }

  add() {
    this.client.fetch(`quilts/aoei/`, {
      method: 'PATCH',
      body: json({"fabrics": this.fabrics.filter(f => f.selected).map(f => f.url)})
    });
  }
}
