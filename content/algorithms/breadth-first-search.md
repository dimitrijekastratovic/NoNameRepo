# Breadth-First Search

**Breadth-first search** (BFS) explores a graph or tree by visiting all nodes at distance 1 from the start, then all nodes at distance 2, then distance 3, and so on. The "breadth" in the name refers to this layer-by-layer expansion: BFS goes wide before it goes deep.

The single most useful property of BFS is this: **on an unweighted graph, BFS finds the shortest path** (fewest edges) from the source to every other reachable node. This makes it the default tool for problems phrased as "minimum number of steps," "fewest moves," or "shortest path through a maze."

A few terms used throughout:

- **Graph** — a set of nodes (vertices) connected by edges. Trees are a special case of graphs.
- **Adjacent / neighbor** — two nodes directly connected by an edge.
- **Distance** — the number of edges on the shortest path between two nodes (in unweighted graphs).
- **Visited** — a node already added to the queue, so it won't be processed twice.

## How It Works

BFS uses a **queue** (first-in, first-out) to track which nodes to visit next. The queue holds the **frontier** — the nodes discovered but not yet expanded.

1. Add the start node to the queue and mark it as visited.
2. While the queue is not empty:
   a. Remove the node at the front of the queue.
   b. For each of its neighbors that hasn't been visited, mark it as visited and add it to the back of the queue.
3. Stop when the queue is empty (whole reachable graph has been visited) or when the goal node is reached.

```
Graph:                    BFS from A:

    A                     Step 1: queue = [A]                     visited = {A}
   / \                    Step 2: visit A,    queue = [B, C]      visited = {A, B, C}
  B   C                   Step 3: visit B,    queue = [C, D, E]   visited = {A, B, C, D, E}
 / \   \                  Step 4: visit C,    queue = [D, E, F]   visited = {..., F}
D   E   F                 Step 5: visit D, E, F (all leaves)
```

The order of visits — A, then B and C, then D, E, F — is exactly the breadth-first order. Nodes one edge away come out before nodes two edges away.

## Why a Queue?

The FIFO behavior is what gives BFS its layer-by-layer property. When you remove a node from the front, all nodes still in the queue are at the same distance or farther. Adding new neighbors to the back means they will be processed only after all closer nodes have been handled. Using a stack (LIFO) instead of a queue would give depth-first search — a fundamentally different traversal order.

## Implementation

For a graph stored as an adjacency list (`graph[node]` returns a list of neighbors):

```python
from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        # process node here, e.g., print(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```

Two implementation details that matter:

- **Use `collections.deque`, not a `list`.** `list.pop(0)` is O(n) because it shifts every remaining element; `deque.popleft()` is O(1). With a list, BFS becomes O(V²) instead of O(V + E).
- **Mark as visited when enqueuing, not when dequeuing.** If you only mark on dequeue, the same node can get added to the queue multiple times before it's processed, wasting work and (in some variants) breaking correctness.

For trees, there are no cycles, so the visited set is unnecessary:

```python
def level_order(root):
    if not root:
        return
    queue = deque([root])
    while queue:
        node = queue.popleft()
        # process node
        if node.left:  queue.append(node.left)
        if node.right: queue.append(node.right)
```

## Tracking Distance

To find the shortest distance from the source to every reachable node, store the distance alongside each enqueued node, or process the queue **level by level**.

### Distance Map

```python
def shortest_distances(graph, start):
    distance = {start: 0}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in distance:
                distance[neighbor] = distance[node] + 1
                queue.append(neighbor)
    return distance
```

After this runs, `distance[v]` is the minimum number of edges from `start` to `v`.

### Level-by-Level Processing

When the algorithm needs to know which level it is currently on (for example, to find all nodes exactly `k` edges away, or to return the level-order traversal grouped by depth), process the queue one level at a time:

```python
def levels(graph, start):
    visited = {start}
    queue = deque([start])
    result = []
    while queue:
        level_size = len(queue)
        current_level = []
        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node)
            for neighbor in graph[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        result.append(current_level)
    return result
```

The trick is to capture `len(queue)` before the inner loop starts. That value is the size of the current level; the inner loop dequeues exactly that many nodes, and any nodes added during the loop belong to the next level.

## Reconstructing the Shortest Path

Knowing the distance is often not enough — you need the actual path. Track each node's predecessor (the node it was discovered from), then walk backward from the goal to the source.

```python
def shortest_path(graph, start, goal):
    if start == goal:
        return [start]
    parent = {start: None}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in parent:
                parent[neighbor] = node
                if neighbor == goal:
                    # reconstruct path
                    path = []
                    while neighbor is not None:
                        path.append(neighbor)
                        neighbor = parent[neighbor]
                    return path[::-1]
                queue.append(neighbor)
    return []   # goal unreachable
```

## Variants

### Grid BFS (2D)

Many BFS problems aren't on explicit graphs but on grids — mazes, islands, rotting oranges. The grid cells are the nodes, and the edges connect each cell to its up/down/left/right neighbors. The algorithm is the same; only the neighbor-generating code changes.

```python
def shortest_path_grid(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    visited = {start}
    queue = deque([(start, 0)])    # (cell, distance)
    while queue:
        (r, c), dist = queue.popleft()
        if (r, c) == goal:
            return dist
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if (0 <= nr < rows and 0 <= nc < cols
                    and grid[nr][nc] != '#'         # not a wall
                    and (nr, nc) not in visited):
                visited.add((nr, nc))
                queue.append(((nr, nc), dist + 1))
    return -1
```

The four `(dr, dc)` direction tuples are a common idiom. Eight-direction movement (including diagonals) just adds four more tuples.

