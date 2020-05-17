import isEqual from "lodash/isEqual";
import remove from "lodash/remove";

export const findEdge = (links, n1, n2) => {
  return links.find(l =>
    (isEqual(l.source, n1) && isEqual(l.target, n2)) ||
    (isEqual(l.source, n2) && isEqual(l.target, n1))
  );
};

export const findNextNode = (links, nextNode) => {
  return links.find(l =>
    isEqual(l.source, nextNode) || isEqual(l.target, nextNode)
  );
};

export const compareNodes = (n1, n2) => {
  if (n1[1] !== n2[1]) {
    return n1[1] - n2[1];
  }
  return n1[0] - n2[0];
};

export const isRect = nodes => {
  const xLimits = [Math.min(...nodes.map(n => n[0])), Math.max(...nodes.map(n => n[0]))];
  const yLimits = [Math.min(...nodes.map(n => n[1])), Math.max(...nodes.map(n => n[1]))];

  if (nodes.every(n => xLimits.includes(n[0]) || yLimits.includes(n[1]))) {
    return [
      [xLimits[0], yLimits[0]],
      [xLimits[1], yLimits[0]],
      [xLimits[0], yLimits[1]],
      [xLimits[1], yLimits[1]]
    ];
  }

  return null;
};

export const computeOuterEdges = (links, f) => {
  const nodes = f.nodes;

  const edgeToFaces = new Map();
  for (let i=0; i<nodes.length; i++) {
    const node = nodes[i];
    let nextNode = (i<nodes.length-1) ? nextNode = nodes[i + 1] : nextNode = nodes[0];
    const edge = findEdge(links, node, nextNode);

    if (!edgeToFaces.get(edge.index)) {
      edgeToFaces.set(edge.index, {"edge": edge, "faces": []});
    }
    edgeToFaces.get(edge.index).faces.push(f);
  }

  const outerEdges = Array.from(edgeToFaces.values()).filter(i => i.faces.length === 1).map(i => i.edge);
  let currentEdge = outerEdges.pop();
  let nextPoint = currentEdge.target;
  const points = [currentEdge.source, currentEdge.target];
  do {
    currentEdge = findNextNode(outerEdges, nextPoint);

    nextPoint = points.find(p => isEqual(currentEdge.source, p)) ? currentEdge.target : currentEdge.source;
    points.push(nextPoint);
    remove(outerEdges, e => isEqual(e.source, currentEdge.source) && isEqual(e.target, currentEdge.target));
  } while(outerEdges.length > 1);

  return points;
}

export const computeNeighbours = (links, face) => {
  // neighbouring edges and node circle for faces
  console.log(computeOuterEdges(links, face));
};
