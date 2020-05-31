import cloneDeep from "lodash/cloneDeep";
import remove from "lodash/remove";

import { isRect } from "../../graph-utils";

export const splitSquare = (state, direction) => {
  const selected = state.editor.faces.filter(f => f.selected && f.nodes.length > 3);

  selected.forEach(f => {
    const boundingRect = isRect(f.nodes);
    if (boundingRect) {
      remove(state.editor.faces, newFace => newFace.id === f.id);

      // edge start, end, nodes1, nodes2
      let coordinates;
      if (direction) {
        // direction: \
        coordinates = [
          boundingRect[0],
          boundingRect[3],
          f.nodes.filter(n => n[0] === boundingRect[1][0] || n[1] === boundingRect[1][1]),
          f.nodes.filter(n => n[0] === boundingRect[2][0] || n[1] === boundingRect[2][1])
        ];
      } else {
        // direction: /
        coordinates = [
          boundingRect[1],
          boundingRect[2],
          f.nodes.filter(n => n[0] === boundingRect[0][0] || n[1] === boundingRect[0][1]),
          f.nodes.filter(n => n[0] === boundingRect[3][0] || n[1] === boundingRect[3][1])
        ];
      }

      // add new elements
      state.editor.links.push({"source": coordinates[0], "target": coordinates[1]});
      state.editor.faces.push({
        "id": f.id,
        "nodes": coordinates[2],
        "background": f.background,
      });
      state.editor.faces.push({
        "id": Math.max(...state.editor.faces.map(f => f.id)) + 1,
        "nodes": coordinates[3],
        "background": f.background,
      });
    }
  });

  return state;
};
