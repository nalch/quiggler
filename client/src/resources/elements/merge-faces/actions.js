import isEqual from "lodash/isEqual";
import remove from "lodash/remove";

import { findEdge, findNextNode } from "../../graph-utils";

export const merge = state => {
  const selected = state.editor.faces.filter(f => f.selected);
  const faceToNodes = selected.reduce((acc, f) => {
    acc[f.id] = f.nodes;
    return acc;
  }, {});

  const edgeToFaces = new Map();
  for (const f in faceToNodes) {
    const nodes = faceToNodes[f];
    for (let i=0; i<nodes.length; i++) {
      const node = nodes[i];
      let nextNode = (i<nodes.length-1) ? nextNode = nodes[i + 1] : nextNode = nodes[0];
      const edge = findEdge(state.editor.links, node, nextNode);

      if (!edgeToFaces.get(edge.index)) {
        edgeToFaces.set(edge.index, {"edge": edge, "faces": []});
      }
      edgeToFaces.get(edge.index).faces.push(f);
    }
  }

  // find new face
  const outerEdges = Array.from(edgeToFaces.values()).filter(i => i.faces.length === 1).map(i => i.edge);
  let currentEdge = outerEdges.pop();
  let nextPoint = currentEdge.target;
  const points = [currentEdge.source, currentEdge.target];
  do {
    currentEdge = findNextNode(outerEdges, nextPoint);

    nextPoint = points.find(p => isEqual(currentEdge.source, p)) ? currentEdge.target : currentEdge.source;
    points.push(nextPoint);
    remove(outerEdges, e => isEqual(e.source, currentEdge.source) && isEqual(e.target, currentEdge.target));
  } while(outerEdges.length > 1);

  // remove old edges/faces
  remove(
    state.editor.links,
    l => edgeToFaces.has(l.index) && edgeToFaces.get(l.index).faces.length !== 1
  );
  remove(state.editor.faces, f => f.selected);

  const newFace = {
    "id": selected[0].id,
    "nodes": points,
    "background": selected[0].background,
  };
  state.editor.faces.push(newFace);

  return state;
};
