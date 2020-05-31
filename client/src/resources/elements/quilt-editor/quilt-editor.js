import { inject } from "aurelia-framework";
import { HttpClient, json } from 'aurelia-fetch-client';
import { MdTapTarget, MdToastService } from "aurelia-materialize-bridge";
import { Store, connectTo } from "aurelia-store";

import { pluck } from "rxjs/operators";

import * as d3 from "d3";
import materialize from 'materialize-css';

import { deselect, loadGraph, selectAll } from "../../editor-actions"

@inject(Store, HttpClient, MdToastService)
@connectTo((store) => store.state.pipe(pluck('editor')))
export class QuiltEditor {
  loading = true;

  tap;
  tapTarget;

  constructor(store, client, toast) {
    this.store = store;
    this.store.registerAction("loadGraph", loadGraph);
    this.store.registerAction("selectAll", selectAll);
    this.store.registerAction("deselect", deselect);

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

    this.toast = toast;
  }

  activate(params) {
    this.slug = params.slug;
    return d3.json(`http://127.0.0.1:8000/api/quilts/${this.slug}/`).then(data => {
      this.store.dispatch(loadGraph, data);
      this.loading = false;
    });
  }

  stateChanged(state) {
    this.state = state;
  }

  selectAll() {
    this.store.dispatch(selectAll);
    this.tapTarget.open();
  }

  deselect() {
    this.store.dispatch(deselect);
  }

  save() {
    this.deselect();
    const baseGraph = this.state.originalGraph;
    baseGraph.nodes = this.state.nodes;
    baseGraph.links = this.state.links;
    baseGraph.faces = this.state.faces;
    baseGraph.fabrics = this.state.fabrics;
    return this.client.fetch(`quilts/${this.slug}/`, {
      method: 'PATCH',
      body: json({"json": JSON.stringify(baseGraph)})
    }).then(response => {
      this.toast.show("Design saved!", 4000, "rounded btn")
    }).catch(error => this.toast.show("Could not save design!", 4000, "rounded red"));
  }
}
