# Graphs

A **graph** is a collection of **vertices** (nodes) connected by **edges**. Formally, a graph `G = (V, E)` where `V` is a set of vertices and `E` is a set of edges, each connecting a pair of vertices. Graphs are the most general data structure — trees, linked lists, and grids are all special cases — and they model essentially any system of relationships: social networks, road maps, web pages, dependencies between tasks, network packet routes, recommendation systems, and biological pathways.

This article covers how graphs are represented and classified. Graph **algorithms** (BFS, DFS, shortest path, topological sort, MST) live in the Algorithms section; this article gives the structural foundation those algorithms operate on.

## Terminology

- **Vertex / node** — a point in the graph.
- **Edge** — a connection between two vertices. Written `(u, v)`.
- **Adjacent / neighbor** — two vertices connected by an edge.
- **Degree** — number of edges touching a vertex. In directed graphs, split into **in-degree** and **out-degree**.
- **Path** — sequence of vertices connected by edges.
- **Cycle** — a path that starts and ends at the same vertex.
- **Connected** — every pair of vertices is reachable from every other (undirected).
- **Strongly connected** — same property in a directed graph.
- **Component** — a maximal connected subgraph.
- **Simple graph** — no self-loops, no duplicate edges.

## Memory Representation

There are three standard ways to store a graph. The right choice depends on graph **density** (how many edges relative to V²) and the operations the algorithm performs most.

### Adjacency List
For each vertex, store a list of its neighbors. The default choice for most interview problems and most real-world graphs (which are sparse).

```
   A ── B
   │    │
   C ── D

Adjacency list:
   A: [B, C]
   B: [A, D]
   C: [A, D]
   D: [B, C]
```

### Adjacency Matrix
A V × V matrix where `matrix[i][j]` indicates whether an edge exists between `i` and `j` (1 / 0 for unweighted, the weight itself for weighted). Best for dense graphs and when O(1) edge-existence queries are critical.

```
       A  B  C  D
   A [ 0  1  1  0 ]
   B [ 1  0  0  1 ]
   C [ 1  0  0  1 ]
   D [ 0  1  1  0 ]
```

### Edge List
A flat list of `(u, v)` pairs (or `(u, v, weight)` triples). Useful when the algorithm processes all edges as a unit — Kruskal's MST, Bellman-Ford, disjoint-set-based problems.

```
[(A, B), (A, C), (B, D), (C, D)]
```

## Initialization in Python

### Adjacency list with `defaultdict`

```python
from collections import defaultdict

graph = defaultdict(list)
graph['A'].append('B')
graph['B'].append('A')   # undirected: add both directions
graph['A'].append('C')
graph['C'].append('A')
```

### Weighted adjacency list

```python
graph = defaultdict(list)
graph['A'].append(('B', 5))    # edge A→B with weight 5
graph['B'].append(('A', 5))
```

### Adjacency matrix

```python
n = 4
matrix = [[0] * n for _ in range(n)]
matrix[u][v] = 1
matrix[v][u] = 1   # undirected
```

### Edge list

```python
edges = [(0, 1, 5), (0, 2, 3), (1, 2, 2), (2, 3, 4)]
```

For interview problems where vertices are integers `0..n−1`, an adjacency list as `list[list[int]]` is often cleaner than a `defaultdict`:

```python
graph = [[] for _ in range(n)]
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)
```

## Types of Graphs

### By Edge Direction
- **Undirected** — edges have no direction. `(u, v)` and `(v, u)` are the same edge. Friendships, road networks (mostly), electrical circuits.
- **Directed (digraph)** — edges have direction. Web links, Twitter follows, task dependencies.

### By Edge Weights
- **Unweighted** — edges are uniform. BFS finds shortest paths.
- **Weighted** — edges carry numeric values (cost, distance, capacity). Dijkstra, Bellman-Ford, and similar algorithms apply.

### By Cycles
- **Cyclic** — contains at least one cycle.
- **Acyclic** — no cycles.
- **DAG (Directed Acyclic Graph)** — directed and acyclic. Models dependencies, build systems, course prerequisites, version control history. Topological sort is the defining algorithm for DAGs.
- **Tree** — a connected, undirected, acyclic graph. Has exactly `V − 1` edges.

### By Density
- **Sparse** — `|E|` is close to `|V|`. Most real-world graphs (social networks, web). Use adjacency list.
- **Dense** — `|E|` is close to `|V|²`. Use adjacency matrix.

### By Connectivity
- **Connected** (undirected) — every vertex reachable from every other.
- **Strongly connected** (directed) — directed path from every vertex to every other.
- **Weakly connected** (directed) — connected if direction is ignored.
- **Disconnected** — splits into multiple components.

