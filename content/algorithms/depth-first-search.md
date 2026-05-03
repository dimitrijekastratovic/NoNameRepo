# Depth-First Search

**Depth-first search** (DFS) explores a graph or tree by going as deep as possible along each branch before backtracking. From the start node, DFS picks one neighbor, then a neighbor of that neighbor, and so on, until it reaches a dead end. Then it backs up to the most recent branching point and tries the next unexplored neighbor.

Where BFS spreads out layer by layer, DFS dives down one path until it has to retreat. The difference in traversal order makes DFS natural for problems involving **reachability**, **connectivity**, **cycle detection**, **topological ordering**, and any task where you need to fully process a subtree or branch before moving on.

A few terms used throughout:

- **Branch** — a path from the current node down through its descendants.
- **Backtrack** — return from a fully-explored branch to try a different one.
- **Visited** — a node already reached, so it won't be processed twice.
- **Recursion stack** — the implicit stack of in-progress function calls during recursive DFS.

## How It Works

DFS uses a **stack** (last-in, first-out) to track which nodes to visit next. The stack can be explicit, or it can be the program's call stack via recursion.

1. Visit the start node and mark it as visited.
2. Pick one of its unvisited neighbors and recursively visit that neighbor.
3. When all neighbors of the current node have been visited, return to the previous node.
4. Stop when every reachable node has been visited.

```
Graph:                   DFS from A (always taking the leftmost unvisited child):

    A                    Visit A → B → D (dead end, back to B) → E (dead end, back to B,
   / \                            then back to A) → C → F → G
  B   C
 / \   \                 Visit order: A, B, D, E, C, F, G
D   E   F
         \
          G
```

Compare this to the BFS order on the same graph (A, B, C, D, E, F, G). Both are valid traversals; they just produce different orderings.

## Why a Stack?

DFS needs to remember where to return when a branch dead-ends. The stack stores those pending branch points. When you pop the stack, you get back the most recent unfinished node — so DFS resumes from where it last branched, going as deep as possible before unwinding.

Recursion gives this behavior for free: every recursive call adds a frame to the call stack, and returning from a call pops the frame. That's why DFS implementations are usually recursive — the language's stack does the bookkeeping automatically.

## Implementation

### Recursive

The most natural form. Each call processes one node and recurses into each unvisited neighbor.

```python
def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    # process node here, e.g., print(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
```

For trees there are no cycles, so the visited check disappears:

```python
def dfs_tree(node):
    if node is None:
        return
    # process node here
    dfs_tree(node.left)
    dfs_tree(node.right)
```

### Iterative

Recursive DFS uses Python's call stack, which has a default limit of about 1000 frames. For very deep graphs, this can hit `RecursionError`. The iterative version uses an explicit stack and avoids that limit.

```python
def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        # process node here
        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)
```

The structure is nearly identical to BFS — the only change is `stack.pop()` instead of `queue.popleft()`. A LIFO stack instead of a FIFO queue is what turns breadth-first into depth-first.

A subtle difference: iterative DFS can produce a different visit order than recursive DFS, because the order neighbors are pushed onto the stack reverses the order they come off. To match the recursive order exactly, push neighbors in reverse.

## Three Traversal Orders for Trees

On a binary tree, DFS has three standard variants depending on **when** you process the current node relative to its children. These are covered in detail in the Trees article; the implementations are repeated here because they are DFS at heart.

```python
def preorder(node):     # root → left → right
    if node is None: return
    process(node)
    preorder(node.left)
    preorder(node.right)

def inorder(node):      # left → root → right (sorted output on a BST)
    if node is None: return
    inorder(node.left)
    process(node)
    inorder(node.right)

def postorder(node):    # left → right → root (process children first)
    if node is None: return
    postorder(node.left)
    postorder(node.right)
    process(node)
```

Post-order DFS is the foundation of topological sort and many bottom-up tree computations (height, sum of subtree, deletion).

## Variants and Use Cases

### Connected Components

In an undirected graph, the connected components are the maximal sets of mutually reachable nodes. Run DFS from any unvisited node to find one whole component; repeat until every node has been visited.

```python
def count_components(graph, n):
    visited = set()
    count = 0
    for node in range(n):
        if node not in visited:
            dfs(graph, node, visited)
            count += 1
    return count
```

