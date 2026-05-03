# Dijkstra's Algorithm

**Dijkstra's algorithm** finds the **shortest path** from a starting node to every other node in a graph where edges have **non-negative weights**. It is the standard tool for shortest-path problems in road networks, telecommunication routing, and any problem where edges represent costs (distance, time, money) rather than just connections.

Dijkstra is conceptually a generalization of breadth-first search. BFS gives the path with the **fewest edges** in an unweighted graph; Dijkstra gives the path with the **smallest total weight** in a weighted graph. The two algorithms have nearly identical structure — the only meaningful change is the data structure: BFS uses a queue, Dijkstra uses a priority queue.

A few terms used throughout:

- **Weighted graph** — a graph where each edge has a numeric value (its weight or cost).
- **Edge weight** — the cost of traversing that edge.
- **Path weight** — the sum of edge weights along the path.
- **Shortest path** — the path between two nodes with the smallest total weight.
- **Relax** — update a node's tentative distance because a shorter path has been found.

## Why BFS Doesn't Work on Weighted Graphs

In an unweighted graph, BFS finds the shortest path because it explores nodes in order of distance from the source. The first time it reaches a node, that's necessarily through the fewest-edge path.

In a weighted graph, "fewer edges" is not the same as "smaller total weight." A two-hop path with weights 1 + 1 = 2 is shorter than a one-hop path with weight 100. BFS would commit to the one-hop path because it reached the destination first; Dijkstra correctly waits until it has explored the actual shortest path.

```
        100
   A ─────────── B
   │             │
 1 │             │ 1
   ▼             ▼
   C ─────────── D
        1

BFS from A finds B in 1 hop with cost 100.
Dijkstra finds B via C → D → B with cost 3.
```

## How It Works

Dijkstra maintains a tentative distance for every node, initially infinity for everyone except the source (which gets distance 0). It then repeatedly:

1. Picks the unvisited node with the **smallest tentative distance**.
2. **Relaxes** all its outgoing edges — for each neighbor, if going through the current node gives a shorter distance, update the neighbor's tentative distance.
3. Marks the current node as finalized; its shortest-path distance will not change again.

The key insight is that whenever you pull the smallest-distance node off the priority queue, that distance is **provably final**. Because all edge weights are non-negative, no future path can produce a smaller total — any other route must go through some node not yet processed, and that node already has a tentative distance ≥ the current one.

This greedy choice is what makes Dijkstra correct, and it's also why **negative edge weights break it** (covered later).

## Implementation

The standard implementation uses a min-heap (priority queue) keyed by tentative distance. Python's `heapq` provides this.

```python
import heapq

def dijkstra(graph, start):
    """
    graph: dict mapping each node to a list of (neighbor, weight) tuples
    start: the source node
    Returns: dict mapping each node to its shortest distance from start.
    """
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    heap = [(0, start)]                          # (distance, node)

    while heap:
        d, node = heapq.heappop(heap)
        if d > distances[node]:
            continue                             # outdated entry, skip
        for neighbor, weight in graph[node]:
            new_dist = d + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                heapq.heappush(heap, (new_dist, neighbor))

    return distances
```

Three implementation details that matter:

- **The heap stores `(distance, node)` tuples.** Python compares tuples element by element, so the heap pops the smallest distance first. If two entries have the same distance, it compares nodes — which can fail if nodes are unorderable (e.g., dicts). Use `(distance, counter, node)` with a tie-breaker counter when nodes can't be compared.
- **Lazy deletion.** Python's `heapq` doesn't support "decrease-key." Instead of updating an existing heap entry, we push a new one and let the old one sit. When we pop an entry whose distance is greater than the currently recorded distance for that node, we skip it. This is the `if d > distances[node]: continue` line. It's slightly wasteful but simpler and fast enough in practice.
- **Initial distances of infinity.** This makes the relaxation comparison `new_dist < distances[neighbor]` work correctly for the first visit to each node.

### Walked Example

Run on this graph from source A:

```
       1                                            distances after each step:
   A ─────► B
   │       │ \                                      step  A   B   C   D
 4 │       │  2                                     init  0   ∞   ∞   ∞
   ▼       ▼   ▼                                    A→    0   1   4   ∞
   C ◄─────D ◄─                                     B→    0   1   4   3
       1                                            D→    0   1   2   3
                                                    C→    0   1   2   3 (final)
Edges: A→B=1, A→C=4, B→D=2, D→C=1
```

