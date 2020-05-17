import cloneDeep from "lodash/cloneDeep";
import remove from "lodash/remove";

import { compareNodes, isRect } from "../../graph-utils";

export const splitSquare = (oldState, direction) => {
  const state = JSON.parse(JSON.stringify(oldState));

  const selected = state.editor.faces.filter(f => f.selected && f.nodes.length > 3);

  selected.forEach(f => {
    const boundingRect = isRect(f.nodes);
    if (boundingRect) {
      remove(state.editor.faces, newFace => newFace.id === f.id);

      // edge start, end, nodes1, nodes2
      let coordinates;
      if (direction) {
        coordinates = [
          boundingRect[0],
          boundingRect[3],
          [boundingRect[0], boundingRect[1], boundingRect[3]],
          [boundingRect[0], boundingRect[3], boundingRect[2]]
        ];
      } else {
        coordinates = [
          boundingRect[1],
          boundingRect[2],
          [boundingRect[0], boundingRect[1], boundingRect[2]],
          [boundingRect[1], boundingRect[2], boundingRect[3]]
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