### Cycle Detection in an Undirected Graph

A cycle exists if, while exploring, you reach an already-visited node *that isn't your direct parent*. The parent check is necessary because every undirected edge looks like a 2-cycle (`A → B → A`).

```python
def has_cycle_undirected(graph, n):
    visited = set()

    def dfs(node, parent):
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                if dfs(neighbor, node):
                    return True
            elif neighbor != parent:
                return True
        return False

    for node in range(n):
        if node not in visited:
            if dfs(node, -1):
                return True
    return False
```

### Cycle Detection in a Directed Graph (Three Colors)

Directed graphs need a more careful approach because you can revisit a node through a different path without that being a cycle. The standard technique uses **three states** for each node:

- **WHITE** — not yet visited.
- **GRAY** — currently in the DFS path (on the recursion stack).
- **BLACK** — fully explored, all descendants processed.

If DFS encounters a GRAY node, there's a cycle (you've found a back-edge to an ancestor in the current path).

```python
WHITE, GRAY, BLACK = 0, 1, 2

def has_cycle_directed(graph, n):
    color = [WHITE] * n

    def dfs(node):
        color[node] = GRAY
        for neighbor in graph[node]:
            if color[neighbor] == GRAY:
                return True            # back-edge → cycle
            if color[neighbor] == WHITE and dfs(neighbor):
                return True
        color[node] = BLACK
        return False

    return any(color[i] == WHITE and dfs(i) for i in range(n))
```

This is the algorithm behind cycle detection in build systems, course prerequisites, and dependency graphs.

### Topological Sort

A **topological order** of a directed acyclic graph (DAG) is an ordering of its nodes such that for every edge `u → v`, `u` comes before `v`. Useful for scheduling tasks with dependencies.

DFS produces a topological order as a side effect: process each node, and **after** all its descendants are done, prepend it to the result. The reversed post-order is a valid topological order.

```python
def topological_sort(graph, n):
    visited = set()
    order = []

    def dfs(node):
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                dfs(neighbor)
        order.append(node)             # post-order: append after children

    for node in range(n):
        if node not in visited:
            dfs(node)
    return order[::-1]
```

If the graph might contain cycles, combine this with the three-color cycle detection — a topological order does not exist if there's a cycle.

### Grid DFS

Grid problems use DFS the same way as graph problems, with neighbors generated by direction tuples. DFS is often shorter than BFS for grid problems where you don't need shortest path — for example, counting connected regions or "flood fill."

```python
def num_islands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '#'                   # mark as visited (in place)
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                dfs(r, c)
                count += 1
    return count
```

Marking visited in-place (overwriting the grid cell) saves a separate visited set when modifying the input is acceptable.

### Backtracking

**Backtracking** is DFS with state restoration: try a choice, recurse, then undo the choice before trying the next one. It's the foundation for permutations, combinations, N-Queens, Sudoku, and word search. Backtracking gets its own article — the key idea here is that it's a specific application pattern of DFS.

## DFS vs BFS

Both visit every reachable node in O(V + E). They differ in traversal order and in the kinds of problems they suit naturally.

