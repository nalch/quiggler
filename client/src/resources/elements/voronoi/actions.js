import * as d3 from "d3";

export const triangulate = oldState => {
  const state = JSON.parse(JSON.stringify(oldState));

  const selected = state.editor.faces.filter(f => f.selected && f.nodes.length > 3);
//      state.editor.links.push({"source": coordinates[0], "target": coordinates[1]});
//      state.editor.faces.push({
//        "id": f.id,
//        "nodes": coordinates[2],
//        "background": f.background,
//      });
//      state.editor.faces.push({
//        "id": f.id + "-2",
//        "nodes": coordinates[3],
//        "background": f.background,
//      });
//    }
//  });

  const voronoi = d3.voronoi();
  selected.forEach(f => {
    console.log(voronoi.links(f.nodes));
    voronoi.triangles(f.nodes).forEach(t => {
      state.editor.faces.push({
        "id": Math.floor(Math.random() * 99999),
        "nodes": t,
        "background": f.background,
      });
    });
  });

  state.editor.faces = state.editor.faces.filter(f => !f.selected);

  return state;
};
