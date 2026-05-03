# Sorting Algorithms

**Sorting** is the process of arranging elements in a defined order — usually ascending or descending. It is one of the most-studied problems in computer science and appears as a building block in countless other algorithms: searching becomes faster on sorted data, many greedy algorithms require sorting first, and merging sorted streams is a foundational distributed-systems primitive.

In an interview context, sorting matters in two ways. First, you need to know the standard algorithms — their complexities, trade-offs, and which one to use in which situation. Second, many problems become much easier after sorting, so recognizing "sort first" as a tool is a frequent unlock.

A few terms used throughout:

- **In-place** — uses only a constant amount of extra memory, not counting the input.
- **Stable** — equal elements keep their original relative order. Useful when sorting by multiple keys (e.g., sort by date, then stable-sort by name).
- **Adaptive** — runs faster on already-sorted or nearly-sorted input.
- **Comparison-based** — decides element order by comparing pairs (`a < b`). Bound by O(n log n).
- **Non-comparison-based** — uses properties of the keys themselves (digits, ranges) to sort. Can beat O(n log n).

## The O(n log n) Lower Bound

Any comparison-based sort must take **at least O(n log n)** comparisons in the worst case. The argument: there are `n!` possible orderings of `n` elements, and each comparison gives one bit of information (yes/no). To distinguish `n!` outcomes, you need at least `log₂(n!) ≈ n log n` comparisons.

This means merge sort and heap sort are asymptotically optimal among comparison sorts. To go faster, you must give up comparisons and exploit structure in the keys (counting sort, radix sort, bucket sort).

## Comparison-Based Sorts

### Bubble Sort

Repeatedly walk through the array, swapping adjacent elements that are out of order. Each pass "bubbles" the largest unsorted element to the end.

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            return                  # already sorted
```

Time: O(n²) average and worst, O(n) best (already sorted, with the early-exit optimization). Space: O(1). Stable. Adaptive with the early-exit version. Mostly historical — almost never the right choice in practice but commonly asked about.

### Selection Sort

Find the smallest element and swap it to the front. Repeat for the rest of the array.

```python
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
```

Time: O(n²) in all cases. Space: O(1). Not stable. Not adaptive. Performs the minimum number of swaps (at most `n - 1`), which can matter when swaps are expensive.

### Insertion Sort

Build the sorted portion one element at a time by inserting each new element into its correct position relative to the elements before it.

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
```

Time: O(n²) average and worst, O(n) best (already sorted). Space: O(1). **Stable**. **Adaptive** — extremely fast on nearly-sorted data. Best choice for small arrays (typically < 16 elements). Real-world hybrid sorts like Timsort fall back to insertion sort for small subranges.

### Merge Sort

Divide the array in half, sort each half recursively, then merge the two sorted halves.

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(a, b):
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i]); i += 1
        else:
            result.append(b[j]); j += 1
    result.extend(a[i:])
    result.extend(b[j:])
    return result
```

Time: O(n log n) in all cases. Space: O(n) — the merge step needs an auxiliary array. **Stable**. Not in-place (truly in-place merge is possible but complex and slow in practice). The natural choice when you need guaranteed O(n log n) and stability matters.

Merge sort is also the standard approach for **external sorting** — sorting data too large to fit in memory, by merging sorted runs from disk.

### Quick Sort

Pick a **pivot**, partition the array so smaller elements go left and larger go right, then recursively sort each side.

```python
def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        p = partition(arr, low, high)
        quick_sort(arr, low, p - 1)
        quick_sort(arr, p + 1, high)

