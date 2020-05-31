import isEqual from "lodash/isEqual";

export const loadGraph = (state, data) => {
  state.editor.width = data.width;
  state.editor.height = data.height;
  state.editor.fabrics = data.fabrics;

  const graphData = JSON.parse(data.json);
  state.editor.nodes = graphData.nodes;
  state.editor.links = graphData.links;
  state.editor.faces = graphData.faces;

  state.editor.originalGraph = JSON.parse(data.json);

  return state;
};

export const selectFace = (state, face) => {
  face.selected = !face.selected;
  return state;
};

export const selectNode = (state, node) => {
  node.selected = !node.selected;
  return state;
};

export const selectAll = state => {
  let elements;
  if (state.editor.mode === "face") {
    elements = state.editor.faces;
  } else if (state.editor.mode === "node") {
    elements = state.editor.nodes;
  }

  elements.forEach(e => e.selected = true);
  return state;
};

export const deselect = state => {
  state.editor.faces.forEach(f => f.selected = false);
  state.editor.nodes.forEach(n => n.selected = false);
  return state;
};
