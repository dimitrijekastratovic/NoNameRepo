# Linked Lists

A **linked list** is a linear data structure where elements, called **nodes**, are stored in non-contiguous memory and connected by pointers. Each node holds a value and one or more references to other nodes. Unlike arrays, linked lists do not require contiguous memory and can grow or shrink without reallocation, but they sacrifice O(1) random access — reaching the *k*-th element requires walking *k* nodes.

## Memory Representation

Nodes are allocated individually on the heap and may be scattered anywhere in memory. The list is identified by a single reference to its first node, the **head**. Each node points to the next, and the final node points to `None` (or back to the head, in a circular list).

```
head → [10 | •] → [20 | •] → [30 | •] → None
```

This layout has two consequences:
- **No address arithmetic.** To reach index *k*, you must follow *k* pointers. Random access is O(n).
- **Poor cache locality.** Sequential nodes are not adjacent in memory, so traversal causes more cache misses than the equivalent array traversal.

The benefit is that inserting or deleting a node — given a reference to its position — only requires rewiring a few pointers, no shifting of elements.

## Declaration and Initialization (Python)

Python has no built-in linked list. You define a `Node` class and manage the head reference yourself.

```python
class Node:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Build the list 1 → 2 → 3
head = Node(1, Node(2, Node(3)))

# Or build it iteratively from an array
def from_list(values):
    dummy = Node()
    tail = dummy
    for v in values:
        tail.next = Node(v)
        tail = tail.next
    return dummy.next

head = from_list([1, 2, 3])
```

The `dummy` (sentinel) node is a common trick to avoid special-casing the empty list during construction.

## Types of Linked Lists

### Singly Linked List
Each node has a single pointer, `next`, referencing the following node. Traversal is one-directional. This is the simplest and most memory-efficient variant.

```python
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None
```

### Doubly Linked List
Each node has two pointers, `next` and `prev`, referencing the following and preceding nodes. Enables O(1) deletion given a node reference (no need to track the previous node) and bidirectional traversal. Costs an extra pointer per node.

```python
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None
        self.prev = None
```

Doubly linked lists are the backbone of LRU caches, deques, and ordered-map implementations where elements must be moved or removed efficiently from arbitrary positions.

### Circular Linked List
The tail's `next` points back to the head instead of `None`. Can be singly or doubly linked. Useful for round-robin schedulers, ring buffers, and any cyclic traversal.

## Operations

The following examples use a singly linked list unless noted. Doubly linked equivalents update `prev` pointers as well.

### Traversal
Walk from the head, following `next` pointers until `None`. O(n).

```python
def traverse(head):
    curr = head
    while curr:
        print(curr.val)
        curr = curr.next
```

### Access by Index
No random access. To reach index *k*, traverse *k* nodes. O(n).

```python
def get(head, k):
    curr = head
    for _ in range(k):
        if curr is None:
            return None
        curr = curr.next
    return curr
```

### Search
Walk the list comparing each value. O(n).

```python
def search(head, target):
    curr = head
    while curr:
        if curr.val == target:
            return curr
        curr = curr.next
    return None
```

### Insertion

**At the head.** Create a new node pointing to the current head, then update the head reference. O(1).

```python
def insert_head(head, val):
    return Node(val, head)
```

**At the tail.** Without a tail pointer, must traverse to the end. O(n). With a maintained tail pointer, O(1).

```python
def insert_tail(head, val):
    new_node = Node(val)
    if head is None:
        return new_node
    curr = head
    while curr.next:
        curr = curr.next
    curr.next = new_node
    return head
```

**At a given position.** Walk to the node *before* the insertion point, then rewire two pointers. O(n) worst case.

```python
def insert_after(node, val):
    node.next = Node(val, node.next)
```

### Deletion

**At the head.** Move the head pointer to the second node. O(1).

```python
def delete_head(head):
    return head.next if head else None
```

