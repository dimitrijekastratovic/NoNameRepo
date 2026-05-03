# Backtracking

**Backtracking** is a problem-solving technique that explores all possible solutions by making a choice, recursing into the resulting smaller problem, and **undoing** the choice if it doesn't lead to a valid solution. It is depth-first search through a tree of decisions, with the ability to abandon (or "prune") branches that cannot succeed.

Backtracking is recursion's most powerful applied form. It solves problems that have too many candidate solutions to enumerate directly — generating all permutations of `n` items, finding every valid placement on a board, listing every path through a maze, or any problem phrased as "find all ways to ...". The Recursion article covers the underlying mechanism; this article covers the applied pattern.

A few terms used throughout:

- **Choice** — a single decision the algorithm can make at the current step.
- **State** — the partial solution built up so far (e.g., the indices chosen, the path traversed, the partial assignment).
- **Decision tree** — the conceptual tree where each branch represents one choice and each path from root to leaf is one candidate solution.
- **Pruning** — abandoning a branch early because its current state cannot lead to a valid solution.
- **Undo / backtrack** — reverting a choice so the next iteration starts from a clean state.

## The Core Pattern

Every backtracking algorithm follows the same three-step shape:

1. **Make a choice** — modify the state to reflect the choice.
2. **Recurse** — solve the smaller subproblem with the updated state.
3. **Undo the choice** — restore the state so the next iteration starts clean.

```python
def backtrack(state):
    if is_solution(state):
        record(state)
        return
    for choice in choices(state):
        if is_valid(choice, state):
            apply(choice, state)        # 1. make the choice
            backtrack(state)            # 2. recurse
            undo(choice, state)         # 3. undo the choice
```

The undo step is what distinguishes backtracking from a plain DFS that builds new state for every call. By mutating shared state and undoing changes, backtracking uses one piece of memory across all branches — clean and efficient. The downside is that you have to be disciplined about pairing every modification with its undo.

## Why It's Faster Than Brute Force

A naive enumeration of all candidates would generate every possibility, then check each one for validity. Backtracking interleaves generation and checking: as soon as a partial state can be proven invalid, that entire subtree of possibilities is skipped. This is **pruning**, and it can turn an intractable search into a fast one.

For N-Queens on an 8×8 board, the naive count of placements is `64 choose 8 ≈ 4.4 billion`. Backtracking with column- and diagonal-conflict pruning solves it by examining roughly `15,720` placements — five orders of magnitude faster.

## Common Templates

### Subsets (Power Set)

Generate all subsets of a list. At each position, the choice is "include this element or not." The decision tree has `2ⁿ` leaves.

```python
def subsets(nums):
    result = []
    def backtrack(start, path):
        result.append(path[:])              # every node is a subset
        for i in range(start, len(nums)):
            path.append(nums[i])            # choose
            backtrack(i + 1, path)          # recurse
            path.pop()                      # undo
    backtrack(0, [])
    return result
```

Two details to internalize:

- `path[:]` (or `path.copy()`) creates a snapshot. Without the copy, every entry in `result` would point to the same `path` list, and after backtracking finishes you'd see only empty lists.
- `start` prevents producing the same subset in different orders. By only considering elements at index `start` or later, each subset is generated exactly once.

### Combinations

Choose `k` elements out of `n`. Same shape as subsets, but only record the path when it has the target length.

```python
def combine(n, k):
    result = []
    def backtrack(start, path):
        if len(path) == k:
            result.append(path[:])
            return
        for i in range(start, n + 1):
            path.append(i)
            backtrack(i + 1, path)
            path.pop()
    backtrack(1, [])
    return result
```

A useful pruning: if `len(path) + (n - i + 1) < k`, even taking every remaining element won't reach `k`, so skip the rest.

### Permutations

Generate all orderings. Unlike subsets and combinations, order matters here, so we don't use `start` — we have to consider every element at every position. A `used` array tracks which elements are already in the current path.

