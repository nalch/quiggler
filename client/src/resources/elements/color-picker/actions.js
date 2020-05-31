export const setColour = (state, colour) => {
  const selected = state.editor.faces.filter(f => f.selected);
  selected.forEach(face => {
    face.background = colour;
  });
  return state;
};
