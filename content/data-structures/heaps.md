# Heaps and Priority Queues

A **priority queue** is an abstract data type (ADT) that stores elements and lets you efficiently retrieve the one with the highest (or lowest) priority. Unlike a regular queue, order of retrieval is determined by priority, not insertion time.

A **heap** is the standard implementation of a priority queue. It is a tree-based structure that satisfies the **heap property**: every parent is ordered relative to its children. In a **min-heap**, every parent is ≤ its children, so the smallest element sits at the root. In a **max-heap**, every parent is ≥ its children, so the largest sits at the root.

Heaps give O(log n) insertion and extraction, O(1) access to the top element, and O(n) construction from an unordered array. They power algorithms like Dijkstra's shortest path, Huffman coding, A* search, and any "top K" problem.

## Memory Representation

A binary heap is a **complete binary tree** — every level is full except possibly the last, which fills left to right. This shape allows the entire tree to be stored in an array with no pointers. For a node at index `i`:

```
parent(i)      = (i - 1) // 2
left_child(i)  = 2 * i + 1
right_child(i) = 2 * i + 2
```

```
Tree:                   Array:
        ┌───┐
        │ 1 │            [1, 3, 2, 7, 5, 4, 6]
        └─┬─┘             0  1  2  3  4  5  6
       ┌──┴──┐
     ┌─┴─┐ ┌─┴─┐
     │ 3 │ │ 2 │
     └─┬─┘ └─┬─┘
      ┌┴┐  ┌┴─┐
     ┌┴┐┌┴┐┌┴┐┌┴┐
     │7││5││4││6│
     └─┘└─┘└─┘└─┘
```

This compact layout has two benefits: no pointer overhead, and excellent cache locality during traversals.

## Initialization in Python

Python's `heapq` module implements a **min-heap** over a regular list. There is no built-in max-heap.

```python
import heapq

heap = []
heapq.heappush(heap, 3)
heapq.heappush(heap, 1)
heapq.heappush(heap, 4)
heapq.heappush(heap, 1)

heapq.heappop(heap)   # 1
heap[0]               # peek the smallest → 1
```

To turn an existing list into a heap in O(n):

```python
nums = [4, 1, 7, 3, 8, 5]
heapq.heapify(nums)   # nums is now a valid min-heap
```

For a **max-heap**, negate values on the way in and out:

```python
heapq.heappush(heap, -value)
largest = -heapq.heappop(heap)
```

For a **priority queue with associated data**, push tuples of `(priority, item)`. Python compares tuples element by element, so ties on priority fall through to the item. Use a counter to break ties deterministically and avoid comparing unrelated objects:

```python
import itertools
counter = itertools.count()
heapq.heappush(pq, (priority, next(counter), item))
```

`heapq.nlargest(k, iterable)` and `heapq.nsmallest(k, iterable)` are convenient one-liners for top-K problems and run in O(n log k).

## Types of Heaps

### Min-Heap vs Max-Heap
Determined by the heap property's direction. Most languages provide one and require negation or a custom comparator for the other. Java's `PriorityQueue` is a min-heap by default; pass a reversed comparator for a max-heap.

### Binary Heap
The standard heap, with two children per node. All complexity figures in this article refer to binary heaps unless noted.

### d-ary Heap
Each node has `d` children. Reduces tree height to log_d(n), making `decrease-key` faster (fewer comparisons on the way up), at the cost of slower `extract-min` (more children to compare on the way down). Useful in dense Dijkstra implementations. Rarely needed in interviews.

### Fibonacci Heap
A theoretical structure giving O(1) amortized insert and decrease-key, with O(log n) amortized extract-min. Improves the asymptotic complexity of Dijkstra and Prim, but the constant factors are large enough that simpler heaps win in practice. Worth knowing the name; not worth implementing.

### Indexed / Augmented Heap
A heap paired with a hash map from value to its index in the heap array. Allows O(log n) decrease-key and arbitrary deletion. Commonly used in Dijkstra implementations that need to update distances.

## Operations

### Sift Down (Heapify Down)
Restore the heap property by moving an element down the tree. Used in extraction and bulk heap construction.

