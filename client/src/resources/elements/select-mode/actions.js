export const selectMode = (state, mode) => {
  state.editor.mode = mode;
  return state;
};
