# Tries

A **trie** (pronounced "try", from re*trie*val) is a tree-shaped data structure for storing strings, where each node represents a single character and each path from the root to a marked node spells out a stored word. Tries trade memory for fast prefix operations: searching for a word, checking if any stored word starts with a given prefix, and enumerating all words with a given prefix all run in O(m) time, where m is the length of the query — **independent of how many words are stored**.

Tries are the right choice whenever the workload involves **prefix queries**: autocomplete, spell-check, IP routing tables, T9 phone keypads, and word-game solvers.

## Memory Representation

Each node holds:

- A map (or fixed-size array) from character to child node.
- A flag indicating whether this node marks the end of a stored word.

Storing the words **car**, **card**, **cat**, and **dog** produces this trie (asterisks mark end-of-word):

```
              (root)
             /      \
            c        d
            |        |
            a        o
           / \       |
          r*  t*     g*
          |
          d*
```

Two implementation choices for the children map:

- **Hash map (`dict`).** Flexible — handles any character set including Unicode. Standard choice in Python.
- **Fixed-size array (e.g., 26 slots for lowercase English).** Faster lookup and lower per-node overhead, but wastes space for sparse alphabets and fails for arbitrary strings.

Use a hash map by default; use an array only when you know the alphabet is small and dense.

## Initialization in Python

```python
class TrieNode:
    def __init__(self):
        self.children = {}      # char -> TrieNode
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
```

A more compact alternative for quick implementations uses nested `dict`s with a sentinel key for end-of-word:

```python
END = "$"
trie = {}

def insert(word):
    node = trie
    for ch in word:
        node = node.setdefault(ch, {})
    node[END] = True
```

The class-based version is clearer for production code; the dict version is faster to write under interview time pressure.

## Types of Tries

### Standard Trie
The structure described above — one character per edge. Simple, predictable, memory-hungry.

### Compressed Trie (Radix Tree / Patricia Trie)
Chains of single-child nodes are merged into a single edge labeled with a string instead of a character. Dramatically reduces memory when stored words share long unique suffixes. Used in IP routing tables, the Linux kernel's IP lookup, and some database indexes.

```
Standard trie for "team", "test":     Compressed:

      t                                   t
      |                                  / \
      e                              "eam" "est"
     / \
    a   s
    |   |
    m*  t*
```

### Suffix Trie / Suffix Tree
Stores every suffix of a single string. Enables O(m) substring search and powers algorithms for longest repeated substring and longest common substring. Suffix trees can be built in O(n) using Ukkonen's algorithm, but the implementation is notoriously intricate and rarely required in interviews.

### Ternary Search Tree
Each node has three children — less, equal, greater — combining trie traversal with BST-style branching on character comparisons. More memory-efficient than a standard trie for sparse alphabets, with slightly slower lookup.

### Binary Trie
Each node has exactly two children for bits 0 and 1. Used for storing fixed-length integers, IP addresses, and for problems involving XOR maximization (e.g., "Maximum XOR of Two Numbers in an Array").

## Operations

### Insert
Walk character by character from the root, creating nodes as needed, then mark the final node as end-of-word.

```python
def insert(self, word):
    node = self.root
    for ch in word:
        if ch not in node.children:
            node.children[ch] = TrieNode()
        node = node.children[ch]
    node.is_end = True
```

### Search (Full Word)
Walk the trie following the query characters. Match only if every character is found *and* the final node is marked as end-of-word.

```python
def search(self, word):
    node = self._walk(word)
    return node is not None and node.is_end
```

### Prefix Search (`starts_with`)
Same walk, but the final node does not need to be marked. Returns true if any stored word begins with the prefix.

```python
def starts_with(self, prefix):
    return self._walk(prefix) is not None

def _walk(self, s):
    node = self.root
    for ch in s:
        if ch not in node.children:
            return None
        node = node.children[ch]
    return node
```

### Delete
Walk to the end of the word, unset the end-of-word flag, then prune any nodes that have no remaining children and are not end-of-word for some other stored word. Easiest to express recursively:

```python
def delete(self, word):
    def _delete(node, i):
        if i == len(word):
            node.is_end = False
            return len(node.children) == 0  # safe to prune
        ch = word[i]
        child = node.children.get(ch)
        if child is None:
            return False
        should_prune = _delete(child, i + 1)
        if should_prune:
            del node.children[ch]
            return not node.is_end and len(node.children) == 0
        return False
    _delete(self.root, 0)
```

### Enumerate Words with a Prefix
Walk to the prefix's end node, then DFS the subtree collecting all marked nodes. Time is O(p + k·L) where p is prefix length, k is the number of matches, and L is the average match length.

## Time and Space Complexity

Let `m` be the length of the query string, `n` the number of stored words, and `σ` the alphabet size.

| Operation | Time | Notes |
|-----------|------|-------|
| Insert | O(m) | |
| Search (full word) | O(m) | |
| Starts with (prefix) | O(m) | |
| Delete | O(m) | |
| Enumerate words with prefix | O(p + k·L) | k matches of average length L |

Notice what's missing: **none of these depend on `n`**. A trie holding a million words searches just as fast as one holding ten.

**Space complexity:** O(total characters across all stored words × σ) in the worst case — every node carries a children map. In practice, shared prefixes reduce this significantly. The constant factor is the main reason tries are unsuitable for casual use; reach for them when prefix operations are the workload.

## Trie vs Hash Map

Both can answer "is this exact word stored?" in O(m) time. Tries shine on the operations a hash map cannot do efficiently:

| Question | Hash Map | Trie |
|----------|----------|------|
| Is this word stored? | O(m) | O(m) |
| Does any stored word start with prefix `p`? | O(n × m) — scan all keys | O(m) |
| List all words starting with prefix `p` | O(n × m) | O(p + k·L) |
| Iterate stored words in lexicographic order | O(n log n) — sort | O(total characters) |
| Memory for `n` short, similar words | Lower | Higher (per-node overhead) |
| Memory for words sharing long prefixes | Higher | Lower (shared paths) |

Use a hash map for raw membership; use a trie when prefixes matter.

## Advantages

- O(m) operations independent of the number of stored words.
- Natural support for prefix queries — the killer feature.
- Lexicographic enumeration via in-order DFS is essentially free.
- No hash collisions, no hash function quality concerns.
- Words with shared prefixes share storage.

## Limitations

- High memory overhead per node, especially with array-based children.
- Worse cache behavior than a flat hash map.
- Implementation is more involved than `set` or `dict`.
- Deletion requires careful pruning to avoid leaving orphaned nodes.
- Unicode and variable-width encodings need explicit handling.
- For pure exact-match workloads with no prefix queries, a hash map is simpler and often faster in practice.

## Common Interview Problems

### Easy
- Implement Trie (Prefix Tree)
- Longest Common Prefix
- Longest Word in Dictionary

### Medium
- Design Add and Search Words Data Structure
- Replace Words
- Map Sum Pairs
- Implement Magic Dictionary
- Top K Frequent Words
- Search Suggestions System
- Design File System
- Stream of Characters
- Short Encoding of Words
- Word Break II (with trie pruning)

### Hard
- Word Search II
- Concatenated Words
- Palindrome Pairs
- Word Squares
- Maximum XOR of Two Numbers in an Array (binary trie)
- Number of Matching Subsequences
- Prefix and Suffix Search
- Stream of Characters
