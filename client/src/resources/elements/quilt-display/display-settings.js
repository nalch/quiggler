export const nodeId = node => `node-${node.id[0]}-${node.id[1]}`;
export const linkId = link => `link-${link.index}`;
export const faceId = face => `face-${face.id}`;

export const faceBackground = face => {
  if (face.background) {
    return face.background;
  }

  return "#fff";  // todo: transparent pattern
}

export const nodeRadius = (node, mode) => {
  if (node.selected) {
    return 3;
  }

  if (mode === "node") {
    return 1.5;
  }

  return 0.5;
}
