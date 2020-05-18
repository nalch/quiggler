import { bindable, inject } from "aurelia-framework";
import { Store, connectTo } from "aurelia-store";

import { pluck } from "rxjs/operators";

import * as d3 from "d3";

import { selectFace, selectNode } from "../../editor-actions";
import { computeNeighbours } from "../../graph-utils";


@inject(Store)
@connectTo((store) => store.state.pipe(pluck('editor')))
export class QuiltDisplay {
  factor = 30;
  margin = 5;

  width = 0;

  constructor(store) {
    this.store = store;
    this.store.registerAction('selectFace', selectFace);
    this.store.registerAction('selectNode', selectNode);
  }

  stateChanged(state) {
    this.state = state;
    if (state.width && state.height) {
      this.width = state.width;
      this.height = state.height;
      this.update();
    }
  }

  update() {
    this.simulation = d3.forceSimulation(this.state.nodes)
      .force("charge", d3.forceManyBody().strength(-80))
      .force("link", d3.forceLink(this.state.links).distance(20).strength(1).iterations(10))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .stop();

    if (this.svg) {
      this.svg.remove();
    }

    this.screenWidth = this.svgContainer.offsetWidth;
    this.factor = Math.floor(this.screenWidth / (this.width - 1));
    const viewWidth = this.factor * this.width;
    const viewHeight = this.factor * this.height;

    this.svg = d3.create("svg")
      .attr("viewBox", [0, 0, this.factor * this.width, viewHeight]);

    const defs = this.svg.append("defs")
    // size in svg
    const size = 30;
    var imgPattern = defs.selectAll("pattern").data(this.state.fabrics)
      .enter()
      .append("pattern")
        .attr("id", d => "pattern-" + d.slug)
        .attr("width", size)
        .attr("height", size)
        .attr("patternUnits", "userSpaceOnUse")
      .append("image")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", size)
        .attr("height", size)
        .attr("xlink:href", d => d.image);

    this.face = this.svg.selectAll("polygon")
      .data(this.state.faces)
      .enter()
      .append("polygon")
        .attr("points", d => d.nodes.map(n => n.map(c => c * this.factor).join(",")).join(" "))
        .attr("title", d => d.id)
        .on("click", this.clickFace.bind(this));

    if (this.state.links) {
      this.link = this.svg.append("g")
          .attr("stroke", "#888")
          .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(this.state.links)
        .join("line")
          .attr("stroke-width", 0.5);
    }

    this.node = this.svg.append("g")
        .attr("fill", "#99b")
        .attr("stroke", "#99b")
        .attr("stroke-width", 1)
      .selectAll("circle")
      .data(this.state.nodes)
      .join("circle")
        .attr("r", 0.5)
        .on("click", this.clickNode.bind(this));

    this.svgContainer.appendChild(this.svg.node());

    this.redraw();
  }

  clickFace(d) {
    if (this.state.mode === "face") {
      this.store.dispatch(selectFace, d);
    }
  }

  clickNode(n) {
    if (this.state.mode === "node") {
      this.store.dispatch(selectNode, n);
    }
  }

  faceBackground(d) {
    if (d.background) {
      return d.background;
    }

    return "#fff";  // todo: transparent pattern
  }

  nodeRadius(d) {
    if (d.selected) {
      return 3;
    }

    if (this.state.mode === "node") {
      return 1.5;
    }

    return 0.5;
  }

  redraw() {
    this.face
      .data(this.state.faces)
      .attr("stroke", d => d.selected ? "#99b" : "#ccc")
      .attr("stroke-width", d => d.selected ? "1" : "0")
      .attr("fill", this.faceBackground.bind(this));

    this.link
      .data(this.state.links)
      .attr("x1", d => d.source[0] * this.factor)
      .attr("y1", d => d.source[1] * this.factor)
      .attr("x2", d => d.target[0] * this.factor)
      .attr("y2", d => d.target[1] * this.factor);

    this.node
      .data(this.state.nodes)
      .attr("cx", d => d.cx * this.factor)
      .attr("cy", d => d.cy * this.factor)
      .attr("r", this.nodeRadius.bind(this))
      .attr("stroke-width", d => d.selected ? 1.5 : 1)
      .attr("fill", d => d.selected ? "#eef" : "99b");
  }
}
