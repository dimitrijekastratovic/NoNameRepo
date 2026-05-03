# Divide and Conquer

**Divide and conquer** is an algorithmic paradigm that solves a problem by breaking it into smaller, independent subproblems of the same type, solving each recursively, and combining their results into a solution for the original. Many of the most important algorithms in computer science follow this pattern: merge sort, quicksort, binary search, the Fast Fourier Transform, Karatsuba multiplication, and Strassen's matrix multiplication all reduce a hard problem to easier instances of itself.

Divide and conquer is closely related to recursion (which is the mechanism it uses) and to dynamic programming (which also breaks problems into subproblems, but solves overlapping ones). Recognizing when to use which of these three is one of the more nuanced skills in algorithm design.

A few terms used throughout:

- **Subproblem** — a smaller instance of the same problem.
- **Divide step** — splitting the input into pieces.
- **Conquer step** — recursively solving each piece.
- **Combine step** — assembling the subproblem solutions into the full solution.
- **Recurrence** — an equation describing the time `T(n)` in terms of `T` on smaller inputs.

## The Three Steps

Every divide-and-conquer algorithm follows the same shape:

1. **Divide** — break the input into smaller subproblems, usually by halving.
2. **Conquer** — solve each subproblem recursively. When the subproblem is small enough (the **base case**), solve it directly.
3. **Combine** — merge the subproblem solutions into the answer for the original problem.

```python
def divide_and_conquer(problem):
    if is_base_case(problem):
        return solve_directly(problem)
    subproblems = divide(problem)
    sub_solutions = [divide_and_conquer(sp) for sp in subproblems]
    return combine(sub_solutions)
```

