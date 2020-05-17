export const selectMode = (oldState, mode) => {
  const state = JSON.parse(JSON.stringify(oldState));
  state.editor.mode = mode;
  return state;
};
