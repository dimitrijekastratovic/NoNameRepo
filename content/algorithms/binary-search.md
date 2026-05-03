# Binary Search

**Binary search** finds a target value in a **sorted** sequence by repeatedly halving the search range. At each step, it compares the target to the middle element and discards the half that cannot contain the target. This reduces an O(n) linear scan to **O(log n)**.

The algorithm is conceptually simple but notoriously easy to write incorrectly. Off-by-one errors, infinite loops, and wrong handling of duplicates are common bugs even among experienced engineers — the published Java standard library binary search had an integer overflow bug that went undetected for nearly a decade.

## Prerequisite: Sorted or Monotonic Input

Binary search requires the search space to be **monotonic** — sorted, or otherwise organized so that one half can be eliminated at every step. The classic case is a sorted array, but the technique generalizes to any space where you can ask a yes/no question whose answer flips exactly once across the range. This is the basis of **binary search on the answer**, covered later.

## How It Works

Maintain a search range defined by two pointers, `low` and `high`. At each step:

1. Compute `mid = low + (high - low) // 2`.
2. Compare `arr[mid]` to the target.
3. If equal, return `mid`.
4. If `arr[mid] < target`, the target must be in the right half — set `low = mid + 1`.
5. If `arr[mid] > target`, the target must be in the left half — set `high = mid - 1`.
6. Stop when `low > high`. The target is not present.

```
arr = [1, 3, 5, 7, 9, 11, 13]    target = 11

Iter 1:  low=0, high=6, mid=3 → arr[3]=7 < 11 → low=4
Iter 2:  low=4, high=6, mid=5 → arr[5]=11 = target → return 5
```

Each iteration halves the range, so a range of size `n` is exhausted in at most `⌈log₂ n⌉` iterations.

## Implementation

```python
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
```

A few details to internalize:

- **Use `low + (high - low) // 2`**, not `(low + high) // 2`. In Python integers don't overflow, but this is a hard requirement in C++/Java/Go and a habit worth keeping.
- **The loop condition is `low <= high`**, not `low < high`. Using `<` skips the case where the range has shrunk to a single element.
- **Update with `mid + 1` and `mid - 1`**, not `mid`. Skipping `mid` is what makes the loop terminate; using `low = mid` causes infinite loops when `low == mid`.

## Two Templates

There are two common ways to set up the loop. Both are correct; pick one and stick with it to avoid bugs.

### Closed Interval `[low, high]`
The version above. Both endpoints are inclusive, the loop runs while `low <= high`, and the answer is found when `arr[mid] == target`. Easiest to reason about for "find exact match" problems.

### Half-Open Interval `[low, high)`
`high` starts at `len(arr)` (one past the end) and is exclusive. The loop runs while `low < high`. This template is preferred for **boundary-finding** problems (leftmost/rightmost insertion point) because it makes the answer a single index `low` at termination.

```python
def lower_bound(arr, target):
    """Index of first element >= target, or len(arr) if none."""
    low, high = 0, len(arr)
    while low < high:
        mid = low + (high - low) // 2
        if arr[mid] < target:
            low = mid + 1
        else:
            high = mid
    return low
```

When the loop ends, `low == high` and points to the answer. This template avoids most off-by-one bugs once you trust the invariant.

## Variants

### Find Exact Match
Standard binary search shown above. Returns the index of the target, or `-1` if absent.

### Leftmost Occurrence (Lower Bound)
Find the smallest index `i` such that `arr[i] >= target`. Useful for finding insertion points and for counting occurrences (combined with upper bound).

```python
import bisect
i = bisect.bisect_left(arr, target)   # leftmost
```

### Rightmost Occurrence (Upper Bound)
Find the smallest index `i` such that `arr[i] > target`. The number of occurrences of `target` is `bisect_right(arr, target) - bisect_left(arr, target)`.

```python
i = bisect.bisect_right(arr, target)  # one past rightmost
```

Python's `bisect` module implements both correctly — use it in interviews unless asked to write the search by hand.

### Binary Search on a Rotated Sorted Array
A rotated sorted array (e.g., `[4, 5, 6, 7, 0, 1, 2]`) is not globally sorted, but at every iteration *one half* is sorted. Determine which half is sorted by comparing `arr[low]` to `arr[mid]`, then check whether the target lies in that half.

```python
def search_rotated(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if arr[mid] == target:
            return mid
        if arr[low] <= arr[mid]:           # left half sorted
            if arr[low] <= target < arr[mid]:
                high = mid - 1
            else:
                low = mid + 1
        else:                               # right half sorted
            if arr[mid] < target <= arr[high]:
                low = mid + 1
            else:
                high = mid - 1
    return -1
```

