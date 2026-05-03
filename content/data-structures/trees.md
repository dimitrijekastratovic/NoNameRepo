# Trees

A **tree** is a hierarchical data structure made of **nodes** connected by **edges**, where each node has exactly one parent (except the root, which has none) and zero or more children. Unlike arrays and linked lists, which are linear, trees branch — making them ideal for representing hierarchies (file systems, DOM, organizational charts) and for organizing data so it can be searched in **O(log n)** time when balanced.

Key terminology:

- **Root** — the topmost node (no parent).
- **Leaf** — a node with no children.
- **Edge** — a connection between a parent and child.
- **Depth** of a node — number of edges from the root to that node.
- **Height** of a node — number of edges on the longest path to a leaf. Tree height is the height of the root.
- **Subtree** — a node together with all its descendants.

A tree with `n` nodes has exactly `n − 1` edges, and there is a unique path between any two nodes.

## Memory Representation

Trees are usually stored using a **node-based** representation: each node is an object holding its value and references to its children.

```
        ┌───┐
        │ 1 │ root
        └─┬─┘
       ┌──┴──┐
     ┌─┴─┐ ┌─┴─┐
     │ 2 │ │ 3 │
     └─┬─┘ └───┘
       │
     ┌─┴─┐
     │ 4 │ leaf
     └───┘
```

For **complete binary trees** (such as heaps), an array representation is more compact: the node at index `i` has children at `2i + 1` and `2i + 2`, and parent at `(i − 1) // 2`. No pointers needed. This layout is detailed in the Heaps article.

## Initialization in Python

Python has no built-in tree type. The standard pattern is a `TreeNode` class — this is the same class used by LeetCode and most interview problems.

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Build the tree:
#       1
#      / \
#     2   3
#    /
#   4
root = TreeNode(1, TreeNode(2, TreeNode(4)), TreeNode(3))
```

For general (n-ary) trees, replace `left` and `right` with a list of children:

```python
class Node:
    def __init__(self, val=0, children=None):
        self.val = val
        self.children = children or []
```

## Types of Trees

### General Tree
Any node may have any number of children. Used for file systems, DOM trees, parse trees.

### Binary Tree
Each node has at most two children, conventionally called `left` and `right`. The most common tree variant in interviews because the two-child structure makes recursion clean.

Special shapes of binary trees:

- **Full binary tree** — every node has either 0 or 2 children, never 1.
- **Complete binary tree** — every level is fully filled except possibly the last, which is filled left-to-right. Heaps are complete binary trees.
- **Perfect binary tree** — every level is fully filled. A perfect tree of height `h` has exactly `2^(h+1) − 1` nodes.
- **Balanced binary tree** — for every node, the heights of its left and right subtrees differ by at most 1 (definition varies; this is the AVL definition). Guarantees O(log n) operations.

### Binary Search Tree (BST)
A binary tree with the **BST property**: for every node, all values in its left subtree are less than the node's value, and all values in its right subtree are greater. Duplicates are typically disallowed or handled by convention.

The BST property enables O(log n) search, insert, and delete on average — at each step, you eliminate half the remaining tree. **In-order traversal of a BST visits nodes in sorted order**, which is a frequent source of interview tricks.

### Self-Balancing BSTs
A plain BST degrades to O(n) if inserted in sorted order (it becomes a linked list). Self-balancing variants automatically rebalance after insertion and deletion to guarantee O(log n) height:

- **AVL tree** — strictly balanced; faster lookups, slower writes.
- **Red-Black tree** — looser balance; faster writes, slightly slower lookups. Used by Java's `TreeMap`, C++'s `std::map`, and the Linux kernel scheduler.
- **B-tree / B+ tree** — multi-way balanced trees with high fan-out. Used by databases and filesystems for on-disk indexes (covered in the Database Indexing article).

You almost never implement these from scratch in interviews, but you should know they exist, what problem they solve, and which standard library structures use them.

## Tree Traversals

Four traversal orders cover essentially every tree problem.

### Depth-First Traversals
Recursively visit one subtree fully before the next. Use a stack (explicit or via recursion). O(n) time, O(h) space where `h` is tree height.

```python
# Pre-order: root → left → right
def preorder(node):
    if node is None: return
    print(node.val)
    preorder(node.left)
    preorder(node.right)

# In-order: left → root → right (sorted output on a BST)
def inorder(node):
    if node is None: return
    inorder(node.left)
    print(node.val)
    inorder(node.right)

# Post-order: left → right → root (useful for deleting / aggregating from leaves up)
def postorder(node):
    if node is None: return
    postorder(node.left)
    postorder(node.right)
    print(node.val)
