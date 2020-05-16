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
}

export const compareNodes = (n1, n2) => {
  if (n1[1] !== n2[1]) {
    return n1[1] - n2[1];
  }
  return n1[0] - n2[0];
};