### Binary Search on the Answer
The most powerful variant. When you can phrase a problem as "find the smallest/largest value `x` such that some condition `f(x)` is true," and `f` is monotonic (false for all `x < k`, true for all `x >= k`), binary-search the value space directly instead of an array.

The classic example is "Koko Eating Bananas": find the smallest eating speed that finishes all bananas in `h` hours. Eating speeds form a sorted range `[1, max(piles)]`, and "can finish in time" is monotonic in speed — binary search the speed.

```python
def min_eating_speed(piles, h):
    def can_finish(speed):
        return sum((p + speed - 1) // speed for p in piles) <= h

    low, high = 1, max(piles)
    while low < high:
        mid = (low + high) // 2
        if can_finish(mid):
            high = mid
        else:
            low = mid + 1
    return low
```

This pattern unlocks problems that look nothing like search problems on the surface: capacity planning, minimum-maximum optimization, splitting arrays, finding kth element across sorted arrays.

### Binary Search in Infinite / Unknown-Length Arrays
When the upper bound is unknown, exponentially probe (`high = 1, 2, 4, 8, ...`) until you find a position past the target, then binary-search within `[high/2, high]`.

## Time and Space Complexity

| Variant | Time | Space |
|---------|------|-------|
| Standard search | O(log n) | O(1) iterative, O(log n) recursive |
| Lower / upper bound | O(log n) | O(1) |
| Rotated array | O(log n) | O(1) |
| Binary search on answer | O(log V × C) | O(1) |
| Infinite array | O(log p) | O(1) |

For binary search on the answer, `V` is the size of the value range and `C` is the cost of evaluating the predicate. For infinite arrays, `p` is the position of the target.

## When to Use

- The data is sorted (or can be sorted as a preprocessing step).
- The data has some monotonic property even if not strictly sorted (rotated array, mountain array, peak finding).
- The problem can be reframed as "find the smallest `x` such that `f(x)` is true" with monotonic `f`.
- The input is too large for O(n) and you need O(log n).
- You're asked to find an insertion point, count occurrences in a sorted array, or find boundaries.

## Common Pitfalls

- **Infinite loops** caused by `mid` not advancing. Always update with `mid + 1` or `mid - 1` (closed interval) or be careful with `mid` (half-open).
- **Off-by-one on the loop condition.** `<=` for closed `[low, high]`, `<` for half-open `[low, high)`. Mixing them causes either skipped elements or infinite loops.
- **Wrong half discarded.** Drawing the array on paper and tracing through one iteration is faster than debugging in your head.
- **Integer overflow on `(low + high) // 2`.** Not an issue in Python, but a real bug in C++/Java. Use `low + (high - low) // 2`.
- **Assuming sortedness.** Always verify the array is sorted (or has the monotonic property) before reaching for binary search. The interviewer will sometimes give you an unsorted array as a trap.
- **Duplicates.** "Find target" returns *some* matching index, not necessarily the first or last. Use lower/upper bound variants when you need a specific occurrence.
- **The recursive version uses O(log n) stack space.** The iterative version is O(1) — prefer iterative unless asked.
- **Floating-point binary search** (search on a continuous range) needs a different termination condition — typically iterate a fixed number of times or until `high - low < epsilon`. Don't use `low <= high`.

## Common Interview Problems

### Easy
- Binary Search
- Search Insert Position
- First Bad Version
- Sqrt(x)
- Valid Perfect Square
- Guess Number Higher or Lower
- Two Sum II — Input Array Is Sorted
- Find Smallest Letter Greater Than Target

### Medium
- Search in Rotated Sorted Array
- Find First and Last Position of Element in Sorted Array
- Search a 2D Matrix
- Search a 2D Matrix II
- Find Peak Element
- Find Minimum in Rotated Sorted Array
- Koko Eating Bananas
- Capacity To Ship Packages Within D Days
- Find the Duplicate Number
- Time Based Key-Value Store
- Single Element in a Sorted Array
- Successful Pairs of Spells and Potions
- H-Index II
- Minimum Speed to Arrive on Time
- Maximum Number of Removable Characters

### Hard
- Median of Two Sorted Arrays
- Split Array Largest Sum
- Find in Mountain Array
- Aggressive Cows (binary search on answer)
- Allocate Books / Painter's Partition
- Maximum Number of Tasks You Can Assign
- Minimize Max Distance to Gas Station
- Find K-th Smallest Pair Distance
