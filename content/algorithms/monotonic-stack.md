# Monotonic Stack

A **monotonic stack** is a stack whose elements are kept in sorted order — either strictly increasing or strictly decreasing from bottom to top. The order is maintained by popping any elements that would violate it before pushing a new value. This pattern solves an entire class of problems involving "the next greater (or smaller) element" in O(n) time, replacing what would otherwise be an O(n²) pairwise comparison.

The technique is one of the higher-leverage patterns in coding interviews. It looks unusual the first time you see it, but once you recognize the signature — "for each element, find the next/previous element with property X" — the implementation becomes routine.

A few terms used throughout:

- **Monotonic** — consistently moving in one direction (always increasing or always decreasing).
- **Violator** — a new element that would break the stack's monotonic order if pushed directly.
- **Pop until valid** — remove violators from the top until the stack would remain monotonic after pushing.

## Increasing vs Decreasing

There are two flavors. The choice between them depends on what you are looking for.

- **Monotonic increasing stack** — values increase from bottom to top. The top is the largest. To maintain the order, pop while the top is **greater than or equal to** the incoming value. Used to find the **next or previous smaller** element.
- **Monotonic decreasing stack** — values decrease from bottom to top. The top is the smallest. To maintain the order, pop while the top is **less than or equal to** the incoming value. Used to find the **next or previous greater** element.

| You want to find | Stack type | Pop while |
|------------------|-----------|-----------|
| Next greater element | Decreasing | top ≤ new |
| Next smaller element | Increasing | top ≥ new |
| Previous greater element | Decreasing | (check top before pushing) |
| Previous smaller element | Increasing | (check top before pushing) |

The "next" variants are computed by examining each value when it gets popped — the new incoming value is its "next greater/smaller." The "previous" variants are computed by examining the top of the stack just before pushing — that top is the "previous greater/smaller" for the new value.

## Recognizing the Pattern

A problem is a candidate for a monotonic stack when:

- It involves an array or sequence.
- The output for each element depends on **the next or previous element with some comparison property** — greater, smaller, taller, hotter, etc.
- A brute-force solution would scan forward (or backward) from each element, giving O(n²).
- The work for each element is local: once you know the relevant neighbor, you have the answer.

If those conditions hold, monotonic stack reduces the time to O(n) because each element is pushed and popped at most once.

## Core Template

The general shape is the same regardless of variant:

```python
def monotonic_stack(arr):
    stack = []                    # holds indices (often) or values
    result = [...]                # initialized for each problem
    for i, x in enumerate(arr):
        while stack and violates_monotonic(stack[-1], x):
            popped = stack.pop()
            # popped's "next" element is x — record the answer
        stack.append(i)           # or x, depending on the problem
    # any indices left in the stack have no "next" element
    return result
```

Two implementation notes:

- **Store indices, not values.** Most problems need to know the position of the next/previous element, the distance between them, or to look up other arrays at that index. Storing indices is more flexible; access values via `arr[stack[-1]]`.
- **Initialize the result.** Elements left on the stack at the end have no "next greater/smaller" — their result entries keep their initial value (commonly `-1`, `0`, or `inf`).

## Classic Problems

### Next Greater Element

For each element, find the next element to its right that is strictly greater. Return `-1` if none exists.

```python
def next_greater(nums):
    n = len(nums)
    result = [-1] * n
    stack = []                    # indices, values strictly decreasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            result[stack.pop()] = x
        stack.append(i)
    return result
```

When `x` arrives, every index in the stack with value less than `x` finds its "next greater" — namely, `x`. Indices left in the stack at the end have no greater element to their right, so they keep `-1`.

### Daily Temperatures

For each day, find how many days you have to wait until a warmer temperature. Same structure as Next Greater Element, except the answer is the *distance* (index difference) rather than the value.

```python
def daily_temperatures(temps):
    n = len(temps)
    result = [0] * n
    stack = []                    # indices, temperatures strictly decreasing
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            result[j] = i - j     # number of days until warmer
        stack.append(i)
    return result
```

The shift from "value of next greater" to "distance to next greater" is a one-line change. This is the same template; only the result calculation differs.

### Largest Rectangle in Histogram

Given an array of bar heights, find the largest rectangle that fits within the histogram. The brute force is O(n²): for each bar, expand left and right until a shorter bar blocks you. The monotonic stack version is O(n).

The key insight: for each bar at index `i`, the largest rectangle that uses `bar[i]` as its shortest height is bounded by the **previous smaller bar** on the left and the **next smaller bar** on the right. A monotonic increasing stack identifies both in one pass.

```python
def largest_rectangle(heights):
    stack = []                    # indices, heights strictly increasing
    best = 0
    heights = heights + [0]       # sentinel forces final flush
    for i, h in enumerate(heights):
        while stack and heights[stack[-1]] > h:
            top = stack.pop()
            # heights[top] is the bar we're computing the rectangle for
            left = stack[-1] if stack else -1
            width = i - left - 1
            best = max(best, heights[top] * width)
        stack.append(i)
    return best
```

The trailing `0` sentinel guarantees every remaining bar gets processed at the end. Without it, bars left on the stack at termination would never have their rectangles computed.

