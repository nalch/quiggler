import { getEdges, connectEdges } from "../../graph-utils";

export const addLine = (state, direction) => {
  // example: column at index 1
  const index = 1;

  state.editor.width += 1;

  // create new nodes/faces
  const newNodes = [];
  const newFaces = [];
  const startId = Math.max(...state.editor.faces.map(f => f.id)) + 1;
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
    const sortedNodes = connectEdges(
      Array.from(getEdges([f]).entries())
        .map(([edgeId, edgeInfo]) => edgeInfo[0])
    );

    const facePoints = [];
    for (const [idx, point] of outerEdges.entries()) {
      const nextPoint = idx < outerEdges.length - 2 ? outerEdges[idx+1] : outerEdges[0];
      console.log(point, " -> ", nextPoint);
      // index -> right
      if (point[0] === index && nextPoint[0] > idx) {
        facePoints.push([point[0], point[1]]);
      }

      // left -> right
      console.log("move");
      facePoints.push([point[0] <= index ? point[0] : point[0] + 1, point[1]]);
    }

    f.nodes = facePoints;
  });

  // add new faces
  for (let row=0; row < state.editor.height; row++) {
    newFaces.push({
      "id": startId + row,
      "nodes": [[index, row], [index + 1, row], [index + 1, row + 1], [index, row + 1]],
      "background": "#eee",
    });
  }
  state.editor.faces.splice(0, 0, ...newFaces);

  return state;
};
