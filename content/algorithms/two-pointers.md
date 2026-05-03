# Two Pointers

The **two pointers** technique uses two indices traversing a sequence to solve problems that would otherwise require nested loops, reducing time from O(n²) to O(n). The pointers move based on the comparison or condition at their current positions, and because each pointer advances at most `n` times, the total work is linear.

Two pointers is one of the most common patterns in coding interviews. Roughly a third of array problems and most palindrome / sorted-array / in-place-modification problems are solved with this technique.

## Why It Works

A naive solution to "find two numbers that sum to a target" tries every pair — O(n²). Two pointers exploits structure (typically sortedness) so that at every step, you can rule out one of the two pointers' current positions and advance it without ever revisiting it. Each pointer moves monotonically through the array, so total iterations are bounded by `2n = O(n)`.

The technique has three main patterns, distinguished by how the pointers move.

## Pattern 1: Converging Pointers (Opposite Ends)

`left` starts at the beginning, `right` starts at the end. They move toward each other. Used when the input is **sorted** and you're looking for a pair, or when you're examining symmetry (palindromes, container shapes).

### Two Sum on a Sorted Array

```python
def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return [left, right]
        elif s < target:
            left += 1      # need a larger sum
        else:
            right -= 1     # need a smaller sum
    return []
```

The decision rule — advance `left` to increase the sum, advance `right` to decrease it — only works because the array is sorted. Sortedness is what guarantees the pointer you advanced cannot be part of the answer with anything you've already passed.

### Valid Palindrome

```python
def is_palindrome(s):
    s = [c.lower() for c in s if c.isalnum()]
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True
```

### Container With Most Water

For `[h₁, h₂, …, hₙ]` heights, find two lines forming the largest container. Move the pointer at the *shorter* line inward — the other could only produce a smaller container by moving.

```python
def max_area(heights):
    left, right = 0, len(heights) - 1
    best = 0
    while left < right:
        h = min(heights[left], heights[right])
        best = max(best, h * (right - left))
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
    return best
```

### 3Sum (Sort, Then Two Pointers)
When asked for triplets that sum to zero, **sort first**, then for each `i`, run two pointers on the rest of the array. O(n²) total — better than the O(n³) brute force.

```python
def three_sum(nums):
    nums.sort()
    result = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                            # skip duplicate anchors
        left, right = i + 1, len(nums) - 1
        while left < right:
            s = nums[i] + nums[left] + nums[right]
            if s == 0:
                result.append([nums[i], nums[left], nums[right]])
                left += 1
                right -= 1
                while left < right and nums[left] == nums[left - 1]:
                    left += 1                   # skip duplicates
                while left < right and nums[right] == nums[right + 1]:
                    right -= 1
            elif s < 0:
                left += 1
            else:
                right -= 1
    return result
```

The pre-sort + two pointers combination generalizes to 4Sum, 4Sum II, and similar problems. Sorting takes O(n log n), then the search is O(n²).

## Pattern 2: Same Direction (Fast and Slow)

Both pointers start at the beginning. One advances faster than the other, or they advance based on different conditions. This is the **"runner" technique** — named because one pointer "runs ahead" of the other.

### In-Place Modification (Read / Write Pointers)

A `write` pointer marks where the next valid element should go; a `read` pointer scans the input. Used for "remove duplicates in place," "move zeroes to end," "remove element," and any problem requiring O(1) extra space.

```python
def remove_duplicates_sorted(nums):
    if not nums:
        return 0
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[read - 1]:
            nums[write] = nums[read]
            write += 1
    return write   # nums[:write] holds unique values
```

### Floyd's Cycle Detection (Tortoise and Hare)

The canonical fast/slow pointer algorithm. To detect a cycle in a linked list, advance one pointer one step at a time and another two steps at a time. If there's a cycle, they must eventually meet inside it; if not, the fast pointer reaches `None`.

```python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
```

The same technique extends to:
- **Find the middle of a linked list** — when fast reaches the end, slow is at the middle.
- **Linked List Cycle II** — find where the cycle starts. After detection, reset one pointer to the head and advance both one step at a time; they meet at the cycle entrance.
- **Find the duplicate number** — interpret the array as a linked list (`i → nums[i]`) and apply Floyd's to find the duplicate in O(1) extra space.

### Nth Node from the End

To find the `n`-th node from the end in one pass, advance `fast` `n` steps first, then advance both pointers together until `fast` reaches the end. `slow` now points to the answer.

