# Stacks

A **stack** is an abstract data type (ADT) that stores a collection of elements with access restricted to one end, called the **top**. It follows **LIFO** order (Last In, First Out): the most recently added element is the next one removed.

Stacks are not a concrete structure — they describe a *behavior* and can be implemented on top of an array or a linked list. The classic real-world analogy is a stack of plates: you can only add to or take from the top.

## Memory Representation

A stack is typically backed by one of two structures:

- **Dynamic array.** The top is the last index. Push appends to the end, pop removes from the end. Both are O(1) amortized. Better cache locality and faster in practice.
- **Singly linked list.** The top is the head. Push prepends a node, pop removes the head. Both are O(1). No resize cost, but each element carries pointer overhead.

The array-backed variant is the default choice unless you specifically need to avoid resizing or you're using the stack as part of a linked structure.

## Initialization in Python

Python's built-in `list` works as a stack. `append` is push, `pop` removes from the end.

```python
stack = []

stack.append(1)      # push
stack.append(2)
stack.append(3)
top = stack[-1]      # peek → 3
x = stack.pop()      # pop  → 3
empty = not stack    # is empty?
size = len(stack)
```

For thread-safe stacks in concurrent code, use `queue.LifoQueue`. Avoid `collections.deque` for stacks unless you also need queue-like operations — `list` is faster for pure stack usage.

## Types

There is only one stack ADT, but two variants come up often enough to be worth naming:

### Standard Stack
The plain LIFO structure described above.

### Monotonic Stack
A stack maintained so its elements stay in sorted order (either non-decreasing or non-increasing) by popping violators on each push. This pattern solves a large class of problems where you need to find the next greater (or smaller) element for every position in an array. Each element is pushed and popped at most once, so an entire pass is O(n).

```python
def next_greater_element(nums):
    result = [-1] * len(nums)
    stack = []  # holds indices, values strictly decreasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            result[stack.pop()] = x
        stack.append(i)
    return result
```

## Operations

| Operation | Description | Python |
|-----------|-------------|--------|
| `push(x)` | Add `x` to the top | `stack.append(x)` |
| `pop()` | Remove and return the top | `stack.pop()` |
| `peek()` / `top()` | Return the top without removing | `stack[-1]` |
| `is_empty()` | Check if the stack has no elements | `not stack` |
| `size()` | Number of elements | `len(stack)` |

Always check `is_empty()` (or equivalent) before `pop` and `peek` — both raise `IndexError` on an empty list.

## Time and Space Complexity

| Operation | Time | Notes |
|-----------|------|-------|
| Push | O(1) amortized | Occasional O(n) on resize |
| Pop | O(1) | |
| Peek | O(1) | |
| Search | O(n) | Must pop or scan |
| Access by index | O(1) | But violates the stack interface |

**Space complexity:** O(n) for n elements.

## Advantages

- Constant-time push and pop.
- Conceptually simple — the limited interface eliminates many bug categories.
- Natural fit for problems with nested or recursive structure: balanced parentheses, expression evaluation, function call frames, undo/redo, depth-first traversal.
- Cheap to implement on top of any sequential structure.

## Limitations

- No random access without breaking the abstraction.
- Searching is O(n).
- Iterative DFS-style problems can hit memory limits before recursion-based solutions, since each stack frame holds explicit state.
- Dynamic-array implementations may incur occasional O(n) resize cost.

## Common Interview Problems

### Easy
- Valid Parentheses
- Min Stack
- Implement Queue using Stacks
- Backspace String Compare
- Baseball Game
- Remove Outermost Parentheses

### Medium
- Daily Temperatures
- Next Greater Element II
- Evaluate Reverse Polish Notation
- Decode String
- Asteroid Collision
- Simplify Path
- Remove K Digits
- Online Stock Span
- 132 Pattern
- Validate Stack Sequences
- Sum of Subarray Minimums

### Hard
- Largest Rectangle in Histogram
- Trapping Rain Water
- Basic Calculator
- Maximum Frequency Stack
- Longest Valid Parentheses
- Remove Duplicate Letters
