# Arrays

An array is a contiguous block of memory storing elements of the same type, accessed by index in O(1) time.

## Key Properties

- **Fixed size** (in most languages) — size is declared upfront
- **Index-based access** — `arr[i]` is O(1)
- **Cache-friendly** — elements are stored next to each other in memory, so the CPU can prefetch them efficiently

## Time Complexity

| Operation | Complexity |
|-----------|------------|
| Access by index | O(1) |
| Search (unsorted) | O(n) |
| Insert at end | O(1) amortized |
| Insert at middle | O(n) |
| Delete at middle | O(n) |

## Common Patterns

### Two Pointers
Use two indices moving toward each other. Common for reversing an array or checking palindromes.

```python
def reverse(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
```

### Sliding Window
Maintain a window of fixed or variable size as you scan. Common for subarray problems.

```python
def max_sum_subarray(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum
```

## Things to Watch Out For

- **Off-by-one errors** — be precise about whether your index is inclusive or exclusive
- **Empty array edge case** — always check `len(arr) == 0` before accessing elements
- **Integer overflow** — when summing large arrays, check if the result fits in your language's integer type
