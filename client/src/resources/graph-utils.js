import isEqual from "lodash/isEqual";

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
