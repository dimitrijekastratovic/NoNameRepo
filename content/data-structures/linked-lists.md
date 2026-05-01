# Linked Lists

A linked list is a sequence of nodes where each node holds a value and a pointer to the next node. Unlike arrays, nodes are not stored contiguously in memory.

## Types

- **Singly linked** — each node points to the next
- **Doubly linked** — each node points to both next and previous
- **Circular** — the tail points back to the head

## Time Complexity

| Operation | Complexity |
|-----------|------------|
| Access by index | O(n) |
| Insert at head | O(1) |
| Insert at tail | O(1) with tail pointer |
| Delete at head | O(1) |
| Search | O(n) |

## Common Patterns

### Fast and Slow Pointers
Two pointers moving at different speeds. Used to detect cycles or find the middle node.

```python
def has_cycle(head):
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
```

### Reversing a Linked List

```python
def reverse(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev
```

## Things to Watch Out For

- **Null pointer** — always check `node is not None` before accessing `node.next`
- **Losing the head** — keep a reference to the head before modifying the list
- **Off-by-one on length** — count carefully when finding the k-th node from the end