def partition(arr, low, high):
    pivot = arr[high]                       # Lomuto partition
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
```

Time: O(n log n) average, **O(n²) worst case** (when the pivot is consistently the smallest or largest element). Space: O(log n) for the recursion stack on average, O(n) worst case. Not stable. **In-place**.

Two practical points that often come up in interviews:

- **Pivot choice matters.** Always picking the last element makes quick sort O(n²) on already-sorted input. Random pivot, median-of-three, or "introsort"-style fallbacks (switch to heap sort if recursion gets too deep) avoid this. In production code, never use plain "last element" without randomization.
- **Why quick sort is fast in practice** despite the bad worst case: cache-friendly memory access, low constant factors, in-place operation, and the worst case essentially never occurs with randomized pivots. Most language standard libraries use a quick sort variant.

The two main partition schemes are Lomuto (simpler, shown above) and Hoare (slightly faster in practice, harder to get right).

### Heap Sort

Build a max-heap from the array, then repeatedly extract the maximum and place it at the end of the array.

```python
def heap_sort(arr):
    n = len(arr)

    def sift_down(i, size):
        while 2 * i + 1 < size:
            left, right = 2 * i + 1, 2 * i + 2
            largest = i
            if left < size and arr[left] > arr[largest]:
                largest = left
            if right < size and arr[right] > arr[largest]:
                largest = right
            if largest == i:
                return
            arr[i], arr[largest] = arr[largest], arr[i]
            i = largest

    for i in range(n // 2 - 1, -1, -1):     # build max-heap
        sift_down(i, n)
    for end in range(n - 1, 0, -1):         # extract max repeatedly
        arr[0], arr[end] = arr[end], arr[0]
        sift_down(0, end)
```

Time: O(n log n) in all cases. Space: O(1). Not stable. **In-place**. Combines the worst-case guarantee of merge sort with the in-place property of quick sort, but is typically slower than both in practice due to poor cache behavior.

The heap construction step is O(n), not O(n log n) — see the Heaps article.

## Non-Comparison-Based Sorts

These sorts beat O(n log n) by using properties of the keys themselves rather than just comparisons. They only work when those properties are present.

### Counting Sort

Sort integers in a known range `[0, k]` by counting how many of each value appear, then writing them out in order.

```python
def counting_sort(arr, k):
    count = [0] * (k + 1)
    for x in arr:
        count[x] += 1
    out = []
    for value, c in enumerate(count):
        out.extend([value] * c)
    return out
```

Time: O(n + k). Space: O(n + k). **Stable** (with a slightly more involved output step using a prefix-sum). Only useful when `k` is not much larger than `n` — sorting integers in `[0, 10⁹]` would need 10⁹ counts.

### Radix Sort

Sort integers (or fixed-length strings) digit by digit, from least to most significant. Uses a stable sort (typically counting sort) on each digit.

```python
def radix_sort(arr):
    if not arr:
        return arr
    max_val = max(arr)
    exp = 1                                  # 1, 10, 100, ...
    while max_val // exp > 0:
        arr = counting_sort_by_digit(arr, exp)
        exp *= 10
    return arr

def counting_sort_by_digit(arr, exp):
    count = [0] * 10
    output = [0] * len(arr)
    for x in arr:
        count[(x // exp) % 10] += 1
    for i in range(1, 10):
        count[i] += count[i - 1]             # prefix sums
    for x in reversed(arr):                  # iterate in reverse for stability
        digit = (x // exp) % 10
        count[digit] -= 1
        output[count[digit]] = x
    return output
```

Time: O(d × (n + b)) where `d` is the number of digits and `b` is the base. Space: O(n + b). **Stable**. Useful for sorting many integers with a moderate number of digits, or strings of fixed length.

### Bucket Sort

Distribute elements into buckets covering ranges of values, sort each bucket (typically with insertion sort), then concatenate the buckets. Works well when input is uniformly distributed.

Time: O(n) average for uniform input, O(n²) worst. Space: O(n). Not commonly asked about directly in interviews, but the underlying idea (divide into ranges, then sort within) appears in problems like "Maximum Gap."

## Comparison Table

| Algorithm | Best | Average | Worst | Space | Stable | In-place | Notes |
|-----------|------|---------|-------|-------|--------|----------|-------|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | ✓ | ✓ | Educational; rarely used |
| Selection | O(n²) | O(n²) | O(n²) | O(1) | ✗ | ✓ | Minimum swaps |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | ✓ | ✓ | Best for small / nearly-sorted |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | ✓ | ✗ | Guaranteed bound, stable |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | ✗ | ✓ | Fast in practice |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | ✗ | ✓ | Worst-case in-place |
| Counting | O(n + k) | O(n + k) | O(n + k) | O(n + k) | ✓ | ✗ | Small integer range only |
| Radix | O(d(n + b)) | O(d(n + b)) | O(d(n + b)) | O(n + b) | ✓ | ✗ | Multi-digit keys |
| Bucket | O(n + k) | O(n + k) | O(n²) | O(n) | ✓ | ✗ | Assumes uniform distribution |

## Python's Sort: Timsort

Python's `list.sort()` and `sorted()` use **Timsort**, a hybrid of merge sort and insertion sort designed by Tim Peters in 2002. It's stable, runs in O(n log n) worst case, and is unusually fast on real-world data because it detects and exploits existing runs of sorted elements.

In practice:

- `arr.sort()` sorts in place and returns `None`. O(n log n).
- `sorted(arr)` returns a new sorted list, leaves the original unchanged.
- Both accept a `key=` argument: `sorted(items, key=lambda x: x.age)`.
- Both accept `reverse=True` for descending order.
- Sort is **stable** — equal elements keep their order.

For interviews, you can use Python's built-in sort unless explicitly asked to implement one.

## When to Use Which

- **Need stability and guaranteed O(n log n):** merge sort.
- **In-place with O(n log n) worst case:** heap sort.
- **Generally fastest on random data, in-place:** quick sort with random pivot.
- **Small array (< ~16 elements):** insertion sort.
- **Nearly-sorted input:** insertion sort.
- **Integer keys in a small range:** counting sort.
- **Fixed-width integer or string keys:** radix sort.
- **General-purpose, in production code:** whatever the language standard library uses (Timsort in Python and Java, introsort in C++).

For interview problems where the answer requires sorting, just say "I'll sort the input — Timsort runs in O(n log n)" and move on. Reaching for a custom sort is rarely justified unless the problem specifically requires it.

## Sorting as a Tool

Many problems become trivial once sorted. Recognizing this is a major interview skill.

- **Two pointers** problems often require sorted input first (3Sum, 4Sum).
- **Greedy** algorithms frequently sort by some key, then sweep (interval scheduling, meeting rooms).
- **Range / interval** problems usually sort by start or end.
- **Counting / frequency** problems sometimes use sorting as a substitute for hash maps when you need ordering.
- **Custom comparators** are required when the ordering is problem-specific (Largest Number, Sort Colors).

The cost of sorting (O(n log n)) is usually acceptable as a preprocessing step.

## Common Pitfalls

- **Stability matters when sorting by multiple keys.** If you sort by date, then by name, you only get the desired result if the second sort is stable. Python's sort is stable; many other languages' aren't.
- **Quick sort with worst-case input.** Always-pick-the-last-element with sorted input gives O(n²). Use random pivot or median-of-three.
- **Counting sort with large key range.** Sorting `[1, 1000000000]` with counting sort allocates a billion-slot array. Always check that `k = O(n)`.
- **Float comparisons.** Floating-point equality is unreliable, but sorting by floats works fine — the issues arise only when checking for equality afterward.
- **Custom comparators in Python.** Python 3 removed `cmp` from `sort`. Use `key=` for most cases or `functools.cmp_to_key(cmp_function)` if you genuinely need a comparator (e.g., Largest Number).
- **Modifying the array during sorting.** Some sorting code uses indices into the original array; modifying the array mid-sort gives undefined behavior.
- **Sorting when you don't need to.** "Find the kth largest" can be done in O(n) average via Quickselect; sorting first and indexing is O(n log n). For huge inputs, the difference matters.
- **Recursion depth.** Quick sort and merge sort recurse O(log n) deep on average, but quick sort can hit O(n) on bad input — Python's default limit can be exceeded on large arrays.
- **Comparison cost.** When elements are expensive to compare (long strings, complex objects), the constant factor in `n log n` matters. Sometimes a non-comparison sort wins even when its asymptotic complexity isn't better.

## Common Interview Problems

### Easy
- Sort an Array
- Sort Colors (Dutch National Flag — three-way partition)
- Squares of a Sorted Array
- Merge Sorted Array
- Intersection of Two Arrays
- Relative Sort Array
- Height Checker
- Sort Array By Parity

### Medium
- Sort List (merge sort on a linked list)
- Top K Frequent Elements
- Kth Largest Element in an Array (Quickselect)
- K Closest Points to Origin
- Largest Number (custom comparator)
- Wiggle Sort II
- Sort Characters By Frequency
- Reorganize String
- Pancake Sorting
- H-Index
- Custom Sort String
- Maximum Number of Coins You Can Get
- Group Anagrams (sort each string as a key)
- Minimum Number of Arrows to Burst Balloons (sort + sweep)
- Non-overlapping Intervals
- Merge Intervals
- Insert Interval
- Meeting Rooms II
- Two City Scheduling
- Sort the Matrix Diagonally

### Hard
- Count of Smaller Numbers After Self (merge sort with index tracking)
- Reverse Pairs (merge sort variant)
- Maximum Gap (bucket sort)
- Russian Doll Envelopes (sort + LIS)
- Number of Pairs Satisfying Inequality
- Find K-th Smallest Pair Distance
- Create Maximum Number
- Minimum Cost to Make Array Equal