The order of "finalizations" — A (0), B (1), C (2 after the D update), D (3) — is the order Dijkstra commits to a node's final distance.

## Path Reconstruction

To know not just the distance but the actual path, track each node's predecessor on the best-known path so far. After the algorithm finishes, walk backward from any target to reconstruct the path.

```python
def dijkstra_with_path(graph, start, target):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    parents = {start: None}
    heap = [(0, start)]

    while heap:
        d, node = heapq.heappop(heap)
        if d > distances[node]:
            continue
        if node == target:                      # early termination
            break
        for neighbor, weight in graph[node]:
            new_dist = d + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                parents[neighbor] = node
                heapq.heappush(heap, (new_dist, neighbor))

    # reconstruct
    if distances[target] == float('inf'):
        return None
    path = []
    current = target
    while current is not None:
        path.append(current)
        current = parents.get(current)
    return path[::-1], distances[target]
```

Once the target is popped, its distance is final — you can break early without finishing the full traversal.

## Variants

### Single-Target Dijkstra

If you only care about the shortest path to one specific node, return as soon as that node is popped. Worst case is unchanged, but typical case is much faster on large graphs.

### 0-1 BFS

When all edge weights are either 0 or 1, you can replace the priority queue with a **deque**: push 0-weight edges to the front and 1-weight edges to the back. This gives O(V + E) instead of O((V + E) log V) — faster than Dijkstra for this restricted case.

```python
from collections import deque

def zero_one_bfs(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    dq = deque([start])
    while dq:
        node = dq.popleft()
        for neighbor, weight in graph[node]:
            new_dist = distances[node] + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                if weight == 0:
                    dq.appendleft(neighbor)
                else:
                    dq.append(neighbor)
    return distances
```

Useful for grid problems where some moves are "free."

### A* Search

A* extends Dijkstra with a **heuristic** estimating the remaining distance to the target. The priority queue uses `distance_so_far + heuristic` instead of just `distance_so_far`. With an admissible heuristic (one that never overestimates), A* finds the same shortest path as Dijkstra but typically explores far fewer nodes. Used for pathfinding in games, robotics, and puzzle solvers.

A* with a heuristic of zero is exactly Dijkstra. A* with a perfect heuristic explores only the optimal path.

### Bidirectional Dijkstra

Run Dijkstra from both the source and the target simultaneously, and stop when the two searches meet. Significantly faster on large graphs when start and end are both known.

## When Dijkstra Fails: Negative Weights

Dijkstra requires **non-negative edge weights**. With negative weights, the greedy assumption breaks: a node's distance might still be reduced even after it appears finalized, because a path through some not-yet-explored node could have negative total weight.

```
   A
  / \
 1   4
 ↓   ↓
 B   C
  \  /
   -3      (B→C has weight -3)
   ↓
   C
```

Dijkstra would finalize C with distance 4 (via A→C) before considering A→B→C with distance 1 + (-3) = -2.

For graphs with negative weights, use **Bellman-Ford** (O(VE)) — it relaxes every edge `V - 1` times and handles any weighted graph without negative cycles. If the graph contains a negative cycle reachable from the source, no shortest path exists; Bellman-Ford detects this case explicitly.

For a denser comparison:

| | Dijkstra | Bellman-Ford |
|---|----------|--------------|
| Time | O((V + E) log V) | O(V × E) |
| Negative edges | ✗ | ✓ |
| Negative cycle detection | ✗ | ✓ |
| Single source to all | ✓ | ✓ |
| Typical use | Road networks, networks | Currency arbitrage, anywhere weights can be negative |

For all-pairs shortest paths on dense graphs, **Floyd-Warshall** (O(V³)) is simpler than running Dijkstra from every node — and it handles negative weights too.

## Time and Space Complexity

For a graph with `V` vertices and `E` edges:

| Variant | Time | Space |
|---------|------|-------|
| Dijkstra with binary heap | O((V + E) log V) | O(V) |
| Dijkstra with Fibonacci heap | O(E + V log V) | O(V) |
| Dijkstra with array (no heap) | O(V²) | O(V) |
| 0-1 BFS | O(V + E) | O(V) |
| A* | depends on heuristic; ≤ Dijkstra | O(V) |
| Bellman-Ford | O(V × E) | O(V) |

