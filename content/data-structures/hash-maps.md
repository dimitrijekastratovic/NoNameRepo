# Hash Maps

A **hash map** (also called a hash table or dictionary) is a data structure that stores key–value pairs and supports insertion, lookup, and deletion in **O(1) average time**. It does this by using a **hash function** to convert each key into an index in an underlying array.

A **hash set** is the same structure with values removed — it stores only keys and answers the question "is this element present?" in O(1) average time. Everything that follows about hashing, collisions, and complexity applies to both.

## Memory Representation

A hash map is backed by an array of **buckets**. To insert key `k` with value `v`:

1. Compute `h = hash(k)`, an integer derived from the key.
2. Compute `i = h % capacity` to find the bucket index.
3. Store the entry at bucket `i`, handling collisions if another entry already lives there.

```
              ┌─────────────────────────────┐
   key "cat"  │ hash() → 9173 → % 8 → idx 5 │ → buckets[5]
              └─────────────────────────────┘
```

Two distinct keys can map to the same bucket — this is a **collision**, and the table needs a strategy to handle it. Two strategies dominate.

## Collision Handling

### Separate Chaining
Each bucket holds a small secondary structure (typically a linked list) of all entries hashing to that index. On insertion, append to the chain. On lookup, scan the chain comparing keys. Java's `HashMap` uses this approach (and switches to a balanced tree per bucket once the chain grows beyond a threshold).

### Open Addressing
All entries live in the bucket array itself. When the target bucket is occupied, probe forward using a deterministic sequence until an empty slot (or the matching key) is found. Common probing schemes:

- **Linear probing:** try `i+1, i+2, i+3, …` Simple, cache-friendly, but suffers from clustering.
- **Quadratic probing:** try `i+1, i+4, i+9, …` Reduces clustering.
- **Double hashing:** step size determined by a second hash function. Best clustering behavior.

Python's `dict` uses open addressing with a randomized probing sequence.

### Load Factor and Resizing
The **load factor** is `entries / capacity`. When it exceeds a threshold (typically 0.7–0.75), the table resizes — allocates a larger backing array (usually 2×) and rehashes every entry into the new buckets. Resizing is O(n), but happens rarely enough that insertion remains O(1) amortized. Resizing is essential to keep collisions infrequent and operations fast.

## Initialization in Python

```python
# Hash map (dict)
m = {}
m = {"a": 1, "b": 2}
m = dict(a=1, b=2)

# Hash set
s = set()
s = {1, 2, 3}      # {} alone is an empty dict, not a set
s = set([1, 2, 3])

# Frozen (immutable, hashable) set — usable as a dict key
fs = frozenset([1, 2, 3])

# Specialized variants
from collections import defaultdict, Counter, OrderedDict

groups = defaultdict(list)        # missing keys auto-create
groups["fruits"].append("apple")  # no KeyError

counts = Counter("mississippi")   # {'i': 4, 's': 4, 'p': 2, 'm': 1}

# Standard dict preserves insertion order since Python 3.7;
# OrderedDict is rarely needed today.
```

## Hash Map vs Hash Set

| Aspect | Hash Map | Hash Set |
|--------|----------|----------|
| Stores | Key → value pairs | Keys only |
| Use case | Look up an associated value | Check membership / deduplicate |
| Python type | `dict` | `set`, `frozenset` |
| Lookup | `m[key]`, `m.get(key)` | `key in s` |

A hash set is mechanically a hash map whose value field is unused. Most languages implement one in terms of the other.

## Hashable Keys

A key is **hashable** if it has a stable hash value that does not change over its lifetime. In Python:

- Hashable: `int`, `float`, `str`, `tuple` (of hashables), `frozenset`, immutable custom objects.
- Not hashable: `list`, `dict`, `set`, mutable custom objects.

Mutating an object after using it as a key corrupts the table — the entry can no longer be found because its hash changes. This is why `list` cannot be a key.

## Operations

| Operation | Description | Python |
|-----------|-------------|--------|
| Insert / update | Store a key (and value) | `m[k] = v` / `s.add(k)` |
| Lookup | Retrieve value by key | `m[k]`, `m.get(k, default)` |
| Membership | Check if key is present | `k in m` / `k in s` |
| Delete | Remove a key | `del m[k]` / `s.discard(k)` |
| Size | Number of entries | `len(m)` |
| Iterate | Visit all keys / pairs | `for k, v in m.items():` |

`m.get(k)` returns `None` (or a supplied default) on missing keys — safer than `m[k]`, which raises `KeyError`.

## Time and Space Complexity

| Operation | Average | Worst | Notes |
|-----------|---------|-------|-------|
| Insert | O(1) | O(n) | Worst case: many collisions or resize |
| Lookup | O(1) | O(n) | Worst case: all keys hash to one bucket |
| Delete | O(1) | O(n) | |
| Iteration | O(n) | O(n) | Visits every entry |

The O(n) worst case requires either a poor hash function or adversarial input. For well-designed hash functions on typical data, behavior is reliably O(1).

**Space complexity:** O(n), with a constant-factor overhead of roughly 1.3–2× the number of entries due to load factor headroom and bucket metadata.

## Advantages

- O(1) average insertion, lookup, and deletion — the fastest associative structure for typical use.
- Conceptually simple interface; ubiquitous language support.
- Eliminates many O(n²) brute-force solutions: pair-finding, frequency counting, deduplication, caching.
- Works with any hashable key type.

## Limitations

- No order. Iteration order is implementation-dependent (Python preserves insertion order; many languages do not).
- O(n) worst case under collisions or adversarial input.
- Higher memory overhead than arrays due to bucket headroom and per-entry metadata.
- No efficient range queries (e.g., "all keys between 10 and 20") — use a balanced BST or sorted structure for that.
- Hash function quality matters. Bad hashes cause clustering, slow operations, and security issues (hash flooding attacks). Modern languages randomize hash seeds at startup to prevent this.
- Keys must be hashable and effectively immutable.

## Common Interview Problems

### Easy
- Two Sum
- Contains Duplicate
- Valid Anagram
- Intersection of Two Arrays
- Happy Number
- First Unique Character in a String
- Single Number
- Ransom Note
- Find the Difference
- Roman to Integer
- Jewels and Stones

### Medium
- Group Anagrams
- Top K Frequent Elements
- Longest Substring Without Repeating Characters
- 4Sum II
- Subarray Sum Equals K
- Longest Consecutive Sequence
- Insert Delete GetRandom O(1)
- LRU Cache
- Encode and Decode TinyURL
- Find All Anagrams in a String
- Longest Repeating Character Replacement
- Copy List with Random Pointer
- Continuous Subarray Sum
- Word Pattern

### Hard
- Substring with Concatenation of All Words
- First Missing Positive
- Minimum Window Substring
- LFU Cache
- Palindrome Pairs