```python
def sift_down(heap, i, n):
    while 2 * i + 1 < n:
        left, right = 2 * i + 1, 2 * i + 2
        smallest = left
        if right < n and heap[right] < heap[left]:
            smallest = right
        if heap[i] <= heap[smallest]:
            break
        heap[i], heap[smallest] = heap[smallest], heap[i]
        i = smallest
```

### Sift Up (Heapify Up)
Restore the heap property by moving an element up. Used in insertion.

```python
def sift_up(heap, i):
    while i > 0:
        parent = (i - 1) // 2
        if heap[i] >= heap[parent]:
            break
        heap[i], heap[parent] = heap[parent], heap[i]
        i = parent
```

### Insert (Push)
Append the new element at the end, then sift up. O(log n).

### Extract (Pop)
Save the root, replace it with the last element, shrink the array by one, then sift down from the root. O(log n).

### Peek
Return `heap[0]`. O(1).

### Build Heap
Calling `sift_down` on every non-leaf node from the middle of the array down to index 0 produces a valid heap in **O(n)**, not O(n log n). The argument is that nodes near the bottom dominate count but require few swaps. This is a frequent interview gotcha.

```python
def heapify(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        sift_down(arr, i, n)
```

### Decrease-Key / Increase-Key
Update an element's value and sift in the appropriate direction. O(log n) once you know the index — but finding the index requires a separate map, since heaps don't support search.

## Time and Space Complexity

| Operation | Time | Notes |
|-----------|------|-------|
| Peek (top) | O(1) | Just `heap[0]` |
| Insert (push) | O(log n) | Sift up |
| Extract (pop) | O(log n) | Sift down |
| Build heap | O(n) | Bulk heapify |
| Heapify single node | O(log n) | |
| Search arbitrary element | O(n) | No order across siblings |
| Delete arbitrary element | O(n) | Find + sift |
| Merge two heaps (binary) | O(n) | Concat and re-heapify |

**Space complexity:** O(n) for storage. The array layout has no pointer overhead.

## Heap vs BST

Both give O(log n) insert and remove, but they answer different questions:

| | Heap | BST |
|---|------|-----|
| Find min / max | O(1) | O(log n) |
| Find arbitrary element | O(n) | O(log n) |
| In-order (sorted) iteration | O(n log n) | O(n) |
| Memory layout | Array, no pointers | Node-based |
| Use case | Top-K, scheduling, Dijkstra | Range queries, ordered iteration |

Reach for a heap when you only care about extremes; reach for a BST (or sorted structure) when you need full ordering or range queries.

## Advantages

- O(1) access to the highest-priority element.
- O(log n) insert and extract — fast enough for huge datasets.
- O(n) construction from an unordered array.
- Compact array storage with no pointer overhead and excellent cache behavior.
- Conceptually simple compared to balanced BSTs.
- Foundation of many graph algorithms (Dijkstra, Prim) and scheduling systems.

## Limitations

- No efficient search for arbitrary elements (O(n)).
- No efficient ordered iteration; popping all elements gives sorted output but in O(n log n).
- Decrease-key requires an external index map to be efficient.
- Python's `heapq` is min-heap only — max-heap requires manual negation, which is awkward for non-numeric types.
- Not stable: equal-priority elements may emerge in any order unless ties are broken explicitly with a counter or sequence number.

## Common Interview Problems

### Easy
- Kth Largest Element in a Stream
- Last Stone Weight
- Relative Ranks
- Take Gifts From the Richest Pile
- Minimum Operations to Halve Array Sum

### Medium
- Kth Largest Element in an Array
- Top K Frequent Elements
- K Closest Points to Origin
- Find K Pairs with Smallest Sums
- Reorganize String
- Task Scheduler
- Furthest Building You Can Reach
- Sort Characters By Frequency
- Single-Threaded CPU
- Maximum Subsequence Score
- Seat Reservation Manager
- Minimum Cost to Connect Sticks
- Process Tasks Using Servers
- Design Twitter

### Hard
- Find Median from Data Stream (two heaps)
- Merge k Sorted Lists
- The Skyline Problem
- Sliding Window Median
- Trapping Rain Water II
- IPO
- Smallest Range Covering Elements from K Lists
- Minimum Cost to Hire K Workers
- Swim in Rising Water
