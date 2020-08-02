import remove from "lodash/remove";

import { createGrid } from "./test-data";
import { addLine } from "../../../src/resources/elements/add-line/actions";

describe("AddLine", () => {
  let editor;

  beforeEach(() => {
    editor = createGrid(5, 5);
  });

  it("should create proper test data", () => {
    expect(editor.nodes.length).toBe(36);
    expect(editor.faces.length).toBe(25);
  });

  it("should work for unrelated faces", () => {
    const newEditor = addLine({editor: editor}, 1).editor;
    expect(newEditor.width).toBe(6);
    expect(newEditor.height).toBe(5);
    expect(newEditor.nodes.length).toBe(42);
    expect(newEditor.faces.length).toBe(30);

    const newNodes = [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1]].map(node => {
      return {
        cx: node[0],
        cy: node[1],
        id: node
      }
    });
    expect(newEditor.nodes).toEqual(expect.arrayContaining(newNodes));

    const newFaces = [];
    for (let row=0; row < 5; row++) {
      const newNodes = [[1, row], [2, row], [2, row + 1], [1, row + 1]];
      newFaces.push({
        "id": row,
        "nodes": newNodes,
        "background": "#eee",
      });
    }
    expect(newEditor.faces).toEqual(expect.arrayContaining(newFaces));
  });

  it("should work for faces with index points", () => {
    remove(editor.faces, f => ["0-0", "1-0"].includes(f.id));
    editor.faces.push({
      id: "0-0",
      background: "test",
      nodes: [[0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [0, 1]]
    });

    const newEditor = addLine({editor: editor}, 1).editor;

    expect(newEditor.nodes.length).toBe(42);
    expect(newEditor.faces.length).toBe(28);

    const newFace = [{
      id: "0-0",
      background: "test",
      nodes: [[0,0],[2,0],[3,0],[3,1],[2,1],[0,1]]
    }];
    expect(newEditor.faces).toEqual(expect.arrayContaining(newFace));
  });

  it("should work for faces without index points", () => {
    remove(editor.faces, f => ["0-0", "1-0"].includes(f.id));
    editor.faces.push({
      id: "0-0",
      background: "test",
      nodes: [[0, 0], [2, 0], [2, 1], [0, 1]]
    });

    const newEditor = addLine({editor: editor}, 1).editor;

    expect(newEditor.nodes.length).toBe(42);
    expect(newEditor.faces.length).toBe(28);

    const newFace = [{
      id: "0-0",
      background: "test",
      nodes: [[0,0],[3,0],[3,1],[0,1]]
    }];
    expect(newEditor.faces).toEqual(expect.arrayContaining(newFace));
  });

  it("should work for faces along index points", () => {
    remove(editor.faces, f => ["0-0", "1-0", "1-1", "1-2", "0-2"].includes(f.id));
    editor.faces.push({
      id: "0-0",
      background: "test",
      nodes: [[0,0],[1,0],[2,0],[2,1],[2,2],[2,3],[1,3],[0,3],[0,2],[1,2],[1,1],[0,1]]
    });

    const newEditor = addLine({editor: editor}, 1).editor;

    expect(newEditor.nodes.length).toBe(42);
    expect(newEditor.faces.length).toBe(24);

    const newFace = [{
      id: "0-0",
      background: "test",
      nodes: [[0,0],[2,0],[3,0],[3,1],[3,2],[3,3],[2,3],[0,3],[0,2],[2,2],[2,1],[0,1]]
    }];
    expect(newEditor.faces).toEqual(expect.arrayContaining(newFace));
  });

  it("should work for start on index", () => {
    remove(editor.faces, f => ["0-0", "1-0"].includes(f.id));
    editor.faces.push({
      id: "0-0",
      background: "middle",
      nodes: [[1,1],[2,1],[1,0],[0,0]]
    });
    editor.faces.push({
      id: "1-0",
      background: "test",
      nodes: [[0,0],[1,1],[0,1]]
    });
    editor.faces.push({
      id: "1-0-2",
      background: "test",
      nodes: [[1,0],[2,0],[2,1]]
    });

    const newEditor = addLine({editor: editor}, 1).editor;

    expect(newEditor.nodes.length).toBe(42);
    expect(newEditor.faces.length).toBe(30);

    const expectedFaces = [
      {
        id: "0-0",
        background: "middle",
        nodes: [[1,1],[2,1],[3,1],[2,0],[0,0]]
      },
      {
        id: "1-0",
        background: "test",
        nodes: [[0,0],[1,1],[0,1]]
      },
      {
        id: "1-0-2",
        background: "test",
        nodes: [[2,0],[3,0],[3,1]]
      }
    ];
    expect(newEditor.faces).toEqual(expect.arrayContaining(expectedFaces));
  });

  it("should work for end on index", () => {
    remove(editor.faces, f => ["0-0", "1-0"].includes(f.id));
    editor.faces.push({
      id: "0-0",
      background: "middle",
      nodes: [[0,0],[1,0],[2,1],[1,1]]
    });
    editor.faces.push({
      id: "1-0",
      background: "test",
      nodes: [[0,0],[1,1],[0,1]]
    });
    editor.faces.push({
      id: "1-0-2",
      background: "test",
      nodes: [[1,0],[2,0],[2,1]]
    });

    const newEditor = addLine({editor: editor}, 1).editor;

    expect(newEditor.nodes.length).toBe(42);
    expect(newEditor.faces.length).toBe(30);  // todo: test

    const newFaces = [
      {
        id: "0-0",
        background: "middle",
        nodes: [[0,0],[2,0],[3,1],[2,1],[1,1]]
      },
      {
        id: "1-0",
        background: "test",
        nodes: [[0,0],[1,1],[0,1]]
      },
      {
        id: "1-0-2",
        background: "test",
        nodes: [[2,0],[3,0],[3,1]]
      }
    ];
    expect(newEditor.faces).toEqual(expect.arrayContaining(newFaces));
  });

  it("should work for lines over index", () => {
    remove(editor.faces, f => ["0-0", "1-0"].includes(f.id));
    editor.faces.push({
      id: "0-0",
      background: "d1",
      nodes: [[0,0],[2,0],[2,1]]
    });
    editor.faces.push({
      id: "1-0",
      background: "d2",
      nodes: [[0,0],[2,1],[0,1]]
    });

    const newEditor = addLine({editor: editor}, 1).editor;

    expect(newEditor.nodes.length).toBe(42);
    expect(newEditor.faces.length).toBe(29);

    const newFaces = [
      {
        id: "0-0",
        background: "d1",
        nodes: [[0,0],[3,0],[3,1]]
      },
      {
        id: "1-0",
        background: "d2",
        nodes: [[0,0],[3,1],[0,1]]
      }
    ];
    expect(newEditor.faces).toEqual(expect.arrayContaining(newFaces));
  });
});
