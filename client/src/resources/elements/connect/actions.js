import isEqual from "lodash/isEqual";
import remove from "lodash/remove";

export const connect = state => {
  const selected = state.editor.nodes.filter(f => f.selected);

  console.log(selected);

  return state;
};
