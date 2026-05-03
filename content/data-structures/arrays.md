# Arrays

An **array** is a collection of elements of the same type stored in contiguous memory locations and accessed by an integer index. It is the most fundamental data structure in computer science and the foundation that most other structures (stacks, queues, hash tables, heaps, dynamic strings) are built on top of.

> **A note on naming.** Different languages call the same structure by different names. C++ `std::vector`, Rust `Vec`, Java `ArrayList`, JavaScript `Array`, and Python `list` are all **dynamic arrays** — the variant covered in this article. Java's legacy `Vector` class is also a dynamic array (a synchronized version of `ArrayList`, rarely used in modern code). When an interviewer says "vector," they almost always mean a dynamic array. The mathematical / ML notion of a vector (a fixed-length numeric sequence used in linear algebra) is a *use case* built on top of an array, not a separate data structure.

## Memory Representation

Array elements are stored in a single contiguous block of memory. If the base address is `B` and each element occupies `S` bytes, then the address of element at index `i` is:

```
address(i) = B + i * S
```

This formula is why **random access is O(1)** — the CPU computes the address arithmetically and fetches the element in a single memory read. It is also why arrays are cache-friendly: accessing element `i` typically pulls neighboring elements into the CPU cache, making sequential traversal fast.

The trade-off is that resizing or inserting in the middle requires moving elements to keep memory contiguous.

## Declaration and Initialization (Python)

Python does not have a true fixed-size array as a built-in primitive — `list` is a dynamic array, and `array.array` provides a typed fixed-size variant.

```python
# Empty list
arr = []

# List with initial values
arr = [1, 2, 3, 4, 5]

# Fixed-size list initialized to zero
arr = [0] * 5

# 2D list (3 rows × 4 columns)
matrix = [[0] * 4 for _ in range(3)]

# Typed array (more memory-efficient for numeric data)
from array import array
arr = array('i', [1, 2, 3])  # 'i' = signed int
```

> **Pitfall:** `[[0] * 4] * 3` creates **three references to the same inner list**, not three independent rows. Always use a list comprehension for 2D arrays.

## Types of Arrays

Arrays are classified along two independent axes: **size** and **dimensions**.

### By Size

**Fixed-size arrays.** Memory is allocated once at creation and cannot grow. Inserting beyond capacity is an error. Languages like C, C++ (`int arr[10]`), and Java (`int[] arr = new int[10]`) support these natively. Advantages: predictable memory, no reallocation overhead. Disadvantage: capacity must be known up front, leading to wasted space or overflow.

**Dynamic arrays.** Capacity grows automatically as elements are appended. Internally implemented by allocating a backing array, and when full, allocating a larger one (typically 1.5× or 2× the current size) and copying elements over. Python `list`, Java `ArrayList`, C++ `std::vector`, and JavaScript `Array` are all dynamic arrays. Append is **amortized O(1)** because resizes happen rarely enough that their cost averages out.

### By Dimensions

**One-dimensional (1D).** A single row of elements. `arr[i]` accesses the element at position `i`.

**Two-dimensional (2D / matrix).** An array of arrays, accessed as `arr[i][j]` where `i` is the row and `j` is the column. Used for grids, images, adjacency matrices, dynamic programming tables.

**Multi-dimensional (N-D).** Generalizes to three or more dimensions. A 3D array is an array of 2D arrays, useful for volumetric data, tensors, or stacked grids over time.

In memory, multi-dimensional arrays are stored in either **row-major order** (C, Python NumPy default) — rows laid out one after another — or **column-major order** (Fortran, MATLAB). Iterating in the same order as the memory layout is significantly faster due to cache behavior.

## Operations

### Traversal
Visit each element once, in order. O(n) time, O(1) extra space.

```python
for x in arr:
    print(x)
```

### Access by Index
Read or write the element at a given index. O(1).

```python
x = arr[3]      # access
arr[3] = 42     # update
```

### Search

**Linear search** — scan from left to right. O(n). Works on any array.

```python
def linear_search(arr, target):
    for i, x in enumerate(arr):
        if x == target:
            return i
    return -1
```

**Binary search** — repeatedly halve the search range. O(log n). Requires the array to be sorted.

```python
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
```

### Insertion

- **At the end:** O(1) amortized for dynamic arrays.
- **At the beginning or middle:** O(n) — every element after the insertion point must shift right by one.

```python
arr.append(10)        # end: O(1) amortized
arr.insert(0, 10)     # beginning: O(n)
arr.insert(2, 10)     # middle: O(n)
```

### Deletion

- **From the end:** O(1).
- **From the beginning or middle:** O(n) — every element after the deletion point must shift left by one.

```python
arr.pop()             # end: O(1)
arr.pop(0)            # beginning: O(n)
del arr[2]            # middle: O(n)
```

### Update
Overwrite a value at a known index. O(1).

## Time and Space Complexity

| Operation | Average | Worst | Notes |
|-----------|---------|-------|-------|
| Access | O(1) | O(1) | |
| Update | O(1) | O(1) | |
| Search (unsorted) | O(n) | O(n) | Linear scan |
| Search (sorted) | O(log n) | O(log n) | Binary search |
| Append (dynamic) | O(1) amortized | O(n) | Worst case on resize |
| Insert at index | O(n) | O(n) | Shifts elements |
| Delete at index | O(n) | O(n) | Shifts elements |
| Traversal | O(n) | O(n) | |

**Space complexity:** O(n) for n elements. Dynamic arrays may temporarily allocate up to 2× during resize.

## Advantages

- Constant-time random access by index.
- Cache-friendly memory layout — fast for sequential reads.
- Low memory overhead per element compared to linked structures.
- Simple and universally supported.

## Limitations

- Insertion and deletion in the middle are O(n).
- Fixed-size variants require capacity to be chosen up front.
- Dynamic arrays may incur occasional O(n) resize cost.
- Inserting requires contiguous free memory; very large arrays can fail to allocate even when total free memory is sufficient (memory fragmentation).

## Common Interview Problems

### Easy
- Two Sum
- Best Time to Buy and Sell Stock
- Contains Duplicate
- Maximum Subarray (Kadane's algorithm)
- Move Zeroes
- Remove Duplicates from Sorted Array
- Plus One
- Merge Sorted Array
- Majority Element

### Medium
- 3Sum
- Container With Most Water
- Product of Array Except Self
- Rotate Array
- Spiral Matrix
- Set Matrix Zeroes
- Subarray Sum Equals K
- Find the Duplicate Number
- Longest Consecutive Sequence
- Next Permutation
- Sort Colors (Dutch National Flag)
- Merge Intervals
- Insert Interval
- Jump Game
- Search in Rotated Sorted Array

### Hard
- Trapping Rain Water
- First Missing Positive
- Median of Two Sorted Arrays
- Largest Rectangle in Histogram
- Sliding Window Maximum
- Count of Smaller Numbers After Self
- Maximum Gap
