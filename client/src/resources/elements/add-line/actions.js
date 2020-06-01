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

    if (row < state.editor.height) {
      newFaces.push({
        "id": startId + row,
        "nodes": [[index, row], [index + 1, row], [index + 1, row + 1], [index, row + 1]],
        "background": "#eee",
      });
    }
  }
  state.editor.nodes.splice(0, 0, ...newNodes);

  // shift faces right that are right from the insertion index
  const faces = state.editor.faces.filter(f => Math.min(...f.nodes.map(n => n[0])) >= index);
  faces.forEach(f => {
    f.nodes = f.nodes.map(n => [n[0] + 1, n[1]]);
  });

  // add new faces
  state.editor.faces.splice(0, 0, ...newFaces);

  return state;
};