The technique works when the subproblems are independent (one subproblem's solution doesn't depend on another's) and when the combine step is efficient enough that the recursion saves work overall.

## Divide and Conquer vs Dynamic Programming vs Decrease and Conquer

These three techniques are commonly confused. They all break problems into subproblems but differ in important ways:

| | Divide and Conquer | Dynamic Programming | Decrease and Conquer |
|---|---|---|---|
| Subproblems | Independent (no overlap) | Overlapping (computed many times) | Single, smaller subproblem |
| Memoization | Doesn't help | Essential | Doesn't help |
| Typical structure | Two or more recursive calls per level | Tabulation or memoized recursion | One recursive call per level |
| Examples | Merge sort, FFT, closest pair | Fibonacci, edit distance, knapsack | Binary search, Euclidean GCD |

**Divide and conquer** is correct when the subproblems are disjoint — solving the left half of an array doesn't tell you anything about the right half. **Dynamic programming** is needed when the same subproblems show up repeatedly and you want to avoid recomputing them. **Decrease and conquer** is a special case of divide and conquer with only one subproblem; binary search is the canonical example.

## Analyzing Divide-and-Conquer: The Master Theorem

The running time of divide-and-conquer algorithms is described by recurrences of the form:

```
T(n) = a · T(n / b) + f(n)
```

where `a` is the number of subproblems, `b` is the factor by which the input shrinks for each subproblem, and `f(n)` is the work done to divide and combine.

The **Master Theorem** gives a clean answer for the three common cases. Let `c = log_b(a)` (the "critical exponent"). Compare `f(n)` against `n^c`:

| Case | Condition | Result |
|------|-----------|--------|
| 1. Subproblems dominate | `f(n) = O(n^d)` for some `d < c` | `T(n) = O(n^c)` |
| 2. Equal weight | `f(n) = O(n^c)` | `T(n) = O(n^c · log n)` |
| 3. Combine dominates | `f(n) = O(n^d)` for some `d > c` | `T(n) = O(f(n))` |

Worked through on the standard examples:

- **Merge sort:** `T(n) = 2T(n/2) + O(n)`. Here `a = 2, b = 2, c = log₂(2) = 1`, and `f(n) = n^1`. Case 2 → **O(n log n)**.
- **Binary search:** `T(n) = T(n/2) + O(1)`. Here `a = 1, b = 2, c = 0`, and `f(n) = n^0`. Case 2 → **O(log n)**.
- **Tree traversal:** `T(n) = 2T(n/2) + O(1)`. Here `a = 2, b = 2, c = 1`, and `f(n) = n^0`. Case 1 → **O(n)**.
- **Karatsuba multiplication:** `T(n) = 3T(n/2) + O(n)`. Here `a = 3, b = 2, c = log₂(3) ≈ 1.585`. Case 1 → **O(n^1.585)**.

For interviews, you don't need to memorize the formal theorem — knowing the three "shapes" (recursive calls dominate, equal weight, combine dominates) is enough to estimate complexity from a recurrence.

## Common Examples

### Merge Sort and Quick Sort

The canonical divide-and-conquer algorithms. Both split an array into roughly equal halves and recursively sort them. Merge sort does most of its work in the combine step (merging two sorted halves); quick sort does most of its work in the divide step (partitioning). Both are covered in detail in the Sorting Algorithms article.

### Binary Search

Decrease and conquer rather than divide and conquer in the strict sense — only one of the two halves is searched. Covered in the Binary Search article.

### Fast Exponentiation (Pow(x, n))

Computing `x^n` naively takes O(n) multiplications. Divide and conquer reduces it to O(log n):

```python
def fast_pow(x, n):
    if n == 0:
        return 1
    if n < 0:
        return 1 / fast_pow(x, -n)
    half = fast_pow(x, n // 2)
    if n % 2 == 0:
        return half * half
    else:
        return half * half * x
```

The key insight: `x^n = (x^(n/2))² when n is even`, and `x^n = x · (x^(n/2))²` when `n` is odd. Each call halves `n`, giving the recurrence `T(n) = T(n/2) + O(1)` and so O(log n) total time.

This pattern generalizes to **matrix exponentiation** — useful for computing the n-th Fibonacci number in O(log n) by raising the Fibonacci transition matrix to the n-th power.

### Counting Inversions

An **inversion** is a pair `(i, j)` with `i < j` and `arr[i] > arr[j]` — a measure of how unsorted an array is. The brute force is O(n²); divide and conquer using a modified merge sort gives O(n log n).

The trick: during the merge step of merge sort, when an element from the right half is smaller than the current element from the left half, every remaining element in the left half forms an inversion with it. Count these as you merge.

```python
def count_inversions(arr):
    def merge_count(arr):
        if len(arr) <= 1:
            return arr, 0
        mid = len(arr) // 2
        left, lc = merge_count(arr[:mid])
        right, rc = merge_count(arr[mid:])
        merged, mc = merge(left, right)
        return merged, lc + rc + mc

    def merge(a, b):
        i = j = inv = 0
        result = []
        while i < len(a) and j < len(b):
            if a[i] <= b[j]:
                result.append(a[i]); i += 1
            else:
                result.append(b[j]); j += 1
                inv += len(a) - i        # all remaining left elements form inversions
        result.extend(a[i:])
        result.extend(b[j:])
        return result, inv

    _, count = merge_count(arr)
    return count
```

This pattern — extending merge sort to compute something during the merge — also solves "Reverse Pairs" and "Count of Smaller Numbers After Self."

### Closest Pair of Points

Given `n` points in 2D, find the two with the smallest distance. Brute force is O(n²); divide and conquer gives O(n log n).

The structure: sort points by x-coordinate, recursively find the closest pair in each half, then check the boundary strip for cross-pairs. The strip check is the clever part — only points within distance `δ` (the minimum from the two halves) need to be considered, and within the strip, each point only needs to be compared with the next 7 by y-coordinate.

The full implementation is involved; the takeaway is recognizing that geometric problems can often be split spatially.

### Median of Two Sorted Arrays

A classic hard interview problem. Given two sorted arrays of total length `n`, find the median in O(log(min(m, n))) time.

Brute force is O(n) by merging. Binary search on the smaller array's "cut position" — partition both arrays such that the left halves contain exactly half the total elements, then check whether the partition is valid by comparing boundary values. This is a divide-and-conquer pattern using binary search rather than literal halving.

### Different Ways to Compute

For an arithmetic expression, generate all possible results from different parenthesizations. At each operator, recursively compute all results from the left part and all results from the right part, then combine them.

```python
def diff_ways(expression):
    if expression.isdigit():
        return [int(expression)]
    result = []
    for i, ch in enumerate(expression):
        if ch in '+-*':
            lefts = diff_ways(expression[:i])
            rights = diff_ways(expression[i+1:])
            for l in lefts:
                for r in rights:
                    if ch == '+':   result.append(l + r)
                    elif ch == '-': result.append(l - r)
                    else:           result.append(l * r)
    return result
```

This is divide and conquer at the level of *expressions*, not arrays. Each operator splits the problem into a left expression and a right expression. The same pattern shows up in problems involving partitioning sequences (Burst Balloons, Stone Game).

## Common Patterns

- **Halving.** The most common form. Split the input into two roughly equal halves, recurse on each, combine. Merge sort, closest pair, max subarray (D&C version) all use this.
- **Splitting on an operator or pivot.** Different Ways to Compute, expression evaluation, and tree-shaped problems split at a chosen point and recurse on the parts. Quick sort partitions around a pivot — same idea.
- **Decrease-and-conquer.** Reduce to one smaller subproblem instead of two. Binary search, fast exponentiation, Euclidean GCD.
- **Augmented merge.** Use the merge step of merge sort to compute something extra (inversions, smaller-after-self counts, reverse pairs).
- **Tree decomposition.** When the input is a tree, divide into subtrees, solve recursively, combine at the root. Many tree DP problems are divide-and-conquer in disguise.

## Time and Space Complexity

| Algorithm | Time | Space |
|-----------|------|-------|
| Merge sort | O(n log n) | O(n) |
| Quick sort | O(n log n) average, O(n²) worst | O(log n) average |
| Binary search | O(log n) | O(1) iterative, O(log n) recursive |
| Fast exponentiation | O(log n) | O(log n) recursive |
| Closest pair of points | O(n log n) | O(n) |
| Counting inversions | O(n log n) | O(n) |
| Median of two sorted arrays | O(log(min(m, n))) | O(1) |

Space usage typically comes from two sources: the recursion stack (O(log n) when halving) and any auxiliary arrays the combine step needs.

## When to Use

Reach for divide and conquer when:

- The problem can be split into **independent** subproblems of the same type.
- A working solution for half the input gets you measurably closer to the answer for the whole.
- The combine step is efficient — combining two sub-answers shouldn't cost more than the sub-answers themselves did.
- You suspect the answer is faster than O(n²) and the structure allows recursion to halve the work.
- The data has natural geometric or sequential splits (sorted arrays, point sets, trees, expressions).

Divide and conquer is **not** the right tool when:

- Subproblems overlap — that's dynamic programming.
- The combine step is more expensive than the recursive calls — recursion may not save anything.
- The problem has no natural way to split into independent halves.
- A direct O(n) or O(log n) algorithm exists; recursion adds overhead without benefit.

## Common Pitfalls

- **Confusing divide and conquer with dynamic programming.** They look similar but require different approaches. If the same subproblem shows up repeatedly, you need DP, not D&C.
- **Forgetting the base case.** Every recursive function needs a stopping condition, but it's especially easy to miss in D&C when "small enough" isn't `n == 0` or `n == 1` (e.g., closest pair switches to brute force at three points).
- **Inefficient combine step.** A combine step that's slower than the subproblem solutions wipes out the benefit of recursion. If your combine is O(n²), the whole algorithm might be O(n²) regardless of the recursion.
- **Passing slices in Python.** `arr[:mid]` creates a copy in O(n), which can secretly inflate complexity. Pass `low`/`high` indices into the original array when you need O(n log n) instead of O(n² log n).
- **Stack overflow on large input.** Recursion depth is O(log n) for balanced D&C, which is usually safe — but in pathological cases (unbalanced quicksort) it can hit Python's limit.
- **Off-by-one in the divide step.** Splitting `[low, high]` into `[low, mid]` and `[mid + 1, high]` vs `[low, mid - 1]` and `[mid, high]` matters. Pick a convention and trace small inputs to verify.
- **Combining incorrectly across the boundary.** In closest-pair-of-points, missing the strip check produces wrong answers because the optimal pair might cross the divide line. Always verify the combine step considers boundary cases.
- **Unbalanced division.** If your "divide" produces a split of size 1 vs size n−1 instead of n/2 vs n/2, the recurrence becomes `T(n) = T(n−1) + f(n)`, which is O(n²) when f is linear. Sorted-input quicksort is the classic example.

## Common Interview Problems

### Easy
- Pow(x, n)
- Sqrt(x) (binary search variant)
- Maximum Depth of Binary Tree
- Same Tree
- Diameter of Binary Tree
- Convert Sorted Array to Binary Search Tree

### Medium
- Sort an Array (implement merge sort or quick sort)
- Search a 2D Matrix II (D&C across the matrix)
- Kth Largest Element in an Array (Quickselect)
- Find Peak Element
- Different Ways to Add Parentheses
- Construct Binary Tree from Preorder and Inorder Traversal
- Construct Binary Tree from Inorder and Postorder Traversal
- Beautiful Array
- The Skyline Problem (sometimes labeled hard)
- Sort List (merge sort on a linked list)
- Closest Binary Search Tree Value
- Count Good Triplets in an Array

### Hard
- Median of Two Sorted Arrays
- Count of Smaller Numbers After Self (modified merge sort)
- Reverse Pairs (modified merge sort)
- The Skyline Problem
- Max Sum of Rectangle No Larger Than K
- Find K-th Smallest Pair Distance
- Closest Pair of Points (when explicitly asked)
- Burst Balloons (D&C with memoization → DP)
- Strong Password Checker
- Largest Rectangle in Histogram (D&C version)
