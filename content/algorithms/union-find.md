# Union-Find (Disjoint Set Union)

**Union-Find**, also called **Disjoint Set Union (DSU)**, is a data structure that tracks a partition of elements into disjoint groups and supports two operations efficiently:

- **`find(x)`** — return a representative ("root") of the group containing `x`.
- **`union(x, y)`** — merge the groups containing `x` and `y` into one.

These two operations together solve the **dynamic connectivity** problem: given a stream of "connect these two things" updates, answer queries of the form "are these two things in the same component?". With both standard optimizations applied, both operations run in nearly O(1) amortized time — fast enough that Union-Find is essentially free in practice.

Union-Find is the right tool whenever you're tracking groups that **merge over time** but never split. It's the engine behind Kruskal's minimum spanning tree algorithm, several graph cycle-detection problems, account-merging style problems, and many grid-component questions where DFS/BFS would also work but are clunkier.

A few terms used throughout:

- **Element** — one of the things being grouped (a node, an account, a grid cell, etc.).
- **Set / component / group** — a collection of elements that are all connected.
- **Representative / root** — the canonical element of a set; two elements are in the same set if and only if they have the same root.
- **Parent pointer** — each element points to another element in the same set, eventually leading to the root.

## How It Works

The key idea: each set is represented as a **tree**. Every element points to its parent in the tree, and the root of the tree (an element whose parent is itself) is the representative.

```
Sets {1, 2, 3} and {4, 5}, stored as trees:

     1            4
    / \           |
   2   3          5

parent: [-, 1, 1, 1, 4, 4]   (index 0 unused)
```

To **find** the root of any element, follow parent pointers up to the top. To **union** two elements, find both their roots and link one tree under the other.

That's the whole structure — the optimizations make it fast.

## Naive Implementation

Without optimizations, both operations are O(n) in the worst case (the tree can degenerate into a chain).

```python
class UnionFindNaive:
    def __init__(self, n):
        self.parent = list(range(n))    # each element is its own root initially

    def find(self, x):
        while self.parent[x] != x:
            x = self.parent[x]
        return x

    def union(self, x, y):
        root_x = self.find(x)
        root_y = self.find(y)
        if root_x != root_y:
            self.parent[root_x] = root_y
```

This works correctly but performs poorly. Under adversarial inputs (always linking a small chain to the bottom of a large one), the trees become tall and `find` walks O(n) parents per call.

## Optimization 1: Path Compression

During `find(x)`, after locating the root, **make every node on the path point directly to the root**. Subsequent `find` calls on those nodes will be O(1).

There are two common ways to write this. The recursive form is the cleanest:

```python
def find(self, x):
    if self.parent[x] != x:
        self.parent[x] = self.find(self.parent[x])
    return self.parent[x]
```

Iterative version with two passes (first to find the root, second to compress):

```python
def find(self, x):
    root = x
    while self.parent[root] != root:
        root = self.parent[root]
    while self.parent[x] != root:
        self.parent[x], x = root, self.parent[x]
    return root
```

Path compression alone gives O(log n) amortized per operation.

## Optimization 2: Union by Rank (or Size)

When unioning two sets, **always attach the smaller tree under the larger one**. This keeps trees shallow.

Two variants:

- **Union by rank** — track an upper bound on tree height; attach the lower-rank root under the higher-rank one. If they're equal, the merged tree's rank goes up by 1.
- **Union by size** — track the number of elements; attach the smaller-size tree under the larger one. Slightly easier to reason about, equivalent performance.

Union by rank or size alone gives O(log n) per operation.

## Combined: Path Compression + Union by Rank

When both optimizations are applied, the time per operation becomes **O(α(n))** amortized — where α is the **inverse Ackermann function**. For any practical value of n (up to roughly 10⁸⁰), α(n) ≤ 4. In other words, every operation is effectively constant time.

This is one of the rare results in algorithm analysis where a "non-constant" function shows up but is so slow-growing it's constant in practice.

