import { BindingEngine, LogManager, bindable, inject } from "aurelia-framework";
import { Store, connectTo } from "aurelia-store";

import { pluck } from "rxjs/operators";
import differenceWith from "lodash/differenceWith";
import isEqual from "lodash/isEqual";
import partial from "lodash/partial";

import * as d3 from "d3";

import { faceId, nodeId, linkId, faceBackground, nodeRadius } from "./display-settings"
import { selectFace, selectNode } from "../../editor-actions";
import { computeNeighbours } from "../../graph-utils";

const logger = LogManager.getLogger("QuiltDisplay");

@inject(Store, BindingEngine)
@connectTo((store) => store.state.pipe(pluck('editor')))
export class QuiltDisplay {
  factor = 30;
  margin = 5;

  width = 0;

  constructor(store, bindingEngine) {
    this.store = store;
    this.bindingEngine = bindingEngine;

    this.store.registerAction('selectFace', selectFace);
    this.store.registerAction('selectNode', selectNode);
  }

  stateChanged(state, oldState) {
    this.state = state;

    if (state.width && state.height && this.svgContainer.offsetWidth) {
      this.width = state.width;
      this.height = state.height;
      if (!this.svg) {
        this.createSvg();
        logger.info("Created Svg");
        this.redraw();
        logger.info("Setup Observer");
        this.setupObserver();
        logger.info("Setup Done", this.state);
      }
      else {
        if (state.mode !== oldState.mode) {
          this.redraw();
        }
      }
    }
  }

  createSvg() {
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

    this.d3Faces = this.svg.append("g")
        .attr("id", "face-group")
      .selectAll("polygon")
      .data(this.state.faces)
      .enter()
      .append("polygon")
        .attr("id", faceId)
        .attr("points", d => d.nodes.map(n => n.map(c => c * this.factor).join(",")).join(" "))
        .attr("title", d => d.id)
        .on("click", this.clickFace.bind(this));

    if (this.state.links) {
      this.d3Links = this.svg.append("g")
          .attr("id", "link-group")
          .attr("stroke", "#888")
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", 0.5)
        .selectAll("line")
        .data(this.state.links)
        .join("line")
          .attr("id", linkId);
    }

    this.d3Nodes = this.svg.append("g")
        .attr("id", "node-group")
        .attr("fill", "#99b")
        .attr("stroke", "#99b")
        .attr("stroke-width", 1)
        .attr("r", 0.5)
      .selectAll("circle")
      .data(this.state.nodes)
      .enter()
      .append("circle")
        .attr("id", nodeId)
        .on("click", this.clickNode.bind(this));

    this.svgContainer.appendChild(this.svg.node());
  }

  proxyElements(elements, setterFunction) {
    const handler = {
      set: (obj, prop, value) => {
        const retVal = Reflect.set(obj, prop, value);
        setterFunction(obj);
        return retVal;
      },
      get: (obj, prop) => {
        if (prop === "__proxied__") {
          return true;
        }

        if (prop === "toJson") {
          return Reflect.get(obj, "toJson");
        }

        return Reflect.get(obj, prop);
      }
    };

    return elements.map(e => new Proxy(e, handler));
  }

