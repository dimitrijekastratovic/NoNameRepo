# Sliding Window

The **sliding window** pattern uses two pointers — typically called `left` and `right` — that move through a sequence in the same direction, defining a contiguous **window** between them. The pointers expand and contract the window based on the problem's condition. Because each pointer moves forward at most `n` times, the entire traversal runs in **O(n)** instead of the O(n²) cost of examining every subarray.

A few terms used throughout this article:

- **Subarray** — a contiguous slice of an array.
- **Substring** — a contiguous slice of a string.
- **Window** — the current `[left, right]` (or `[left, right)`) range. Its contents are the subarray or substring being examined right now.

The pattern shows up constantly in interview problems involving substrings, subarrays, sums over a range, character counts, and "longest/shortest range with property X."

## Why It Works

Consider "find the longest substring with at most `k` distinct characters." A naive approach checks every substring — there are O(n²) of them, and validating each takes O(n), giving O(n³).

Sliding window does better by reusing work. As `right` advances by one, the window grows; if the new character violates the condition, `left` advances until the window is valid again. Each character is added (when `right` passes over it) and removed (when `left` passes over it) at most once. The total number of pointer moves is at most `2n`, so the algorithm runs in O(n).

## Two Variants

Sliding window problems come in two flavors, distinguished by whether the window's size is fixed or variable.

### Fixed-Size Window

The window has a constant width `k`. Slide it across the array, maintaining whatever aggregate the problem asks for (sum, average, count, max).

```
nums = [2, 1, 5, 1, 3, 2]    k = 3

Window 1:  [2, 1, 5]              sum = 8
Window 2:     [1, 5, 1]           sum = 7
Window 3:        [5, 1, 3]        sum = 9   ← maximum
Window 4:           [1, 3, 2]     sum = 6
```

When `right` advances by one, `left` also advances by one. The trick is to update the aggregate incrementally — add the entering element, subtract the leaving element — instead of recomputing it from scratch.

#### Maximum Sum of a Subarray of Size k

```python
def max_sum_subarray(nums, k):
    window_sum = sum(nums[:k])      # initial window
    best = window_sum
    for right in range(k, len(nums)):
        window_sum += nums[right] - nums[right - k]
        best = max(best, window_sum)
    return best
```

The line `window_sum += nums[right] - nums[right - k]` is the heart of the technique: add the entering value, subtract the leaving value, in O(1).

### Variable-Size Window

The window grows or shrinks based on a condition. `right` advances unconditionally; `left` advances only when the window violates the condition (or, depending on the problem, only when shrinking the window helps the answer).

The general template:

```python
def variable_window(arr):
    left = 0
    best = 0
    state = ...                             # tracks the window's property
    for right in range(len(arr)):
        # 1. Add arr[right] to the window
        state = update(state, arr[right])

        # 2. Shrink from the left while the window is invalid
        while not valid(state):
            state = remove(state, arr[left])
            left += 1

        # 3. Record the answer for this window
        best = max(best, right - left + 1)
    return best
```

What goes in `state` depends on the problem: a hash map of character counts, a running sum, the number of distinct elements, etc.

#### Longest Substring Without Repeating Characters

```python
def length_of_longest_substring(s):
    seen = {}                # char -> most recent index
    left = 0
    best = 0
    for right, ch in enumerate(s):
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1
        seen[ch] = right
        best = max(best, right - left + 1)
    return best
```

When a duplicate appears, `left` jumps past the previous occurrence rather than walking one step at a time. The window is always valid (contains no repeats) by construction.

#### Longest Substring with at Most K Distinct Characters

```python
from collections import defaultdict

def longest_k_distinct(s, k):
    count = defaultdict(int)
    left = 0
    best = 0
    for right, ch in enumerate(s):
        count[ch] += 1
        while len(count) > k:
            count[s[left]] -= 1
            if count[s[left]] == 0:
                del count[s[left]]
            left += 1
        best = max(best, right - left + 1)
    return best
```

#### Minimum Size Subarray Sum

Find the shortest contiguous subarray whose sum is at least `target`.

```python
def min_subarray_len(target, nums):
    left = 0
    total = 0
    best = float('inf')
    for right in range(len(nums)):
        total += nums[right]
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return best if best != float('inf') else 0
```

Note the difference from the previous example: here we shrink while the window *is* valid (looking for the shortest valid window), not while it's invalid. The shrink condition depends on whether you want the longest valid window or the shortest valid window.

## Common Sub-Patterns

### Character Frequency Matching

Many string problems boil down to "find a window whose character counts match a target." Use two hash maps (or two arrays of size 26 / 128 for fixed alphabets) and a counter tracking how many character counts currently match.

The classic example is **Minimum Window Substring**: find the smallest substring of `s` containing all characters of `t`.

