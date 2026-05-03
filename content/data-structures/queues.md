# Queues

A **queue** is an abstract data type (ADT) that stores a collection of elements with insertion at one end (the **rear** or **tail**) and removal from the other (the **front** or **head**). It follows **FIFO** order (First In, First Out): elements are removed in the order they were added.

Like the stack, a queue describes a *behavior*, not a concrete structure — it can be backed by a linked list, a circular buffer, or a pair of stacks. The real-world analogy is a line at a checkout counter: people are served in the order they arrive.

## Memory Representation

A naive array-backed queue runs into trouble: removing from the front requires shifting every remaining element, making dequeue O(n). The standard solutions are:

- **Linked list with head and tail pointers.** Enqueue appends at the tail, dequeue removes from the head. Both O(1). Pointer overhead per node, but no resize cost.
- **Circular buffer (ring buffer).** A fixed-size array with `front` and `rear` indices that wrap around using modulo arithmetic. Enqueue and dequeue are O(1) with no shifting. Cache-friendly. Requires capacity to be known up front.
- **Doubly linked list.** Used when the queue must also support O(1) operations at both ends (a deque).

Python's `collections.deque` is implemented as a doubly linked list of fixed-size blocks, giving O(1) operations at both ends with reasonable cache locality.

## Initialization in Python

Use `collections.deque`, **not** `list`. A list's `pop(0)` is O(n) because every remaining element shifts down — a common performance bug.

```python
from collections import deque

queue = deque()

queue.append(1)        # enqueue
queue.append(2)
queue.append(3)
front = queue[0]       # peek → 1
x = queue.popleft()    # dequeue → 1
empty = not queue
size = len(queue)
```

For thread-safe queues, use `queue.Queue` (FIFO) or `multiprocessing.Queue` for inter-process communication.

## Types

### Simple Queue
The plain FIFO structure described above.

### Deque (Double-Ended Queue)
Supports insertion and removal at both ends in O(1). `collections.deque` is a deque despite its name. Used for sliding window problems, palindrome checks, and as the underlying structure for monotonic queues.

```python
from collections import deque
dq = deque()
dq.appendleft(1)   # add to front
dq.append(2)       # add to rear
dq.popleft()       # remove from front
dq.pop()           # remove from rear
```

### Circular Queue
A fixed-size queue implemented on a circular buffer. When the rear reaches the end of the array, it wraps around to index 0 if there is room. Used in bounded producer–consumer scenarios, ring buffers for streaming data, and OS scheduling.

### Priority Queue
Elements are dequeued in order of priority rather than insertion order. Typically implemented with a binary heap, giving O(log n) insertion and removal. Covered in detail in the Heaps article. Python's `heapq` provides a min-heap-based priority queue.

### Monotonic Queue (Monotonic Deque)
A deque maintained so its elements stay in monotonic (non-increasing or non-decreasing) order. As elements enter, violators are popped from the back; as the window slides, expired elements are popped from the front. Solves sliding-window-extreme problems in O(n) total — each element is pushed and popped at most once.

```python
from collections import deque

def sliding_window_max(nums, k):
    dq = deque()  # stores indices, values strictly decreasing
    result = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] < x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result
```

## Operations

| Operation | Description | Python |
|-----------|-------------|--------|
| `enqueue(x)` | Add `x` to the rear | `queue.append(x)` |
| `dequeue()` | Remove and return from the front | `queue.popleft()` |
| `peek()` / `front()` | Return the front without removing | `queue[0]` |
| `is_empty()` | Check if the queue has no elements | `not queue` |
| `size()` | Number of elements | `len(queue)` |

Always check `is_empty()` before `dequeue` or `peek` — both raise `IndexError` on an empty deque.

## Time and Space Complexity

| Operation | Time | Notes |
|-----------|------|-------|
| Enqueue | O(1) | |
| Dequeue | O(1) | |
| Peek | O(1) | |
| Search | O(n) | Must scan |
| Access by index | O(n) for deque | `deque[i]` walks from the nearest end |

**Space complexity:** O(n) for n elements.

## Advantages

- Constant-time enqueue and dequeue at the restricted endpoints.
- Natural fit for breadth-first algorithms: BFS traversal, level-order tree traversal, shortest-path-by-hops, scheduling.
- Models real-world ordering: task queues, request buffers, message passing.
- Bounded variants (circular queues) provide back-pressure in producer–consumer systems.

## Limitations

- No random access without breaking the abstraction.
- Searching is O(n).
- Naive list-backed queues in Python are an O(n)-per-op trap.
- Fixed-size circular queues require capacity planning and have an "is full vs is empty" ambiguity that needs careful handling (typically by tracking size separately or leaving one slot unused).

## Common Interview Problems

### Easy
- Implement Stack using Queues
- Number of Recent Calls
- Moving Average from Data Stream
- First Unique Character in a String
- Time Needed to Buy Tickets

### Medium
- Design Circular Queue
- Design Circular Deque
- Design Hit Counter
- Open the Lock (BFS)
- Rotting Oranges (BFS)
- Walls and Gates (BFS)
- Perfect Squares (BFS)
- Number of Islands (BFS variant)
- Course Schedule (BFS topological sort)
- Snakes and Ladders
- Shortest Path in Binary Matrix

### Hard
- Sliding Window Maximum (monotonic deque)
- Shortest Subarray with Sum at Least K (monotonic deque)
- Constrained Subsequence Sum
- Shortest Path in a Grid with Obstacles Elimination
- Bus Routes