```python
def permute(nums):
    result = []
    used = [False] * len(nums)
    def backtrack(path):
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack(path)
            path.pop()
            used[i] = False
    backtrack([])
    return result
```

### Constraint Satisfaction (N-Queens)

Place `N` queens on an `N×N` board so that no two threaten each other. The choice at each row is which column to place the queen in. A placement is valid if no other queen shares the same column or diagonal.

```python
def solve_n_queens(n):
    result = []
    cols = set()
    diag1 = set()                      # row - col is constant on each \-diagonal
    diag2 = set()                      # row + col is constant on each /-diagonal
    board = [-1] * n                   # board[row] = column

    def backtrack(row):
        if row == n:
            result.append(board[:])
            return
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue                                # prune
            cols.add(col); diag1.add(row - col); diag2.add(row + col)
            board[row] = col
            backtrack(row + 1)
            cols.remove(col); diag1.remove(row - col); diag2.remove(row + col)
    backtrack(0)
    return result
```

The pruning here is critical. Without it, the algorithm would try every column at every row regardless of conflicts — that's `n^n` placements. With it, most branches die almost immediately.

### Grid Backtracking (Word Search)

Search a 2D grid for a word. Each cell is a starting point; from each cell, we recursively try the four neighbors, marking visited cells in place to prevent revisits.

```python
def exist(board, word):
    rows, cols = len(board), len(board[0])

    def backtrack(r, c, i):
        if i == len(word):
            return True
        if (r < 0 or r >= rows or c < 0 or c >= cols
                or board[r][c] != word[i]):
            return False
        temp = board[r][c]
        board[r][c] = '#'                  # mark visited
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            if backtrack(r + dr, c + dc, i + 1):
                board[r][c] = temp         # undo before returning True
                return True
        board[r][c] = temp                 # undo
        return False

    for r in range(rows):
        for c in range(cols):
            if backtrack(r, c, 0):
                return True
    return False
```

The key undo here is restoring the cell value when leaving. Forgetting it leaves the board permanently modified and breaks subsequent searches.

## Handling Duplicates

When the input contains duplicates and the problem asks for *distinct* outputs (e.g., "subsets II", "permutations II"), naive backtracking produces repeats. The standard fix is to **sort the input** and skip a choice when it equals the previous choice at the same recursion level.

```python
def subsets_with_dup(nums):
    nums.sort()
    result = []
    def backtrack(start, path):
        result.append(path[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue                            # skip duplicate at same level
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()
    backtrack(0, [])
    return result
```

The condition `i > start` is what makes this work — at the same recursion level, identical values produce identical subtrees, so we skip them. But within a deeper call, duplicates *should* be reused (otherwise `[1, 1]` from `[1, 1, 2]` would be skipped entirely).

## Pruning Strategies

Pruning is what separates fast backtracking from slow brute force. Common pruning techniques:

- **Constraint check before recursing.** Don't make a choice that already violates a constraint (the column/diagonal check in N-Queens).
- **Bounds check.** If the remaining choices can't possibly reach the target (e.g., `len(path) + remaining < k` for combinations), stop.
- **Sorting input first.** Allows early termination when sorted order means subsequent choices can't help (e.g., "Combination Sum" — if the next number already exceeds the remaining target, all later numbers do too, so break).
- **Symmetry breaking.** When two branches would produce equivalent results (mirror placements, rotations), explore only one.
- **Memoization.** When subproblems repeat, cache their answers. This blurs into dynamic programming.

Aggressive pruning often makes the difference between a 1-second solution and a 60-second timeout on the same problem.

## Time and Space Complexity

Backtracking complexity is dominated by the size of the decision tree — typically exponential. Common patterns:

| Problem | Time | Space |
|---------|------|-------|
| Subsets | O(2ⁿ × n) | O(n) recursion + O(2ⁿ × n) output |
| Combinations C(n, k) | O(C(n, k) × k) | O(k) recursion + output |
| Permutations | O(n! × n) | O(n) recursion + O(n! × n) output |
| N-Queens | O(n!) loosely | O(n) recursion |
| Word Search on n×m grid, word length L | O(n × m × 4^L) | O(L) recursion |

The `× n` or `× k` factor is the cost of copying the path into the result. The recursion depth is the size of one solution candidate, not the total number of candidates. Space for the output is unavoidable — you're returning every solution.

## When to Use

Reach for backtracking when:

- The problem asks for **all** solutions, not just one or the count.
- The problem is phrased as **"generate every ..."** or **"find all ways to ..."**
- The solution is a **sequence of choices**, each from a small set.
- You can detect quickly when a partial state is invalid (so pruning helps).
- The state space is too large for brute-force enumeration but small enough to fit in time after pruning.

Backtracking is **not** the right tool when:

- You only need **one** solution and a greedy or DP approach exists.
- You only need a **count** of solutions (often a DP problem).
- The state space genuinely has no useful pruning (then it's brute force regardless).
- The problem has clear **optimal substructure** with overlapping subproblems — that's dynamic programming territory.

## Common Pitfalls

- **Forgetting to undo.** The single most common bug. Every modification to shared state needs a matching undo on the way out. If you change a list, restore it. If you change a `used` array, reset it.
- **Storing references instead of copies.** `result.append(path)` stores a reference to the same list. After backtracking finishes, every entry in `result` is the same (usually empty) list. Always append `path[:]` or `path.copy()`.
- **Wrong starting index.** For "combinations" or "subsets," the next call should use `i + 1`, not `start + 1` or `i`. Using `start + 1` causes the same element to repeat in unintended ways; using `i` allows reusing the current element.
- **Pruning too late.** Checking validity *after* recursing wastes the entire subtree. Check before the recursive call when possible.
- **Pruning too aggressively.** Skipping a branch that *could* lead to a solution returns wrong answers. When in doubt, don't prune.
- **Mishandling duplicates.** The "skip same value at same level" pattern requires sorted input and the `i > start` check. Mixing it up with a global "skip seen values" set produces wrong answers.
- **Mutating during iteration.** If `choices(state)` returns a generator that depends on the current state, modifying state inside the loop changes future iterations. Snapshot the choices before iterating.
- **Stack overflow.** Backtracking recurses to the depth of one full solution. For most interview problems this is fine, but problems with very long solutions can hit Python's recursion limit.
- **Returning the wrong "found" signal.** When backtracking is searching for *any* solution (not all), the recursive call's return value matters. Return `True` up the chain when found, otherwise the outer call doesn't know to stop.

## Common Interview Problems

### Easy
- Generate Parentheses
- Letter Case Permutation
- Binary Watch
- Combinations of Letter Tile Possibilities

### Medium
- Subsets
- Subsets II
- Combinations
- Combination Sum
- Combination Sum II
- Combination Sum III
- Permutations
- Permutations II
- Letter Combinations of a Phone Number
- Word Search
- Palindrome Partitioning
- Restore IP Addresses
- Generalized Abbreviation
- Path Sum II
- Beautiful Arrangement
- Matchsticks to Square
- Splitting a String Into Descending Consecutive Values
- Maximum Length of a Concatenated String with Unique Characters
- The k-th Lexicographical String of All Happy Strings
- Find All K-Combinations With Sum N
- Iterator for Combination

### Hard
- N-Queens
- N-Queens II
- Sudoku Solver
- Word Search II (backtracking + trie)
- Expression Add Operators
- Remove Invalid Parentheses
- Word Break II
- Wildcard Matching
- Regular Expression Matching
- Robot Room Cleaner
- Partition to K Equal Sum Subsets
- Number of Patterns in a Phone Number
- Confusing Number II
- Closest Subsequence Sum