The binary-heap version (what `heapq` gives you) is what almost everyone uses in practice. The Fibonacci heap version is theoretically better but has large constant factors and is rarely faster on real-world inputs.

The "array, no heap" version is faster than the heap version when the graph is **dense** (E close to V²). At that density, scanning all nodes to find the minimum is cheaper than maintaining a heap of size O(E).

## When to Use

Reach for Dijkstra when:

- The graph has **non-negative** edge weights.
- You need the **shortest path** by total weight (not just fewest edges).
- The graph is too large for Floyd-Warshall (which is O(V³)).
- The graph has weighted edges that aren't 0 or 1 (otherwise 0-1 BFS is faster).
- You need shortest paths from one source to all targets, or from one source to one specific target.

Don't use Dijkstra when:

- All edge weights are 1 — use BFS, it's simpler and faster.
- All edge weights are 0 or 1 — use 0-1 BFS.
- Edge weights can be **negative** — use Bellman-Ford.
- You need all-pairs shortest paths on a dense graph — use Floyd-Warshall.
- The graph is implicit and you have a useful distance heuristic — use A*.

## Common Pitfalls

- **Using BFS on weighted graphs.** This is the most common mistake. BFS gives correct distances only when all edges have the same weight. If weights vary, the answer can be wrong even if every edge is positive.
- **Negative edge weights.** Dijkstra silently produces wrong answers — it doesn't crash. Always verify edges are non-negative before reaching for Dijkstra.
- **Using a list as a priority queue.** Repeatedly scanning a list for the minimum is O(V²). For sparse graphs, the heap is dramatically faster. Always use `heapq` unless the graph is genuinely dense.
- **Storing nodes in the heap entry as the first element.** The heap compares tuples lexicographically — if `(node, distance)` is used, it compares by node first, breaking the algorithm. The order must be `(distance, node)`.
- **Comparing unorderable node objects.** If two heap entries have the same distance and the nodes are dicts or custom classes that can't be compared, `heapq` raises `TypeError`. Add a tiebreaker: `(distance, counter, node)` with `counter = next(itertools.count())`.
- **Updating the heap entry instead of pushing a new one.** Python's `heapq` doesn't support decrease-key. Push a new (smaller distance, node) entry and rely on lazy deletion when the outdated entry is eventually popped.
- **Forgetting the lazy-deletion check.** If you remove `if d > distances[node]: continue`, the algorithm still produces correct distances but does extra work — and on a dense graph it can degrade noticeably.
- **Not handling unreachable nodes.** Nodes that can't be reached from the source remain at infinity. Make sure your code does something sensible (return `None`, skip, etc.) instead of treating infinity as a real distance.
- **Path reconstruction without tracking predecessors.** Distances alone don't tell you the path. If the problem asks for the path, track parents during relaxation.
- **Off-by-one in early termination.** If you break the moment the target is *pushed* onto the heap rather than *popped*, you may not have its final distance yet. Always wait until pop.

## Common Interview Problems

### Easy
- Find if Path Exists in Graph (unweighted; usually solved with BFS/DFS, but a Dijkstra warm-up)

### Medium
- Network Delay Time
- Path with Minimum Effort
- Cheapest Flights Within K Stops
- Path with Maximum Probability
- Swim in Rising Water
- Minimum Cost to Make at Least One Valid Path in a Grid (0-1 BFS or Dijkstra)
- The Maze II
- Shortest Path in a Hidden Grid
- Number of Ways to Arrive at Destination
- Reachable Nodes In Subdivided Graph
- K Highest Ranked Items Within a Price Range
- Minimum Time to Reach Destination
- Find the City With the Smallest Number of Neighbors at a Threshold Distance
- Minimum Cost to Reach City With Discounts

### Hard
- Network Delay Time (variants with constraints)
- Minimum Number of Refueling Stops
- Reachable Nodes With Restrictions
- Bus Routes
- Shortest Path Visiting All Nodes (Dijkstra + bitmask)
- Minimum Weighted Subgraph With the Required Paths
- Maximum Number of Tasks You Can Assign
- Minimum Cost to Convert String II
- Number of Ways to Divide a Long Corridor
- Second Minimum Time to Reach Destination
- Minimum Time to Visit a Cell In a Grid
- Modify Graph Edge Weights
