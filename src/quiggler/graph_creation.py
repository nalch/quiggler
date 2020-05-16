import networkx as nx
from networkx import set_node_attributes

from quiggler.constants import SQUARE, TRIANGLE_LEFT, TRIANGLE_RIGHT


def create_graph(type, width, height):
    if type == SQUARE:
        graph = nx.grid_2d_graph(width, height)
        faces = create_square_faces(width, height)
    elif type == TRIANGLE_LEFT:
        graph = nx.triangular_lattice_graph(width, height, with_positions=True)
        faces = []
    else:
        raise ValueError("No valid graph type passed.")

    set_node_attributes(graph, {
        n: {"cx": n[0], "cy": n[1]}
        for n in graph.nodes
    })

    return graph, faces


def create_square_faces(width, height):
    return [
        {
            "id": x + y * width,
            "nodes": [(x, y), (x + 1, y), (x + 1, y + 1), (x, y + 1)],
            "background": "#eee"
        }
        for y in range(height - 1)
        for x in range(width - 1)
    ]
