# Sorting Algorithms

Sorting is the process of arranging elements in a defined order (usually ascending). Knowing the tradeoffs between algorithms is essential for interviews.

## The Algorithms

### Merge Sort
Divide the array in half, sort each half recursively, then merge. Always O(n log n).

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    return result + left[i:] + right[j:]
```

### Quick Sort
Pick a pivot, partition elements smaller/larger, sort each side recursively. O(n log n) average, O(n²) worst case.

### Binary Search (on sorted arrays)
Not a sorting algorithm, but always comes up alongside sorting. Search a sorted array in O(log n).

```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

## Complexity Comparison

| Algorithm | Best | Average | Worst | Space | Stable? |
|-----------|------|---------|-------|-------|---------|
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |

## What Interviewers Actually Ask

- Why is merge sort preferred for linked lists? (no random access, so partitioning is expensive)
- When would you use quick sort over merge sort? (in-place, better cache performance in practice)
- What does "stable" mean? (equal elements preserve their original relative order)