### Multi-Source BFS

When multiple starting points need to expand simultaneously — "for each cell, find distance to the nearest gate" or "how long until every orange rots" — initialize the queue with **all** sources at once. They expand together, and each cell records its distance to the nearest source.

```python
def nearest_source_distance(grid, sources):
    queue = deque()
    distance = {}
    for src in sources:
        queue.append(src)
        distance[src] = 0
    while queue:
        r, c = queue.popleft()
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and (nr, nc) not in distance:
                distance[(nr, nc)] = distance[(r, c)] + 1
                queue.append((nr, nc))
    return distance
```

This is dramatically faster than running BFS from each source individually.

### Bidirectional BFS

When searching for a path between two specific nodes in a large graph, run two BFS searches at once — one from the start, one from the goal — and stop when their frontiers meet. This can roughly square-root the work: instead of exploring `b^d` nodes (branching factor `b`, distance `d`), each side explores `b^(d/2)`. Implementation is fiddly; mention it if asked, implement it only if interview time permits.

### 0-1 BFS

When edges have weights of either 0 or 1 (and only those values), a regular queue gives the wrong answer because some "longer" paths use only zero-weight edges. The fix is a **deque**: push 0-weight edges to the front, 1-weight edges to the back. This runs in O(V + E) — faster than Dijkstra for this restricted weight set. Useful for grid problems where some moves are "free."

## Time and Space Complexity

For a graph with `V` vertices and `E` edges:

| Variant | Time | Space |
|---------|------|-------|
| BFS on a graph | O(V + E) | O(V) |
| BFS on a tree | O(n) | O(n) — width of tree in worst case |
| BFS on an n×m grid | O(n × m) | O(n × m) |
| Multi-source BFS | O(V + E) | O(V) |
| 0-1 BFS | O(V + E) | O(V) |
| Bidirectional BFS | O(b^(d/2)) | O(b^(d/2)) |

The space cost comes from the queue (in the worst case, holding an entire level of the graph) and the visited set.

## When to Use

BFS is the right tool when:

- The problem asks for the **shortest path** or **fewest steps** in an **unweighted** graph.
- The graph or grid is small enough that exploring all reachable nodes is acceptable.
- You need to process a tree **level by level** (level-order traversal, populating next pointers, etc.).
- You're doing **multi-source** propagation (rotting oranges, walls and gates, distance to nearest X).
- You need to find **all nodes within distance k** of a starting node.

BFS is **not** the right tool when:

- Edges have varying positive weights — use **Dijkstra**.
- Edges can have negative weights — use **Bellman-Ford**.
- You only need to know whether a path exists and don't care about its length — DFS is just as good and sometimes uses less memory.
- The state space is huge but most paths are uninteresting — DFS with pruning, A*, or iterative deepening may be better.

## Common Pitfalls

- **Using a list as a queue.** `list.pop(0)` is O(n). The whole BFS becomes O(V²). Always use `collections.deque`.
- **Marking visited on dequeue instead of enqueue.** This causes the same node to enter the queue multiple times. In the best case, it's just slow; in the worst case (with weighted variants like Dijkstra-without-the-priority-queue), it returns wrong answers.
- **Forgetting to mark the start node visited.** Easy to miss, causes the start to be added back into the queue from one of its neighbors.
- **Trees vs graphs.** Trees have no cycles, so a visited set is unnecessary — but if the input "tree" is actually a general graph (or you misread the problem), missing visited tracking causes infinite loops.
- **Grid bounds.** Off-by-one errors on grid coordinates and missing the "not a wall" check produce subtle bugs. Test against a 1×1 grid and a grid surrounded by walls.
- **Mutable state in the queue.** If your queue holds tuples that include sets or lists, mutating them after enqueuing affects every reference. Use frozensets or tuples for state, or copy on enqueue.
- **Reconstructing the path with a list-of-paths queue.** A common beginner pattern is enqueuing `(node, path_so_far)`, copying the path each time. This works but uses O(V²) memory and time. Use a `parent` map and reconstruct at the end.
- **Assuming BFS works on weighted graphs.** It doesn't. The shortest-by-edges path is not the same as the shortest-by-weight path. If edges have varying weights, use Dijkstra.
- **Forgetting the empty-input case.** What does your code do on `start == goal`, an empty graph, or a disconnected target? Always check.

## Common Interview Problems

### Easy
- Binary Tree Level Order Traversal
- Average of Levels in Binary Tree
- Minimum Depth of Binary Tree
- Symmetric Tree (BFS variant)
- N-ary Tree Level Order Traversal
- Find Bottom Left Tree Value

### Medium
- Number of Islands
- Rotting Oranges (multi-source BFS)
- Walls and Gates (multi-source BFS)
- 01 Matrix (multi-source BFS)
- Pacific Atlantic Water Flow
- Word Ladder
- Minimum Genetic Mutation
- Open the Lock
- Perfect Squares
- Snakes and Ladders
- Shortest Path in Binary Matrix
- Shortest Bridge
- As Far from Land as Possible
- Keys and Rooms
- Course Schedule (BFS topological sort)
- Course Schedule II
- Binary Tree Right Side View
- Populating Next Right Pointers in Each Node
- All Nodes Distance K in Binary Tree
- Cheapest Flights Within K Stops
- Map of Highest Peak

### Hard
- Word Ladder II
- Shortest Path in a Grid with Obstacles Elimination (BFS with state)
- Bus Routes
- Minimum Number of Days to Disconnect Island
- Race Car
- Trapping Rain Water II (BFS + heap)
- Sliding Puzzle
- Cut Off Trees for Golf Event
- Making A Large Island