  setupObserver() {
    this.state.faces = this.proxyElements(this.state.faces, this.updateFace.bind(this));
    this.state.nodes = this.proxyElements(this.state.nodes, this.updateNode.bind(this));
    this.state.links = this.proxyElements(this.state.links, this.updateLink.bind(this));

    this.d3Nodes = this.d3Nodes.data(this.state.nodes);
    this.d3Links = this.d3Links.data(this.state.links);
    this.d3Faces = this.d3Faces.data(this.state.faces);

    this.bindingEngine.collectionObserver(this.state.faces).subscribe(splice => {
      splice.forEach(s => {
        s.removed.filter(r => r.__proxied__).forEach(r => this.getFaceElem(r).remove());

        if (s.addedCount) {
          const index = s.index;
          const newElems = this.state.faces.slice(index, index + s.addedCount);

          if (newElems.some(f => !f.__proxied__)) {
            const newProxies = this.proxyElements(newElems, this.updateFace.bind(this));
            this.state.faces.splice(s.index, s.addedCount, ...newProxies);

            newProxies.forEach(f => {
              d3.select(this.svgContainer)
                .select("#face-group")
                .append("polygon")
                  .attr("id", faceId(f))
                  .attr("points", f.nodes.map(n => n.map(c => c * this.factor).join(",")).join(" "))
                  .attr("title", faceId(f))
                  .on("click", partial(this.clickFace.bind(this), f));
              this.updateFace(f);
            });
          }
        }
      });
    });

    this.bindingEngine.collectionObserver(this.state.links).subscribe(splice => {
      splice.forEach(s => {
        s.removed.filter(r => r.__proxied__).forEach(r => this.getLinkElem(r).remove());

        if (s.addedCount) {
          const index = s.index;
          const newElems = this.state.links.slice(index, index + s.addedCount);

          if (newElems.some(l => !l.__proxied__)) {
            const newProxies = this.proxyElements(newElems, this.updateLink.bind(this));
            this.state.links.splice(s.index, s.addedCount, ...newProxies);

            newProxies.forEach(l => {
              d3.select(this.svgContainer)
                .select("#link-group")
                .append("line")
                  .attr("id", linkId(l));
              this.updateLink(l);
            });
          }
        }
      });
    });

    this.bindingEngine.collectionObserver(this.state.nodes).subscribe(splice => {
      splice.forEach(s => {
        s.removed.filter(r => r.__proxied__).forEach(r => this.getNodeElem(r).remove());

        if (s.addedCount) {
          const index = s.index;
          const newElems = this.state.nodes.slice(index, index + s.addedCount);

          if (newElems.some(n => !n.__proxied__)) {
            const newProxies = this.proxyElements(newElems, this.updateNode.bind(this));
            this.state.nodes.splice(s.index, s.addedCount, ...newProxies);

            newProxies.forEach(n => {
              d3.select(this.svgContainer)
                .select("#node-group")
                .append("circle")
                  .attr("id", nodeId)
                  .on("click", partial(this.clickNode.bind(this), n));
              this.updateLink(l);
            });
          }
        }
      });
    });

  }

  clickFace(f) {
    if (f && this.state.mode === "face") {
      this.store.dispatch(selectFace, f);
    }
  }

  clickNode(n) {
    if (n && this.state.mode === "node") {
      this.store.dispatch(selectNode, n);
    }
  }

  getFaceElem(f) {
    return this.svgContainer.querySelector(`#${faceId(f)}`);
  }

  getNodeElem(n) {
    return this.svgContainer.querySelector(`#${nodeId(n)}`);
  }

  getLinkElem(l) {
    return this.svgContainer.querySelector(`#${linkId(l)}`);
  }

  updateFace(f) {
    const face = this.getFaceElem(f);
    face.setAttribute("stroke", f.selected ? "#99b" : "#ccc");
    face.setAttribute("stroke-width", f.selected ? "1" : "0");
    face.setAttribute("fill", faceBackground(f));
  }

  updateNode(n) {
    const node = this.getNodeElem(n);
    node.setAttribute("cx", n.cx * this.factor);
    node.setAttribute("cy", n.cy * this.factor);
    node.setAttribute("r", nodeRadius(n, this.state.mode));
    node.setAttribute("stroke-width", n.selected ? 1.5 : 1)
    node.setAttribute("fill", n.selected ? "#eef" : "99b");
  }

  updateLink(l) {
    const link = this.getLinkElem(l);
    link.setAttribute("x1", l.source[0] * this.factor);
    link.setAttribute("y1", l.source[1] * this.factor);
    link.setAttribute("x2", l.target[0] * this.factor);
    link.setAttribute("y2", l.target[1] * this.factor);
  }

  redraw() {
    this.state.faces.forEach(this.updateFace.bind(this));
    this.state.links.forEach(this.updateLink.bind(this));
    this.state.nodes.forEach(this.updateNode.bind(this));
  }
}
