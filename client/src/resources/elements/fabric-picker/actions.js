export const setFabric = (state, fabric) => {
  state.editor.faces.filter(f => f.selected).forEach(face => {
    face.background = "url(#pattern-" + fabric + ")";
  });
  return state;
};
