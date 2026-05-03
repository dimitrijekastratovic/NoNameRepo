# Recursion

**Recursion** is a technique where a function solves a problem by calling itself on a smaller version of the same problem. The smaller calls eventually reach a case simple enough to solve directly, and their results combine back up to solve the original.

Recursion isn't a single algorithm — it's a way of expressing solutions. Tree traversals, depth-first search, divide and conquer, and dynamic programming are all built on it. Understanding recursion is the foundation for the algorithms covered in the next several articles.

A few terms used throughout:

- **Base case** — the simplest version of the problem, solved without further recursion.
- **Recursive case** — the version that reduces the problem and calls the function again.
- **Call stack** — the runtime structure that tracks in-progress function calls. Each call adds a **stack frame**; returning removes one.
- **Recursion tree** — a diagram showing all the recursive calls made for a given input.

## The Two Required Parts

Every correct recursive function has two parts:

1. A **base case** that handles the smallest input directly, with no further recursion.
2. A **recursive case** that solves a smaller version of the problem and uses its result.

Without a base case, recursion never stops and the program crashes with a stack overflow. Without a recursive case that makes progress toward the base case, the function loops forever in deeper and deeper calls.

```python
def factorial(n):
    if n <= 1:                  # base case
        return 1
    return n * factorial(n - 1) # recursive case
```

For `factorial(4)`, the calls unfold like this:

```
factorial(4)
  → 4 * factorial(3)
        → 3 * factorial(2)
              → 2 * factorial(1)
                    → 1                  (base case reached)
              → 2 * 1 = 2
        → 3 * 2 = 6
  → 4 * 6 = 24
```

Each line is a stack frame. The frames pile up on the way down and unwind in reverse on the way back up.

## How the Call Stack Works

When a function calls itself, the language runtime saves the current state — local variables, the line being executed — onto the **call stack**, then starts executing the new call from the beginning. When that call returns, its frame is popped, and execution resumes in the previous frame at the line after the recursive call.

This is what makes recursion "remember" where to come back to. You don't need an explicit stack data structure because the runtime is using one for you.

The cost is memory: each pending call holds a frame on the stack. A recursion `n` levels deep uses `O(n)` extra memory, even if each individual call uses `O(1)` of its own. Python's default recursion limit is around 1000 frames; deep recursion can hit `RecursionError: maximum recursion depth exceeded`.

```python
import sys
sys.setrecursionlimit(10**6)    # raise the limit if necessary
```

Raising the limit too far can crash the interpreter — Python's recursion is not optimized, so each frame uses real memory.

## How to Think About Recursion

Beginners often try to trace every recursive call mentally — what calls what, in what order, with which values. For shallow recursion this works; for deep recursion it becomes unmanageable.

A more sustainable approach is the **recursive leap of faith**: when writing the recursive case, *trust that the recursive call works correctly* on its smaller input, even though you haven't finished writing the function. Then ask: given that smaller answer, how do I produce the answer for the current input?

For factorial, the leap of faith says: "Assume `factorial(n - 1)` correctly returns `(n−1)!`. Then `factorial(n)` is just `n * factorial(n − 1)`." You don't trace through the smaller call — you trust it.

Three questions to ask when writing a recursive function:

1. **What is the base case?** What's the smallest input I can answer immediately?
2. **How do I shrink the problem?** What does "smaller version of this problem" look like?
3. **How do I combine the smaller answer with the current input?**

If all three have clear answers, the recursion writes itself.

## Common Recursion Patterns

### Linear Recursion (One Call)

The function makes a single recursive call. Each call reduces the input by a constant amount or a constant fraction.

```python
def sum_list(lst):
    if not lst:
        return 0
    return lst[0] + sum_list(lst[1:])
```

Time: O(n). Space: O(n) for the call stack.

### Binary Recursion (Two Calls)

The function makes two recursive calls per invocation. Tree algorithms and naive Fibonacci are classic examples.

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

Time: O(2ⁿ) — the recursion tree has roughly 2ⁿ nodes. Space: O(n) for the deepest path. The exponential time is because the same subproblems are recomputed many times — `fib(3)` is computed 3 times for `fib(6)`, `fib(2)` is computed 5 times, and so on. **Memoization** (caching results) collapses this to O(n) and is the bridge to dynamic programming.

```python
from functools import cache

@cache
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

`@cache` (Python 3.9+) memoizes the function — every input is computed at most once. The Dynamic Programming article covers this transformation in depth.

### Multiple Recursion

The function makes more than two recursive calls. Permutations and combinations are the most common cases — generating all arrangements of `n` items requires recursing into each remaining choice.

```python
def permutations(items):
    if len(items) <= 1:
        return [items]
    result = []
    for i in range(len(items)):
        rest = items[:i] + items[i+1:]
        for p in permutations(rest):
            result.append([items[i]] + p)
    return result
```

This is also the structural pattern of **backtracking**, covered in its own article.

### Recursion on Trees

Tree problems are almost always cleanest with recursion because the tree itself is a recursive structure: a node has subtrees, which are themselves trees. The base case is usually `if node is None: return ...`.

```python
def tree_sum(node):
    if node is None:
        return 0
    return node.val + tree_sum(node.left) + tree_sum(node.right)

