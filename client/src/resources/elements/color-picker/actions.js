import produce from "immer";

export const setColour = (oldState, colour) => {
  const state = JSON.parse(JSON.stringify(oldState));
  state.editor.faces.filter(f => f.selected).forEach(face => {
    face.background = colour;
  });
  return state;
};