### Trapping Rain Water

Given heights representing an elevation map, calculate how much water it can trap after rain. Several O(n) solutions exist (two pointers, prefix-suffix max arrays); the monotonic stack version handles it by computing trapped water *between* a popped bar and the new incoming bar.

```python
def trap(heights):
    stack = []                    # indices, heights strictly decreasing
    total = 0
    for i, h in enumerate(heights):
        while stack and heights[stack[-1]] < h:
            bottom = stack.pop()
            if not stack:
                break             # no left wall, no water trapped
            left = stack[-1]
            width = i - left - 1
            bounded_height = min(heights[left], h) - heights[bottom]
            total += width * bounded_height
        stack.append(i)
    return total
```

When a new bar `h` is taller than the top of the stack, we've found a "valley" — `bottom` is the popped bar (the floor of the valley), `left` is the new top of the stack (the left wall), and `h` is the right wall. Water trapped on top of `bottom` between these walls is `width × bounded_height`.

This problem stretches the pattern more than the others — it's the canonical hard monotonic-stack interview question.

## Time and Space Complexity

| Variant | Time | Space |
|---------|------|-------|
| Single pass with stack | O(n) | O(n) |
| Circular array (next greater II) | O(n) | O(n) |
| Multi-criteria stack (e.g., area + index) | O(n) | O(n) |

The O(n) time bound is the central insight: each element is pushed onto the stack exactly once and popped at most once. Even though the inner loop pops multiple times per outer iteration, the total number of pops across the whole pass is bounded by `n`. This is **amortized analysis** in action — averaging operations across the run rather than counting them per iteration.

Space is O(n) because the stack can, in the worst case (a strictly monotonic input), hold every element.

## When to Use

Reach for a monotonic stack when:

- The problem asks for the **next greater / smaller / hotter / taller** element for every position.
- The problem asks for the **previous greater / smaller** element for every position.
- The problem involves **areas or volumes** bounded by neighboring elements (histograms, water-trapping, skyline).
- A naive solution scans forward (or backward) from each index — that's the signature of an O(n²) pattern that monotonic stack collapses to O(n).
- The problem asks for the **nearest** element with a property to the left or right.

Don't use a monotonic stack when:

- You need information about elements that aren't strictly "next" or "previous" by some ordering — that's often a sliding window, two pointers, or DP problem.
- The comparison property changes mid-array (the order isn't fixed across the input).
- You need to maintain *all* elements in some order, not just the locally relevant ones — use a sorted structure or heap.

## Common Pitfalls

- **Wrong direction (increasing vs decreasing).** The most common error. If you want "next greater," use a decreasing stack (pop while top ≤ x). If you want "next smaller," use an increasing stack (pop while top ≥ x). Getting this backwards produces wrong answers, not crashes.
- **Strict vs non-strict comparison.** `≤` vs `<` and `≥` vs `>` matter when the array contains duplicates. "Next strictly greater" and "next greater or equal" are different problems and require different comparison operators.
- **Forgetting to flush remaining elements.** Indices left on the stack at the end of the loop have no "next" element. Either initialize the result correctly so they keep a sentinel value, or add a sentinel value at the end of the input that forces the loop to process everything.
- **Storing values instead of indices.** When you need the position, distance, or to cross-reference another array, indices are essential. Storing values forces awkward workarounds.
- **Off-by-one in width calculations.** For histogram-style problems, `width = i - left - 1` is correct when both `i` and `left` are exclusive boundaries, but it's easy to get wrong. Trace small examples by hand.
- **Empty-stack checks.** After a pop, the stack might be empty. Code that uses `stack[-1]` after popping must check `if stack` first, or handle the empty case explicitly.
- **Circular arrays.** "Next Greater Element II" wraps around — the next greater for the last element might be the first. Handle this by iterating the array twice (or using `i % n` for the second pass) and only pushing during the first pass.
- **Confusing monotonic stack with monotonic queue.** A monotonic *queue* (deque) supports operations at both ends and is used for sliding-window-extreme problems. A monotonic *stack* operates only at one end and is for next/previous-extreme problems.

## Common Interview Problems

### Easy
- Next Greater Element I
- Final Prices With a Special Discount in a Shop

### Medium
- Daily Temperatures
- Next Greater Element II
- Next Greater Element III
- Online Stock Span
- Asteroid Collision
- Validate Stack Sequences
- 132 Pattern
- Sum of Subarray Minimums
- Sum of Subarray Ranges
- Remove K Digits
- Remove Duplicate Letters
- Smallest Subsequence of Distinct Characters
- Number of Visible People in a Queue
- Beautiful Towers I
- Find the Most Competitive Subsequence
- Maximum Width Ramp
- Car Fleet
- Stock Price Fluctuation

### Hard
- Largest Rectangle in Histogram
- Maximal Rectangle
- Trapping Rain Water
- Sliding Window Maximum (often solved with monotonic deque, conceptually similar)
- Maximum Subarray Min-Product
- Sum of Total Strength of Wizards
- Count Submatrices With All Ones
- The Number of the Smallest Unoccupied Chair (related pattern)
- Maximum Score of a Good Subarray
- Beautiful Towers II
