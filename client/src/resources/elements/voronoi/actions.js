import { Delaunay } from "d3-delaunay";

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



  selected.forEach(f => {
    const delaunay = Delaunay.from(f.nodes);
//    console.log(voronoi.triangles(f.nodes).length);
    for (let triangle of delaunay.trianglePolygons()) {
      console.log(triangle);
      state.editor.faces.push({
        "id": Math.floor(Math.random() * 99999),
        "nodes": triangle,
        "background": f.background,
      });
    };
  });

  state.editor.faces = state.editor.faces.filter(f => !f.selected);

  return state;
};
