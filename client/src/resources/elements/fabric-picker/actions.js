export const setFabric = (oldState, fabric) => {
  const state = JSON.parse(JSON.stringify(oldState));
  state.editor.faces.filter(f => f.selected).forEach(face => {
    face.background = "url(#pattern-" + fabric + ")";
  });
  return state;
};
