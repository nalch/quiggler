import isEqual from "lodash/isEqual";
import remove from "lodash/remove";
import PolyBool from "polybooljs";

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

export const getEdges = faces => {
  return faces.reduce((edgeMap, face) => {
    const nodes = face.nodes;
    for (let i=1; i<nodes.length; i++) {
      const edge = [nodes[i-1], nodes[i]].sort(compareNodes);
      const edgeId = `${edge[0]}->${edge[1]}`;
      if (!edgeMap.has(edgeId)) {
        edgeMap.set(edgeId, [edge, []]);
      }
      edgeMap.get(edgeId)[1].push(face);
    }

    const edge = [nodes[nodes.length - 1], nodes[0]].sort(compareNodes);
    const edgeId = `${edge[0]}->${edge[1]}`;
    if (!edgeMap.has(edgeId)) {
      edgeMap.set(edgeId, [edge, []]);
    }
    edgeMap.get(edgeId)[1].push(face);

    return edgeMap;
  }, new Map());
};

export const connectEdges = edges => {
  const nodes = [edges[0][0], edges[0][1]];
  let currentNode = nodes[1];
  edges.shift();

  const max = edges.length - 1;
  for (let i=0; i<max; i++) {
    const nextEdge = remove(edges, e => isEqual(e[0], currentNode) || isEqual(e[1], currentNode))[0];

    currentNode = isEqual(nextEdge[0], currentNode) ? nextEdge[1] : nextEdge[0];
    nodes.push(currentNode);
  }

  return nodes;
};

export const polyIntersect = (p1, p2) => {
  const intersection = PolyBool.intersect({
    regions: [p1],
    inverted: false
  }, {
    regions: [p2],
    inverted: false
  });
  return intersection.regions.length !== 0;
};