```

### Breadth-First (Level-Order) Traversal
Visit all nodes at depth `d` before any node at depth `d+1`. Uses a queue. O(n) time, O(w) space where `w` is the maximum width.

```python
from collections import deque

def level_order(root):
    if not root: return
    q = deque([root])
    while q:
        node = q.popleft()
        print(node.val)
        if node.left:  q.append(node.left)
        if node.right: q.append(node.right)
```

When to use each:

| Goal | Traversal |
|------|-----------|
| Copy a tree, print expressions | Pre-order |
| Sorted output on a BST, validate BST | In-order |
| Delete or compute size from leaves up | Post-order |
| Level-by-level (shortest path in unweighted tree) | Level-order |

## BST Operations

### Search
Compare against the current node; recurse into left or right.

```python
def search(node, target):
    if node is None or node.val == target:
        return node
    if target < node.val:
        return search(node.left, target)
    return search(node.right, target)
```

### Insert
Walk down the tree comparing against each node, then attach the new node where the search would have ended.

```python
def insert(node, val):
    if node is None:
        return TreeNode(val)
    if val < node.val:
        node.left = insert(node.left, val)
    elif val > node.val:
        node.right = insert(node.right, val)
    return node
```

### Delete
Three cases for the node being deleted:

1. **No children** — remove it directly.
2. **One child** — replace it with its child.
3. **Two children** — replace it with its **in-order successor** (smallest value in its right subtree), then delete that successor from the right subtree.

```python
def delete(node, val):
    if node is None: return None
    if val < node.val:
        node.left = delete(node.left, val)
    elif val > node.val:
        node.right = delete(node.right, val)
    else:
        if node.left is None:  return node.right
        if node.right is None: return node.left
        # two children: find in-order successor
        succ = node.right
        while succ.left:
            succ = succ.left
        node.val = succ.val
        node.right = delete(node.right, succ.val)
    return node
```

## Time and Space Complexity

For a binary tree with `n` nodes and height `h`:

| Operation | Balanced BST | Unbalanced BST | General Binary Tree |
|-----------|--------------|----------------|---------------------|
| Search | O(log n) | O(n) | O(n) |
| Insert | O(log n) | O(n) | — |
| Delete | O(log n) | O(n) | — |
| Traversal | O(n) | O(n) | O(n) |
| Find min / max | O(log n) | O(n) | O(n) |

**Space complexity:** O(n) for storage. Recursion uses O(h) stack space — O(log n) for balanced, O(n) worst case. Iterative traversals using an explicit stack or queue have the same asymptotic space.

## Advantages

- Hierarchical structure mirrors many real-world relationships.
- Balanced BSTs give O(log n) search, insert, and delete — much better than sorted arrays' O(n) insertion or linked lists' O(n) search.
- In-order BST traversal yields sorted output for free.
- Recursive structure makes many tree algorithms naturally clean to express.
- Foundation for heaps, tries, segment trees, and database indexes.

## Limitations

- Plain BSTs degrade to O(n) on bad input ordering (sorted insertion).
- Self-balancing variants are complex to implement correctly.
- Higher constant-factor overhead than arrays — pointers per node, poor cache locality.
- No O(1) random access.
- Tree-balancing rotations are a notorious source of bugs.

## Common Interview Problems

### Easy
- Maximum Depth of Binary Tree
- Same Tree
- Invert Binary Tree
- Symmetric Tree
- Balanced Binary Tree
- Path Sum
- Diameter of Binary Tree
- Convert Sorted Array to Binary Search Tree
- Binary Tree Inorder Traversal
- Range Sum of BST
- Search in a Binary Search Tree
- Minimum Depth of Binary Tree
- Sum of Left Leaves
- Subtree of Another Tree

### Medium
- Validate Binary Search Tree
- Lowest Common Ancestor of a Binary Tree
- Lowest Common Ancestor of a BST
- Binary Tree Level Order Traversal
- Construct Binary Tree from Preorder and Inorder Traversal
- Kth Smallest Element in a BST
- Binary Tree Right Side View
- Path Sum II
- Sum Root to Leaf Numbers
- Flatten Binary Tree to Linked List
- Populating Next Right Pointers in Each Node
- Delete Node in a BST
- Insert into a Binary Search Tree
- Binary Tree Zigzag Level Order Traversal
- Count Complete Tree Nodes
- House Robber III
- All Nodes Distance K in Binary Tree
- Binary Tree Pruning

### Hard
- Binary Tree Maximum Path Sum
- Serialize and Deserialize Binary Tree
- Recover Binary Search Tree
- Vertical Order Traversal of a Binary Tree
- Closest Binary Search Tree Value II
- Sum of Distances in Tree
- Number of Ways to Reorder Array to Get Same BST
