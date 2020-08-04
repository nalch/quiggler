import { BindingEngine, LogManager, bindable, inject } from "aurelia-framework";
import { Store, connectTo } from "aurelia-store";

import { pluck } from "rxjs/operators";
import differenceWith from "lodash/differenceWith";
import isEqual from "lodash/isEqual";
import partial from "lodash/partial";

import * as d3 from "d3";
import * as inside from "point-in-polygon";

import { faceId, nodeId, linkId, faceBackground, nodeRadius } from "./display-settings"
import { deselect, selectFace, selectNode } from "../../editor-actions";
import { addLine } from "../add-line/actions";
import { computeNeighbours } from "../../graph-utils";

const logger = LogManager.getLogger("QuiltDisplay");

@inject(Store, BindingEngine)
@connectTo({
    selector: {
      state: (store) => store.state.pipe(pluck("editor")),
      zoom: (store) => store.state.pipe(pluck("zoom"))
    }
  })
export class QuiltDisplay {
  factor = 30;
  margin = 5;

  oldWidth = 0;
  oldHeight = 0;
  width = 0;

  constructor(store, bindingEngine) {
    this.store = store;
    this.bindingEngine = bindingEngine;

    this.store.registerAction("selectFace", selectFace);
    this.store.registerAction("selectNode", selectNode);
    this.store.registerAction("deselect", deselect);
    this.store.registerAction("addLine", addLine);
  }

  stateChanged(state) {
    this.state = state;

    if (state.width && state.height && this.svgContainer.offsetWidth) {
      this.oldWidth = this.width;
      this.oldHeight = this.height;
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
    }
  }

  zoomChanged(zoom) {
    this.zoom = zoom;
    if (this.svg) {
      this.updateViewBox(zoom);
      this.redraw();
    }
  }

  computeFactor() {
    // quilt width + control column
    return Math.floor(this.screenWidth / (this.width + 1));
  }

