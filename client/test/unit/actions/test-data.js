const createGrid = (width, height) =>  {
  const nodes = [];
  for (let row=0; row<width+1; row++) {
    for (let col=0; col<height+1; col++) {
      nodes.push({"cx": col, "cy": row, "id": [col, row]});
    }
  }

  const faces = [];
  for (let row=0; row<width; row++) {
    for (let col=0; col<height; col++) {
      faces.push(
        {
          background: "#eee",
          nodes: [[col, row], [col+1, row], [col+1, row+1], [col, row+1]],
          id: `${col}-${row}`
      });
    }
  }

  return {
    width: width,
    height: height,
    nodes: nodes,
    faces: faces
  }
};

export { createGrid };