def max_depth(node):
    if node is None:
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))
```

Each function follows the same shape: handle `None`, then combine the recursive answers from the children.

### Tail Recursion

A recursive call is **tail-recursive** if it is the last operation in the function — its result is returned directly, not combined with anything else. Some languages optimize tail recursion by reusing the current stack frame, turning it into a loop and avoiding stack growth.

**Python does not optimize tail recursion.** A tail-recursive Python function still uses O(n) stack space and still hits the recursion limit. When tail recursion would be a loop in another language, write the loop explicitly in Python.

```python
# Tail-recursive (still O(n) stack in Python)
def sum_to(n, acc=0):
    if n == 0:
        return acc
    return sum_to(n - 1, acc + n)

# Iterative (O(1) space)
def sum_to(n):
    acc = 0
    for i in range(n + 1):
        acc += i
    return acc
```

## Recursion vs Iteration

Most recursive functions can be rewritten as loops, and vice versa. The choice usually comes down to clarity, not capability.

| | Recursion | Iteration |
|---|-----------|-----------|
| Memory | O(depth) call stack | O(1) usually |
| Clarity | Often clearer for tree / divide-and-conquer | Often clearer for linear scans |
| Speed | Function-call overhead | No call overhead |
| Risk | Stack overflow on deep input | None |
| Natural fit | Trees, recursive data, divide and conquer | Loops over arrays, accumulators |

When the problem has a **recursive structure** (trees, nested expressions, divide and conquer), recursion is usually clearer. When it doesn't (summing an array, finding a max), iteration is usually better. For interview problems, prioritize clarity unless the depth is large enough to cause stack issues.

## Analyzing Time Complexity

The time complexity of a recursive function is described by a **recurrence relation** — an equation expressing the time `T(n)` in terms of `T` on smaller inputs.

| Pattern | Recurrence | Time |
|---------|-------------|------|
| Linear, decrease by 1 | `T(n) = T(n-1) + O(1)` | O(n) |
| Linear, halve | `T(n) = T(n/2) + O(1)` | O(log n) |
| Binary, halve, linear merge | `T(n) = 2T(n/2) + O(n)` | O(n log n) |
| Binary, decrease by 1 | `T(n) = 2T(n-1) + O(1)` | O(2ⁿ) |
| Halve and ignore one half | `T(n) = T(n/2) + O(1)` | O(log n) |

The first three are the recurrences for typical algorithms — linear scan, binary search, merge sort. The fourth is naive Fibonacci. The Master Theorem provides a general formula for solving these; the specific cases above cover most interview problems.

The **recursion tree** is a visual aid: draw each call as a node, its recursive calls as children, and label each node with the work done at that level. The total time is the sum of work across all nodes.

## Common Pitfalls

- **Missing or wrong base case.** The function recurses forever and crashes with `RecursionError`. Always write the base case first.
- **Recursive case doesn't shrink the problem.** Calling `f(n)` from inside `f(n)` with the same `n` is a guaranteed infinite recursion. Make sure each recursive call uses a strictly smaller (or simpler) input.
- **Off-by-one in the base case.** Using `if n == 0` when the function should bottom out at `n == 1` (or vice versa) gives correct-looking code that returns wrong answers. Trace small inputs (n=0, n=1, n=2) by hand.
- **Modifying shared mutable state.** When recursive calls share a list, set, or dict, mutations from one call are visible to others. This is sometimes intentional (backtracking) and sometimes a bug. Either copy on call or undo changes after returning.
- **Repeated subproblems.** Naive Fibonacci is the canonical example — exponential time because the same calls are made over and over. If the same input shows up in the recursion tree more than once, memoize.
- **Stack overflow on large input.** Python caps recursion at ~1000 frames. For an `n = 100,000` linked list problem, recursive code crashes; iterative doesn't. Be aware which inputs your problem allows.
- **Default mutable arguments.** `def f(x, seen=set())` — the same `set()` is shared across all calls because Python evaluates default arguments once at definition time. Use `seen=None` and initialize inside the function instead.
- **Over-relying on recursion for performance.** Recursive code with function-call overhead is slower than the equivalent loop in Python. For tight loops, iteration wins.
- **Confusing "the function" with "the call."** The function describes the rule; each call has its own local variables. When debugging, always think about which specific call you're looking at.

## Common Interview Problems

### Easy
- Power of Two
- Power of Three
- Fibonacci Number
- Climbing Stairs (recursive solution before DP)
- Reverse String (in place via recursion)
- Merge Two Sorted Lists (recursive)
- Reverse Linked List (recursive)
- Maximum Depth of Binary Tree
- Same Tree
- Symmetric Tree
- Sum of Digits
- Pow(x, n) — fast power via recursion

### Medium
- Permutations
- Combinations
- Subsets
- Generate Parentheses
- Letter Combinations of a Phone Number
- Decode Ways
- Different Ways to Add Parentheses
- Validate Binary Search Tree
- Lowest Common Ancestor of a Binary Tree
- Construct Binary Tree from Preorder and Inorder Traversal
- Path Sum II
- Sum Root to Leaf Numbers
- House Robber III
- Flatten Binary Tree to Linked List
- Unique Binary Search Trees II
- Count Good Numbers
- Count of Substrings Containing Every Vowel and K Consonants

### Hard
- Regular Expression Matching
- Wildcard Matching
- Word Break II
- N-Queens (foundation for backtracking article)
- Sudoku Solver
- Expression Add Operators
- Recover Binary Search Tree
- Binary Tree Maximum Path Sum
- Serialize and Deserialize Binary Tree
- Different Ways to Add Parentheses (memoized)
- Strobogrammatic Number II