  createSvg() {
    this.simulation = d3.forceSimulation(this.state.nodes)
      .force("charge", d3.forceManyBody().strength(-80))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .stop();

    if (this.svg) {
      this.svg.remove();
    }

    this.screenWidth = this.svgContainer.offsetWidth;
    this.factor = this.computeFactor();
    const viewWidth = this.factor * (this.width + 1);
    const viewHeight = this.factor * (this.height + 1);

    const drag = d3.drag();
    drag.on("drag", () => {
      // todo: add proper data structure
      const face = this.state.faces.find(
        f => inside(
          [d3.event.x / this.factor, d3.event.y / this.factor],
          f.nodes
        )
      );
      if (face && !face.selected) {
        face.selected = true;
      }
    });
    drag.on("start", face => {
      if (!face.selected) {
        this.store.dispatch(deselect, "deselect");
      }

    });

    this.svg = d3.create("svg").attr("id", "svg-container");

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
        .attr("href", d => d.image);

    this.d3Faces = this.svg.append("g")
        .attr("id", "face-group")
      .selectAll("polygon")
      .data(this.state.faces)
      .enter()
      .append("polygon")
        .attr("id", faceId)
        .attr("points", d => d.nodes.map(n => n.map(c => c * this.factor).join(",")).join(" "))
        .attr("data-points", d => d.nodes.map(n => n.join(",")).join(" "))
        .attr("title", d => d.id)
        .on("click", this.clickFace.bind(this))
        .call(drag);

    this.addControls(this.svg);

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

  addControls(svg) {
    const size = this.factor;

    const controlDataHorizontal = [];
    for(let i=0; i<this.width + 1; i++) {
      controlDataHorizontal.push(i * this.factor - size / 2);
    }

    const controlDataVertical = [];
    for(let i=0; i<this.height + 1; i++) {
      controlDataVertical.push((i+1) * this.factor - size / 2);
    }

    svg.append("g")
        .attr("id", "controls-group")
        .attr("class", "controls-group")
      .selectAll("image")
      .data(controlDataHorizontal)
      .enter()
      .append("image")
        .attr("x", d => d)
        .attr("y", this.factor * -1)
        .attr("width", size)
        .attr("fill", "#26a69a")
        .attr("href", "http://127.0.0.1:8000/media/fabrics/add-location.svg")
        .attr("style", "opacity: 0")
        .attr("data-orientation", "horizontal")
        .on("mouseover", (_, idx, controls) => {controls[idx].style.opacity = 1;})
        .on("mouseout", (_, idx, controls) => {controls[idx].style.opacity = 0})
        .on("click", this.clickControl.bind(this));

    svg.append("g")
        .attr("id", "controls-group-vertical")
        .attr("class", "controls-group")
      .selectAll("image")
      .data(controlDataVertical)
      .enter()
      .append("image")
        .attr("x", d => -d)
        .attr("y", this.factor * -1)
        .attr("width", size)
        .attr("fill", "#26a69a")
        .attr("href", "http://127.0.0.1:8000/media/fabrics/add-location.svg")
        .attr("style", "opacity: 0")
        .attr("data-orientation", "vertical")
        .attr("transform", "rotate(-90 0 0)")
        .on("mouseover", (_, idx, controls) => {controls[idx].style.opacity = 1;})
        .on("mouseout", (_, idx, controls) => {controls[idx].style.opacity = 0})
        .on("click", this.clickControl.bind(this));
  }

  clickControl(_, idx, controls) {
    const orientation = controls[idx].getAttribute("data-orientation");
    this.store.dispatch(addLine, idx, orientation);
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

    this.d3Nodes = this.d3Nodes.data(this.state.nodes);
    this.d3Faces = this.d3Faces.data(this.state.faces);

    this.bindingEngine.collectionObserver(this.state.nodes).subscribe(splice => {
      splice.forEach(s => {
        s.removed.filter(r => r.__proxied__).forEach(r => this.getNodeElem(r).remove());

        if (s.addedCount) {
          logger.debug("Nodes added");
          const index = s.index;
          const newElems = this.state.nodes.slice(index, index + s.addedCount);

          if (newElems.some(n => !n.__proxied__)) {
            const newProxies = this.proxyElements(newElems, this.updateNode.bind(this));
            this.state.nodes.splice(s.index, s.addedCount, ...newProxies);

            newProxies.forEach(n => {
              d3.select(this.svgContainer)
                .select("#node-group")
                .append("circle")
                  .attr("id", nodeId(n))
                  .on("click", partial(this.clickNode.bind(this), n));
              this.updateNode(n);
            });
          }
        }
      });
      this.updateViewBox(this.zoom);
      this.redraw(true, false);
    });

    this.bindingEngine.collectionObserver(this.state.faces).subscribe(splice => {
      splice.forEach(s => {
        s.removed.filter(r => r.__proxied__).forEach(r => this.getFaceElem(r).remove());

        if (s.addedCount) {
          logger.debug("Faces added");
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
      this.updateViewBox(this.zoom);
      this.redraw(false, true);
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
    face.setAttribute("stroke-width", f.selected ? "2" : "1");
    face.setAttribute("fill", faceBackground(f));
    face.setAttribute("points", f.nodes.map(n => n.map(c => c * this.factor).join(",")).join(" "));
    face.setAttribute("data-points", f.nodes.map(n => n.join(",")).join(" "));
  }

  updateNode(n) {
    const node = this.getNodeElem(n);
    node.setAttribute("cx", n.cx * this.factor);
    node.setAttribute("cy", n.cy * this.factor);
    node.setAttribute("r", nodeRadius(n, this.state.mode));
    node.setAttribute("stroke-width", n.selected ? 1.5 : 1)
    node.setAttribute("fill", n.selected ? "#eef" : "99b");
  }

  updateViewBox(zoom) {
    logger.debug(`Update Viewbox @ ${zoom.level}% (${this.width}x${this.height})`);
    this.screenWidth = this.svgContainer.offsetWidth;
    this.screenHeight = this.svgContainer.offsetHeight;
    this.factor = this.computeFactor();
    const viewWidth = this.factor * (this.width + 1) * (100/zoom.level);
    const viewHeight = this.factor * (this.height + 1) * (100/zoom.level);

    const xOffset = this.screenWidth * (zoom.xOffset/100);
    const yOffset = this.screenHeight * (zoom.yOffset/100);

    logger.debug(`Screenwidth: ${this.screenWidth} x ${this.screenHeight} @ Factor ${this.factor}`);
    logger.debug(`Offset: ${xOffset} x ${yOffset}`);
    logger.debug(`ViewSize: ${viewWidth}x${viewHeight}`);

    this.svg.attr("viewBox", [xOffset || this.factor * -1, yOffset || this.factor * -1, viewWidth, viewHeight]);
  }

  redraw(nodes=true, faces=true, controls=true) {
    logger.debug(`Redraw: Nodes ${nodes}, faces ${faces}`);
    if (nodes) {
      this.state.nodes.forEach(this.updateNode.bind(this));
    }
    if (faces) {
      this.state.faces.forEach(this.updateFace.bind(this));
    }
    if (controls) {
      this.addControls(this.svg);
    }
  }
}
