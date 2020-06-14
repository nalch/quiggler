import isEqual from "lodash/isEqual";
import remove from "lodash/remove";

import { connectEdges, getEdges } from "../../graph-utils";

export const merge = state => {
  const selected = state.editor.faces.filter(f => f.selected);

  const edgeInfo = getEdges(selected);
  const edges = Array.from(edgeInfo.values())
    .filter(([_, faces]) => faces.length === 1)
    .map(([edge, _]) => edge);

  remove(state.editor.faces, f => f.selected);

  const newFace = {
    "id": selected[0].id,
    "nodes": connectEdges(edges),
    "background": selected[0].background,
  };
  state.editor.faces.push(newFace);

  return state;
};