```python
from collections import Counter

def min_window(s, t):
    if not t or not s:
        return ""
    need = Counter(t)
    have = {}
    matched = 0           # how many chars in `need` are fully satisfied
    left = 0
    best = (float('inf'), 0, 0)

    for right, ch in enumerate(s):
        have[ch] = have.get(ch, 0) + 1
        if ch in need and have[ch] == need[ch]:
            matched += 1

        while matched == len(need):
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            have[s[left]] -= 1
            if s[left] in need and have[s[left]] < need[s[left]]:
                matched -= 1
            left += 1

    return s[best[1]:best[2] + 1] if best[0] != float('inf') else ""
```

This pattern appears in: Minimum Window Substring, Permutation in String, Find All Anagrams in a String, Longest Substring with At Most Two Distinct Characters.

### Monotonic Deque (Window Maximum / Minimum)

To find the maximum (or minimum) in every fixed-size window, a naive approach scans each window — O(n × k). A **monotonic deque** does it in O(n) by keeping the deque sorted: when a new element enters, pop everything smaller from the back; when the front falls out of the window, pop it from the front.

```python
from collections import deque

def max_sliding_window(nums, k):
    dq = deque()       # holds indices, values strictly decreasing
    result = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] < x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:        # front fell out of the window
            dq.popleft()
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result
```

Each index is pushed and popped at most once, so the total work is O(n). The deque is "monotonic" because its values stay in decreasing order at all times.

## Time and Space Complexity

| Variant | Time | Space |
|---------|------|-------|
| Fixed-size window | O(n) | O(1), or O(k) if storing the window |
| Variable-size window | O(n) | O(k) — for the state map, where k is the alphabet size or window contents |
| Monotonic deque | O(n) | O(k) |

The linear time bound holds because both pointers each move forward at most `n` times — they never go backward.

## When to Use

Reach for sliding window when the problem involves:

- A **contiguous** subarray or substring (not a subsequence — those need different techniques).
- An aggregate over a range: sum, average, count, distinct elements, character frequencies.
- The phrasing "longest / shortest / maximum / minimum subarray such that ..." or "all windows of size k."
- A condition on the window that changes monotonically as the window grows or shrinks (e.g., "sum is at least target," "at most k distinct characters").

If the problem asks about **subsequences** (non-contiguous), or requires considering all subarrays without a monotonic condition, sliding window doesn't apply — dynamic programming or another technique is needed.

## Common Pitfalls

- **Confusing subarray with subsequence.** Sliding window works for contiguous ranges only. "Longest subsequence with property X" is usually a DP problem, not a sliding window problem.
- **Wrong shrink direction.** For "longest valid window," shrink when invalid. For "shortest valid window," shrink while still valid. Getting this backwards gives wrong answers, not just inefficient ones.
- **Recomputing the state from scratch.** The whole point is incremental updates. If you're calling `sum(window)` inside the loop, you've collapsed back to O(n²).
- **Off-by-one on window size.** The window `[left, right]` (both inclusive) has size `right - left + 1`. The half-open form `[left, right)` has size `right - left`. Pick one and stay consistent.
- **Forgetting to shrink first when needed.** Some templates expand first, then check if shrinking is required. Others shrink first, then expand. Mixing them mid-loop causes bugs.
- **Hash map cleanup.** When a count drops to zero, decide whether to delete the key or leave it. For "exactly k distinct characters" problems, `len(count_map)` will be wrong if zero-count keys linger.
- **Empty input or window larger than input.** Many sliding window solutions break when `len(arr) < k`. Add a check or let the loop handle it gracefully.
- **Negative numbers.** "Smallest subarray with sum at least target" assumes positive numbers. With negatives, expanding the window can decrease the sum, breaking the monotonicity sliding window relies on. Use prefix sums + a deque or hash map instead.

## Common Interview Problems

### Easy
- Maximum Average Subarray I
- Contains Duplicate II
- Find Pivot Index
- Defuse the Bomb
- Substrings of Size Three with Distinct Characters

### Medium
- Longest Substring Without Repeating Characters
- Minimum Size Subarray Sum
- Permutation in String
- Find All Anagrams in a String
- Longest Repeating Character Replacement
- Fruit Into Baskets
- Longest Substring with At Most K Distinct Characters
- Longest Substring with At Most Two Distinct Characters
- Subarrays with K Different Integers
- Maximum Number of Vowels in a Substring of Given Length
- Number of Subarrays of Size K and Average Greater than or Equal to Threshold
- Maximum Erasure Value
- Get Equal Substrings Within Budget
- Subarray Product Less Than K
- Binary Subarrays With Sum
- Count Number of Nice Subarrays
- Replace the Substring for Balanced String
- Frequency of the Most Frequent Element

### Hard
- Sliding Window Maximum
- Minimum Window Substring
- Substring with Concatenation of All Words
- Longest Substring with At Most K Distinct Characters (variant with stricter constraints)
- Sliding Window Median
- Subarrays with K Different Integers (exact-K via "at most" trick)
- Maximum Sum of 3 Non-Overlapping Subarrays
- Shortest Subarray with Sum at Least K
- Count of Subarrays You Need to Remove to Make Mountain Array