## Full Python Implementation

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.count = n                  # number of disjoint sets

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])    # path compression
        return self.parent[x]

    def union(self, x, y):
        root_x = self.find(x)
        root_y = self.find(y)
        if root_x == root_y:
            return False                # already in the same set
        # union by rank
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
        self.count -= 1
        return True

    def connected(self, x, y):
        return self.find(x) == self.find(y)
```

The `count` field tracks the number of disjoint sets — useful for problems like "Number of Connected Components." It decrements each time a union actually merges two distinct sets.

`union` returns `True` if a merge happened and `False` if the two elements were already connected — handy for cycle detection.

For elements that aren't integers in `[0, n)` (strings, tuples, etc.), use a dict-based variant or maintain a separate index mapping.

## Time and Space Complexity

For `n` elements and `m` operations:

| Variant | Per operation | Total for m operations |
|---------|---------------|------------------------|
| Naive (no optimizations) | O(n) worst case | O(m × n) |
| Path compression only | O(log n) amortized | O(m log n) |
| Union by rank only | O(log n) | O(m log n) |
| **Both optimizations** | **O(α(n)) amortized** | **O(m α(n)) ≈ O(m)** |

**Space:** O(n) — one parent pointer and one rank value per element.

The α(n) bound is the result of decades of work in algorithm analysis (Tarjan, 1975 and later refinements). The practical takeaway: with both optimizations, treat Union-Find as constant time per operation when estimating algorithm complexity in interviews.

## Classic Use Cases

### Counting Connected Components

Initialize Union-Find with `n` elements, union every edge, and read off `uf.count`.

```python
def count_components(n, edges):
    uf = UnionFind(n)
    for u, v in edges:
        uf.union(u, v)
    return uf.count
```

The same idea underlies "Number of Provinces," "Number of Islands II," and "Number of Operations to Make Network Connected."

### Cycle Detection in Undirected Graphs

In a forest (acyclic graph), every edge connects two previously disjoint components. If you encounter an edge whose endpoints are already in the same component, that edge would create a cycle.

```python
def has_cycle(n, edges):
    uf = UnionFind(n)
    for u, v in edges:
        if not uf.union(u, v):          # already connected
            return True
    return False
```

This is the technique behind "Redundant Connection" and "Graph Valid Tree." It's much cleaner than DFS-based cycle detection for undirected graphs.

### Kruskal's Minimum Spanning Tree

Sort edges by weight ascending. Walk through them in order; add each edge if it doesn't create a cycle (using Union-Find to check). After processing all edges, the chosen edges form a minimum spanning tree.

```python
def kruskal(n, edges):                  # edges: list of (weight, u, v)
    edges.sort()
    uf = UnionFind(n)
    mst_weight = 0
    for w, u, v in edges:
        if uf.union(u, v):
            mst_weight += w
    return mst_weight
```

The greedy correctness of Kruskal's depends on the fact that the smallest edge bridging two components must be in some MST. Union-Find efficiently identifies whether each candidate edge bridges components.

### Account Merging

Given accounts where each account has multiple emails, merge accounts that share any email. Each email is an element; for each account, union all its emails. Then group emails by their final root.

This pattern — "merge entities that share an attribute" — generalizes to friend circles, equivalence-class problems, and the canonical "Accounts Merge" interview problem.

```python
from collections import defaultdict

def accounts_merge(accounts):
    email_to_id = {}
    email_to_name = {}
    for account in accounts:
        name = account[0]
        for email in account[1:]:
            email_to_name[email] = name
            if email not in email_to_id:
                email_to_id[email] = len(email_to_id)

    uf = UnionFind(len(email_to_id))
    for account in accounts:
        first_id = email_to_id[account[1]]
        for email in account[2:]:
            uf.union(first_id, email_to_id[email])

    groups = defaultdict(list)
    id_to_email = {v: k for k, v in email_to_id.items()}
    for email, idx in email_to_id.items():
        groups[uf.find(idx)].append(email)

    return [[email_to_name[emails[0]]] + sorted(emails) for emails in groups.values()]