### Special Graphs
- **Bipartite** — vertices split into two disjoint sets, edges only go between sets. Models matchings (jobs to workers, students to schools). Two-colorable.
- **Complete** — every pair of vertices is connected. Has `V(V−1)/2` edges.
- **Multigraph** — allows multiple edges between the same pair.
- **Self-loop** — an edge from a vertex to itself.

## Operations

| Operation | Description |
|-----------|-------------|
| Add vertex | Add a new node with no edges |
| Add edge | Connect two existing vertices |
| Remove edge | Disconnect a pair of vertices |
| Check edge | Test whether `(u, v) ∈ E` |
| Neighbors | List all vertices adjacent to `v` |
| Degree | Count edges touching `v` |

```python
# Adjacency list operations
graph[u].append(v)              # add edge
graph[u].remove(v)              # remove edge — O(degree)
v in graph[u]                   # check edge — O(degree)
neighbors = graph[u]            # O(1) reference
degree = len(graph[u])
```

The algorithms built on top of these — traversal (BFS/DFS), shortest paths (Dijkstra, Bellman-Ford, Floyd-Warshall), spanning trees (Kruskal, Prim), topological sort, cycle detection, strongly connected components — are covered in the Algorithms section.

## Time and Space Complexity

For a graph with `V` vertices and `E` edges:

| Operation | Adjacency List | Adjacency Matrix | Edge List |
|-----------|----------------|------------------|-----------|
| Storage | O(V + E) | O(V²) | O(E) |
| Add vertex | O(1) | O(V²) (resize) | O(1) |
| Add edge | O(1) | O(1) | O(1) |
| Remove edge | O(degree) | O(1) | O(E) |
| Check edge exists | O(degree) | O(1) | O(E) |
| Iterate neighbors of `v` | O(degree(v)) | O(V) | O(E) |
| Iterate all edges | O(V + E) | O(V²) | O(E) |

**Summary of when to use which:**

- **Adjacency list** — default for sparse graphs, almost all interview problems, almost all real-world graphs.
- **Adjacency matrix** — dense graphs, small `V` (≤ a few thousand), or when O(1) edge-existence queries dominate the workload.
- **Edge list** — algorithms that operate on edges as the unit of work (Kruskal's MST, Bellman-Ford, problems involving sorting edges by weight).

## Auxiliary Structure: Union-Find

Many graph problems involve connectivity questions that don't require traversal — "are these two vertices in the same component?", "does adding this edge create a cycle?". The **Union-Find** (Disjoint Set Union) structure answers both in nearly constant time and is essential for Kruskal's MST and a class of problems often listed under graphs (Redundant Connection, Number of Connected Components, Accounts Merge). Worth knowing it exists; the implementation is short.

## Advantages

- The most general data structure — models almost any relational system.
- Rich algorithmic toolkit covering reachability, shortest paths, flows, matchings, scheduling, ranking.
- Adjacency list keeps memory linear in the input size.
- Foundation for problems across networking, mapping, biology, ML, compilers, and database query planning.

## Limitations

- Many natural questions on graphs are NP-hard (Hamiltonian path, graph coloring, traveling salesman).
- Choice of representation has large performance consequences — picking matrix for a sparse graph wastes memory; picking list for a dense graph slows edge queries.
- Cycles, multiple components, and direction all add edge cases that turn simple-sounding problems into bug magnets.
- Memory can blow up on dense graphs (V² for the matrix, up to V² for the list).
- Visualization beyond a few hundred nodes is impractical without specialized tools.

## Common Interview Problems

### Easy
- Find if Path Exists in Graph
- Find Center of Star Graph
- Find the Town Judge
- Find if Path Exists in Graph
- Find the Difference of Two Arrays

### Medium
- Number of Islands
- Clone Graph
- Course Schedule (cycle detection)
- Course Schedule II (topological sort)
- Pacific Atlantic Water Flow
- Surrounded Regions
- Walls and Gates
- Word Ladder
- Minimum Genetic Mutation
- Network Delay Time (Dijkstra)
- Cheapest Flights Within K Stops
- Path with Minimum Effort
- All Paths From Source to Target
- Reconstruct Itinerary
- Evaluate Division
- Is Graph Bipartite?
- Possible Bipartition
- Redundant Connection (Union-Find)
- Number of Connected Components in an Undirected Graph
- Graph Valid Tree
- Minimum Number of Vertices to Reach All Nodes
- Number of Provinces
- Keys and Rooms
- Accounts Merge

### Hard
- Word Ladder II
- Alien Dictionary (topological sort)
- Critical Connections in a Network (Tarjan's bridges)
- Swim in Rising Water
- Longest Increasing Path in a Matrix
- Minimum Cost to Make at Least One Valid Path in a Grid (0-1 BFS)
- Bus Routes
- Number of Ways to Arrive at Destination
- Couples Holding Hands
- Optimize Water Distribution in a Village (MST)
- Reachable Nodes In Subdivided Graph
- Shortest Path Visiting All Nodes
- Minimum Number of Days to Disconnect Island