**At a given node** (singly linked, prev unknown). Must traverse to find the previous node. O(n). In a doubly linked list, this is O(1) because `node.prev` is available.

```python
def delete_value(head, target):
    dummy = Node(0, head)
    prev, curr = dummy, head
    while curr:
        if curr.val == target:
            prev.next = curr.next
            break
        prev, curr = curr, curr.next
    return dummy.next
```

## Dummy Node Pattern

Many linked list operations can modify the head — deleting the first node, inserting before the head, reversing, partitioning. Without care, every such operation needs a special branch for "what if the change happens at the head?".

The **dummy node** (also called a **sentinel**) is an extra node placed before the real head. Because every real node now has a predecessor, head-modifying operations can be expressed the same way as middle-of-list operations, eliminating the special case. At the end, return `dummy.next` instead of the original head.

The pattern is especially clean when building a new list — you don't know what the head will be until the first element is chosen, but the dummy gives you something to append to from the start.

```python
def merge_sorted(a, b):
    dummy = Node()
    tail = dummy
    while a and b:
        if a.val <= b.val:
            tail.next = a
            a = a.next
        else:
            tail.next = b
            b = b.next
        tail = tail.next
    tail.next = a or b  # attach whichever list still has nodes
    return dummy.next
```

Use this pattern whenever:
- The head may be deleted, replaced, or inserted before.
- Two lists are being merged or interleaved into a new list.
- A sublist is being reversed in place and the original head may shift.

For doubly linked lists, two sentinels — one before the head and one after the tail — eliminate null checks at both ends and are standard in production implementations (Java's `LinkedList`, for example).

## Time and Space Complexity

| Operation | Singly | Doubly | Notes |
|-----------|--------|--------|-------|
| Access by index | O(n) | O(n) | Must traverse |
| Search | O(n) | O(n) | |
| Insert at head | O(1) | O(1) | |
| Insert at tail | O(n) / O(1) | O(n) / O(1) | O(1) with tail pointer |
| Insert after a known node | O(1) | O(1) | |
| Delete head | O(1) | O(1) | |
| Delete a known node | O(n) | O(1) | Doubly: prev pointer available |
| Delete by value | O(n) | O(n) | Must search first |

**Space complexity:** O(n) for n nodes. Each node carries one pointer (singly) or two (doubly) in addition to its value.

## Advantages

- Dynamic size — grows and shrinks without reallocation.
- O(1) insertion and deletion at the head, or anywhere given a node reference (doubly linked).
- No need for contiguous memory; useful when memory is fragmented.
- Easy to splice or merge lists by rewiring pointers.

## Limitations

- O(n) random access. Reaching the *k*-th element is slow.
- Extra memory per element for pointers (one or two pointer-widths per node).
- Poor cache locality; slower in practice than arrays for traversal-heavy workloads.
- Singly linked lists cannot be traversed backwards.
- More error-prone — pointer manipulation, null checks, and edge cases (empty list, single node, head/tail updates) cause many off-by-one bugs.

## Common Interview Problems

### Easy
- Reverse Linked List
- Merge Two Sorted Lists
- Linked List Cycle (detect using fast/slow pointers)
- Middle of the Linked List
- Remove Duplicates from Sorted List
- Palindrome Linked List
- Remove Linked List Elements
- Intersection of Two Linked Lists

### Medium
- Add Two Numbers
- Remove Nth Node From End of List
- Reorder List
- Linked List Cycle II (find the cycle's start)
- Copy List with Random Pointer
- Odd Even Linked List
- Sort List (merge sort on a linked list)
- Reverse Linked List II (reverse a sublist)
- Rotate List
- Swap Nodes in Pairs
- Partition List
- LRU Cache (hash map + doubly linked list)
- Flatten a Multilevel Doubly Linked List

### Hard
- Reverse Nodes in k-Group
- Merge k Sorted Lists
- LFU Cache
