import cloneDeep from "lodash/cloneDeep";
import remove from "lodash/remove";

import { compareNodes } from "../../graph-utils";

export const splitSquare = (oldState, direction) => {
  const state = JSON.parse(JSON.stringify(oldState));

  const selected = state.editor.faces.filter(f => f.selected && f.nodes.length > 3);

  selected.forEach(f => {
    if (f.nodes.length === 4) {
      const sortedNodes = cloneDeep(f.nodes).sort(compareNodes);

      remove(state.editor.faces, newFace => newFace.id === f.id);

      // edge start, end, nodes1, nodes2
      let coordinates;
      if (direction) {
        coordinates = [
          sortedNodes[0],
          sortedNodes[3],
          [sortedNodes[0], sortedNodes[1], sortedNodes[3]],
          [sortedNodes[0], sortedNodes[3], sortedNodes[2]]
        ];
      } else {
        coordinates = [
          sortedNodes[1],
          sortedNodes[2],
          [sortedNodes[0], sortedNodes[1], sortedNodes[2]],
          [sortedNodes[1], sortedNodes[2], sortedNodes[3]]
        ];
      }
      state.editor.links.push({"source": coordinates[0], "target": coordinates[1]});
      state.editor.faces.push({
        "id": f.id,
        "nodes": coordinates[2],
        "background": f.background,
      });
      state.editor.faces.push({
        "id": f.id + "-2",
        "nodes": coordinates[3],
        "background": f.background,
      });
    }
  });

  return state;
};