| | BFS | DFS |
|---|------|------|
| Data structure | Queue (FIFO) | Stack (LIFO) — often via recursion |
| Order | Layer by layer | Down one branch fully before backtracking |
| Shortest path (unweighted) | ✓ Yes | ✗ No |
| Memory on a wide graph | Worse — queue holds entire layer | Better — stack holds one path |
| Memory on a deep graph | Better | Worse — recursion stack can blow up |
| Cycle detection (directed) | Awkward | Clean (three colors) |
| Topological sort | Possible (Kahn's algorithm) | Natural (post-order) |
| Reconstruct full reachable set | Yes | Yes |
| Find any path (not shortest) | Both work | Both work |
| Backtracking problems | Doesn't fit | Foundation |

When in doubt: BFS for shortest-path / level-order problems, DFS for everything else.

## Time and Space Complexity

For a graph with `V` vertices and `E` edges:

| Variant | Time | Space |
|---------|------|-------|
| DFS on a graph (recursive) | O(V + E) | O(V) — recursion stack + visited set |
| DFS on a graph (iterative) | O(V + E) | O(V) — explicit stack + visited set |
| DFS on a tree | O(n) | O(h) — h is tree height |
| DFS on an n×m grid | O(n × m) | O(n × m) worst case |
| Topological sort | O(V + E) | O(V) |
| Cycle detection (three colors) | O(V + E) | O(V) |

Space usage depends on the longest path explored, not the total graph size — that's why DFS is memory-efficient on tall narrow graphs and inefficient on bushy graphs.

## When to Use

DFS is the right tool when:

- You need to **fully explore** a graph or tree, not find a shortest path.
- The problem involves **connectivity** or **reachability** (connected components, "is X reachable from Y").
- You need **cycle detection**, especially in directed graphs.
- You need a **topological ordering** of a DAG.
- The problem has a **recursive substructure** (tree problems, divide and conquer, dynamic programming on trees).
- You're doing **backtracking** — generating permutations, combinations, paths, or solving constraint problems.
- The graph is too deep for BFS to hold a frontier in memory.

DFS is **not** the right tool when:

- You need the **shortest path** in an unweighted graph — use BFS.
- You need the **shortest path** in a weighted graph — use Dijkstra or Bellman-Ford.
- The graph is so deep that recursion would exceed the stack limit, and you don't want to write the iterative version.

## Common Pitfalls

- **Recursion depth limits.** Python's default limit is around 1000 frames. On large grids or deep trees, recursive DFS hits `RecursionError`. Either increase the limit with `sys.setrecursionlimit(10**6)` or rewrite iteratively. Increasing the limit too far can crash the interpreter.
- **Forgetting the visited set on a graph.** Without it, DFS will loop forever on any cycle, including the trivial 2-cycle in undirected graphs.
- **Wrong cycle-detection technique.** A simple visited-set check works for undirected graphs (with a parent check), but not for directed graphs — directed graphs need three-color marking or the equivalent.
- **Modifying the graph while iterating.** Common in grid DFS where you mark visited by overwriting the cell. Make sure you don't depend on the original value later in the same call.
- **Returning from inside the loop instead of after.** When DFS is searching for a target, you have to propagate the "found" signal back up; just returning from one recursive call doesn't stop the others.
- **Using DFS for shortest-path problems.** DFS finds *a* path, not the shortest one. The first path found can be arbitrarily long.
- **Iterative DFS visit order.** When porting from recursive to iterative, neighbors get processed in reverse order because of the stack. If order matters, push neighbors in reverse.
- **Passing mutable state without copying.** When using DFS for backtracking and you append to a list and recurse, that same list is shared across calls. Either copy when storing the result, or pop after recursing to undo the change.
- **Off-by-one in grid bounds.** Always check `0 <= r < rows and 0 <= c < cols` before reading a cell. The bounds check should be the first thing in the recursive function.

## Common Interview Problems

### Easy
- Maximum Depth of Binary Tree
- Same Tree
- Path Sum
- Symmetric Tree
- Invert Binary Tree
- Diameter of Binary Tree
- Subtree of Another Tree
- Find if Path Exists in Graph
- Flood Fill
- Range Sum of BST

### Medium
- Number of Islands
- Max Area of Island
- Surrounded Regions
- Pacific Atlantic Water Flow
- Clone Graph
- Course Schedule (cycle detection in directed graph)
- Course Schedule II (topological sort)
- All Paths From Source to Target
- Number of Connected Components in an Undirected Graph
- Graph Valid Tree
- Validate Binary Search Tree
- Lowest Common Ancestor of a Binary Tree
- Construct Binary Tree from Preorder and Inorder Traversal
- Binary Tree Right Side View
- Path Sum II
- Sum Root to Leaf Numbers
- Flatten Binary Tree to Linked List
- House Robber III
- Reorder Routes to Make All Paths Lead to the City Zero
- Keys and Rooms
- Evaluate Division (DFS on weighted graph)
- Number of Provinces

### Hard
- Binary Tree Maximum Path Sum
- Serialize and Deserialize Binary Tree
- Word Ladder II (BFS + DFS reconstruction)
- Critical Connections in a Network (Tarjan's bridges)
- Longest Increasing Path in a Matrix (DFS + memoization)
- Reconstruct Itinerary (DFS + backtracking)
- Alien Dictionary (topological sort)
- Number of Islands II (Union-Find variant)
- Robot Room Cleaner
- Cut Off Trees for Golf Event
- Making A Large Island