```

### Number of Islands

A 2D grid problem. Each `'1'` cell is an element; for each cell, union it with its left and upper neighbors (if they're also `'1'`). The number of islands is the number of disjoint sets among `'1'` cells.

DFS or BFS solves this too, often more concisely. Union-Find shines for the **dynamic** variant, "Number of Islands II," where land cells are added one at a time and the answer needs to be reported after each addition.

## When to Use

Reach for Union-Find when:

- The problem involves **groups that merge** over time but never split.
- You need to repeatedly answer "are these two things connected?" or "how many groups are there?".
- You're checking for **cycles in an undirected graph** while it's being built.
- You're implementing **Kruskal's MST**.
- Equivalence relations: emails that share accounts, friends-of-friends, equality constraints.
- You're processing a **stream of edges or merges** rather than a static graph.

Don't use Union-Find when:

- The problem requires splitting groups — Union-Find doesn't support deletion or split.
- You need to know more about a group's structure (paths, distances, ordering) — DFS/BFS are better.
- The graph is given upfront and you only need to process it once — DFS/BFS are usually simpler.
- You need shortest paths or weighted connectivity — Dijkstra or Bellman-Ford fit better.

## Common Pitfalls

- **Skipping path compression.** Without it, individual `find` calls can be O(n) on degenerate trees. Path compression is essential for the near-constant time bound.
- **Skipping union by rank/size.** Linking trees naively (always small-to-large or always one specific direction) builds tall trees. Combined with path compression, you can get away with skipping union-by-rank — but using both is the standard, and tighter, guarantee.
- **Comparing elements directly instead of their roots.** `if x == y` is not the same as `if find(x) == find(y)`. Two elements can be in the same set without being equal as values. Always compare roots.
- **Indexing errors with non-integer elements.** When elements are strings, tuples, or arbitrary objects, you need a mapping from element to index. Mixing up the mapping silently corrupts the structure.
- **Forgetting to maintain `count`.** If you're using Union-Find to count components, decrement `count` only when `union` actually merges two distinct sets — not on every call. The implementation above does this correctly via the `if root_x == root_y: return False` early exit.
- **Using Union-Find for splittable groups.** Union-Find supports merges, not splits. For problems involving group splits or deletions, you need a different structure (link-cut trees, offline reverse processing, etc.).
- **Recursion depth on large inputs.** Recursive `find` with path compression can hit Python's recursion limit on long initial chains *before* compression kicks in. Use the iterative two-pass version on large inputs, or raise the recursion limit.
- **Wrong return value from `union`.** Some problems need to know whether the union actually merged two sets (e.g., for cycle detection). Make `union` return a boolean and check it; don't infer from `find` calls.
- **Mutating during iteration.** When iterating over edges and unioning, the data structure is being modified during the loop. This is fine for correctness but watch out if you also iterate the parent array directly.

## Common Interview Problems

### Easy
- Number of Provinces (also known as Friend Circles)
- Find if Path Exists in Graph (Union-Find variant)

### Medium
- Number of Connected Components in an Undirected Graph
- Graph Valid Tree
- Redundant Connection
- Number of Islands (Union-Find solution)
- Most Stones Removed with Same Row or Column
- Accounts Merge
- Satisfiability of Equality Equations
- Number of Operations to Make Network Connected
- Evaluate Division (Union-Find with weights)
- Smallest String With Swaps
- Regions Cut By Slashes
- Lexicographically Smallest Equivalent String
- Process Restricted Friend Requests
- Find Latest Group of Size M
- Path With Minimum Effort (Union-Find variant)
- Couples Holding Hands
- The Earliest Moment When Everyone Become Friends
- Bricks Falling When Hit (offline reverse Union-Find)

### Hard
- Number of Islands II (online dynamic Union-Find)
- Redundant Connection II (directed graph variant)
- Most Similar Path in a Graph
- Minimize Malware Spread / II
- Swim in Rising Water (Union-Find solution)
- Number of Good Paths
- Minimum Number of Days to Disconnect Island
- Last Day Where You Can Still Cross
- Detonate the Maximum Bombs
- Checking Existence of Edge Length Limited Paths
- Optimize Water Distribution in a Village (Kruskal's MST)
- Connecting Cities With Minimum Cost (Kruskal's MST)
- Min Cost to Connect All Points (Kruskal's MST)
