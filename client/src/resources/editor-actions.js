import isEqual from "lodash/isEqual";

export const loadGraph = (oldState, data) => {
  const state = JSON.parse(JSON.stringify(oldState));
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

export const selectFace = (oldState, face) => {
  const state = JSON.parse(JSON.stringify(oldState));

  const newFace = state.editor.faces.find(f => f.id === face.id);
  newFace.selected = !newFace.selected;

  return state;
};

export const selectNode = (oldState, node) => {
  const state = JSON.parse(JSON.stringify(oldState));

  const selectedNode = state.editor.nodes.find(n => isEqual(n.id, node.id));
  selectedNode.selected = !selectedNode.selected;

  return state;
};

export const selectAll = oldState => {
  const state = JSON.parse(JSON.stringify(oldState));
  state.editor.faces.forEach(f => f.selected = true);
  return state;
};

export const deselect = oldState => {
  const state = JSON.parse(JSON.stringify(oldState));
  state.editor.faces.forEach(f => f.selected = false);
  return state;
};
