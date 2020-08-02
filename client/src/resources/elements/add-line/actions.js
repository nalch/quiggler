import { LogManager } from "aurelia-framework";

import { getEdges, connectEdges, polyIntersect } from "../../graph-utils";

const logger = LogManager.getLogger("AddLineAction");

export const addLine = (state, index) => {
  state.editor.width += 1;

  // create new nodes/faces
  const newNodes = [];
  const newFaces = [];
  const startId = Math.max(...state.editor.faces.map(f => Number.isInteger(f.id) ? f.id : -1)) + 1;
  for (let row=0; row <= state.editor.height; row++) {
    newNodes.push({
      id: [state.editor.width, row],
      cx: state.editor.width,
      cy: row
    });
  }
  state.editor.nodes.splice(0, 0, ...newNodes);

  // shift faces right that are right from the insertion index
  const faces = state.editor.faces.filter(f => Math.min(...f.nodes.map(n => n[0])) >= index);
  faces.forEach(f => {
    f.nodes = f.nodes.map(n => [n[0] + 1, n[1]]);
  });

  // find faces around the index
  const stretchFaces = state.editor.faces.filter(f => {
    const coords = f.nodes.map(n => n[0]);
    return Math.min(...coords) < index && Math.max(...coords) > index;
  });

  stretchFaces.forEach(f => {
    logger.debug("stretching face", f);
    const sortedNodes = connectEdges(
      Array.from(getEdges([f]).entries())
        .map(([edgeId, edgeInfo]) => edgeInfo[0])
    );

    const newFace = [];
    sortedNodes.forEach((point, idx) => {
      const firstPoint = idx === 0;
      const lastPoint = idx === (sortedNodes.length - 1)
      const nextPoint = lastPoint ? sortedNodes[0] : sortedNodes[idx+1];
      const nextRight = nextPoint[0] > index;
      const nextLeft = nextPoint[0] < index;
      const onIndex = point[0] === index;

      logger.debug(point, " -> ", nextPoint);

      if (firstPoint && onIndex) {
        logger.debug("Adding first point on index");
        newFace.push([point[0], point[1]]);
      }

      if (point[0] < index) {
        logger.debug("Copy point strictly left to the index");
        newFace.push([point[0], point[1]]);
      }

      if (point[0] >= index) {
        logger.debug("Move point on or right to the index");
        newFace.push([point[0] + 1, point[1]]);
      }

      if (lastPoint && onIndex){
        newFace.push([point[0], point[1]])
      }
    });

    f.nodes = newFace;
  });

  // add new faces
  for (let row=0; row < state.editor.height; row++) {
    const newNodes = [[index, row], [index + 1, row], [index + 1, row + 1], [index, row + 1]];
    const intersects = stretchFaces.some(f => polyIntersect(f.nodes, newNodes));
    if (!intersects) {
      newFaces.push({
        "id": startId + row,
        "nodes": newNodes,
        "background": "#eee",
      });
    }
  }
  state.editor.faces.splice(0, 0, ...newFaces);

  return state;
};