```python
def remove_nth_from_end(head, n):
    dummy = Node(0, head)
    slow = fast = dummy
    for _ in range(n):
        fast = fast.next
    while fast.next:
        slow = slow.next
        fast = fast.next
    slow.next = slow.next.next
    return dummy.next
```

## Pattern 3: Two Sequences

One pointer in each of two arrays or strings, advancing based on a comparison.

### Merging Two Sorted Arrays

```python
def merge(a, b):
    i = j = 0
    result = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1
    result.extend(a[i:])
    result.extend(b[j:])
    return result
```

The merge step of merge sort is the same algorithm, as is "Intersection of Two Sorted Arrays" and "Merge Sorted Array (in place)."

### Subsequence Check

Test whether `s` is a subsequence of `t` — advance both pointers, but only advance `i` when characters match.

```python
def is_subsequence(s, t):
    i = j = 0
    while i < len(s) and j < len(t):
        if s[i] == t[j]:
            i += 1
        j += 1
    return i == len(s)
```

## Two Pointers vs Sliding Window

The **sliding window** pattern uses two pointers moving in the same direction, but the focus is the *window* between them — its size, contents, or aggregated value. Two pointers focuses on the values *at* the pointers.

| | Two Pointers | Sliding Window |
|---|--------------|----------------|
| Focus | Values at the pointer positions | Subarray between pointers |
| Movement | Often opposite directions, or pointer-by-pointer | Both same direction; window expands and contracts |
| Typical use | Pair-finding, palindromes, in-place edits | Substring problems, sums/averages over ranges |

Sliding window is covered in its own article. The two patterns overlap and many problems can be framed either way.

## Time and Space Complexity

| Variant | Time | Space |
|---------|------|-------|
| Single pass (any pattern) | O(n) | O(1) |
| Pre-sort + two pointers (e.g., 3Sum) | O(n log n) preprocessing + O(n) or O(n²) | O(1) excluding sort |
| Floyd's cycle detection | O(n) | O(1) |

Two pointers is O(1) extra space because no auxiliary structure is allocated — only the two index variables.

## When to Use

- The input is **sorted**, or sorting it is acceptable.
- You're looking for a pair, triplet, or subsequence with a target property.
- You need **O(1) extra space** (in-place modifications, linked-list operations).
- The problem involves **symmetry** (palindromes, mirror operations).
- The problem involves a **linked list with structural questions** (cycles, midpoint, nth from end).
- You're **merging or intersecting** two sorted sequences.

## Common Pitfalls

- **Forgetting to sort.** Two pointers on an unsorted array gives wrong answers silently. Always state the sortedness assumption.
- **Wrong pointer advancement.** When `nums[left] + nums[right] < target`, you advance `left`, not `right`. Trace through one iteration with concrete values to catch this.
- **Skipping duplicates incorrectly.** In 3Sum-family problems, duplicates produce duplicate triplets in the output. Handle them by advancing past equal values *after* recording a hit, not before.
- **Off-by-one in the loop condition.** `left < right` for converging patterns (you don't want to use the same index twice). `left <= right` is wrong here.
- **Modifying the array while iterating with two pointers.** Read/write pointers are designed for this, but only when the read pointer is always ≥ the write pointer.
- **Floyd's edge cases.** Empty list and single-node-no-cycle both need to be handled — typically by checking `fast and fast.next` in the loop condition.
- **Initialization for "n-th from end."** Off-by-one errors are common. Using a dummy node before the head simplifies the deletion case.

## Common Interview Problems

### Easy
- Two Sum II — Input Array Is Sorted
- Valid Palindrome
- Reverse String
- Reverse Vowels of a String
- Merge Sorted Array
- Remove Duplicates from Sorted Array
- Remove Element
- Move Zeroes
- Squares of a Sorted Array
- Is Subsequence
- Intersection of Two Arrays
- Linked List Cycle
- Middle of the Linked List
- Palindrome Linked List
- Happy Number (Floyd on a sequence)

### Medium
- 3Sum
- 3Sum Closest
- 4Sum
- Container With Most Water
- Sort Colors (Dutch National Flag)
- Remove Nth Node From End of List
- Linked List Cycle II
- Find the Duplicate Number
- Partition List
- Reorder List
- Boats to Save People
- Valid Triangle Number
- Number of Subsequences That Satisfy the Given Sum Condition
- Sentence Similarity III
- Long Pressed Name
- Push Dominoes

### Hard
- Trapping Rain Water
- Minimum Window Substring (sliding window crossover)
- Substring with Concatenation of All Words
- Smallest Range Covering Elements from K Lists
- Reverse Nodes in k-Group
