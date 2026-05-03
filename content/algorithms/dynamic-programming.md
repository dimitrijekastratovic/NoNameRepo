# Dynamic Programming

**Dynamic programming** (DP) is a technique for solving problems by breaking them into smaller subproblems, solving each subproblem once, and storing the result so it can be reused. It applies whenever a problem has two properties: **optimal substructure** (the answer can be built from answers to smaller versions of the same problem) and **overlapping subproblems** (those smaller problems are encountered repeatedly). DP turns exponential brute-force solutions into polynomial-time ones by ensuring each subproblem is solved exactly once.

DP is the most consistently challenging topic in coding interviews. Roughly a third of medium and hard problems at top tech companies are DP problems in disguise — climbing stairs, robbing houses, finding paths through grids, matching strings, partitioning arrays. The good news: most DP problems fall into a small number of recognizable patterns, and once you know the patterns, recognizing them in new problems becomes routine.

A few terms used throughout:

- **Subproblem** — a smaller version of the original problem.
- **State** — the set of variables that uniquely identifies a subproblem.
- **Recurrence** — the equation describing how the answer to a subproblem depends on smaller subproblems.
- **Base case** — the smallest subproblem(s), solved directly without recursion.
- **Memoization** — caching results of recursive calls (top-down DP).
- **Tabulation** — filling in a table iteratively (bottom-up DP).

## The Two Required Properties

Not every problem can be solved with DP. The technique applies only when both of these are true:

**1. Optimal substructure.** The answer to the full problem can be constructed from answers to smaller versions of the same problem. For example, the shortest path from A to C through B is the shortest path from A to B plus the shortest path from B to C — provided B is on the shortest path. This holds for many but not all problems; e.g., longest *simple* path does not have optimal substructure.

**2. Overlapping subproblems.** The recursive solution would solve the same subproblem multiple times. Fibonacci computes `fib(3)` repeatedly when calculating `fib(6)`. If subproblems are all distinct, there's nothing to memoize and DP doesn't help — that's a divide-and-conquer problem instead (e.g., merge sort).

## Fibonacci as a Worked Example

The canonical DP example. Naive recursion is exponential; DP makes it linear, and a small further optimization makes it constant-space.

### Step 1: Plain Recursion (Exponential)

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

Time: O(2ⁿ). Each call branches into two; many calls compute the same `fib(k)`.

### Step 2: Top-Down (Recursion + Memoization)

Cache each result the first time it's computed.

```python
def fib(n, memo=None):
    if memo is None:
        memo = {}
    if n < 2:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]
```

Time: O(n). Space: O(n) for the memo + O(n) for the recursion stack.

The Python standard library provides `functools.cache` (or `lru_cache`) to do this automatically:

```python
from functools import cache

@cache
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

### Step 3: Bottom-Up (Tabulation)

Fill a table from the base cases outward. No recursion, no stack overhead.

```python
def fib(n):
    if n < 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]
```

Time: O(n). Space: O(n).

### Step 4: Space-Optimized

Each `dp[i]` only depends on the previous two values. We can throw away everything older.

```python
def fib(n):
    if n < 2:
        return n
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1
```

Time: O(n). Space: O(1).

This four-step progression — recursion → memoization → tabulation → space optimization — is the path most DP problems can be walked along. Not every problem needs the final optimization, but recognizing the steps gives you a framework for any new problem.

## A Process for Solving DP Problems

1. **Identify the state.** What variables uniquely determine a subproblem? For Fibonacci, it's just `n`. For "longest common subsequence of two strings," it's `(i, j)` — positions in each string. The state is usually a tuple of indices, counts, or boolean flags.

2. **Define the recurrence.** Express the answer for a state in terms of answers for smaller states. This is the hardest step and the most creative part. Helpful question: *if I knew the answer for every state smaller than this one, how would I compute the answer for this one?*

3. **Identify base cases.** The smallest states whose answers can be filled in directly.

4. **Choose top-down or bottom-up.** Top-down is easier to write when the recurrence is natural; bottom-up is faster (no recursion overhead) and easier to space-optimize.

5. **(Optional) Optimize space.** If each state only depends on a small constant number of nearby states, you can often reduce O(n) or O(n²) space to O(1) or O(n).

## Common Patterns

### 1D Linear DP

The state is a single index. Each `dp[i]` depends on a few earlier values. Typical for problems like Climbing Stairs, House Robber, Decode Ways.

**House Robber** — a thief cannot rob two adjacent houses; maximize the loot.

```python
def rob(nums):
    if not nums:
        return 0
    prev2, prev1 = 0, 0
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1
```

The recurrence is `dp[i] = max(dp[i-1], dp[i-2] + nums[i])` — either skip this house (keep the previous answer) or rob it (the answer two back, plus this house). Space-optimized to O(1).

### 2D Grid DP

The state is a pair `(i, j)` and the recurrence relates each cell to its neighbors above, left, or both.

**Unique Paths** — count paths from the top-left to the bottom-right of a grid, moving only right or down.

```python
def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
    return dp[m - 1][n - 1]
```

The first row and first column are all 1 (one way to reach those cells). Every other cell is the sum of the cell above and the cell to the left.

Space optimization: since each row only depends on the row above, you can use a single array of length `n` and update it in place.

### Subsequence DP (Two Strings)

The state is a pair `(i, j)` with one index in each input. Common for string-matching DP: Longest Common Subsequence, Edit Distance, Distinct Subsequences.

**Longest Common Subsequence (LCS)** — length of the longest sequence appearing in both strings as a subsequence (not necessarily contiguous).

```python
def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]
```

The recurrence: if the current characters match, extend the LCS of the previous prefixes. Otherwise, take the better of dropping one character from either string.

**Edit Distance** (minimum number of insert/delete/replace operations to transform one string into another) follows the same shape, with `min` instead of `max` and three options instead of two.

### Knapsack

The state is `(item_index, remaining_capacity)`. At each item, you either take it (if it fits) or skip it.

**0/1 Knapsack** — given items with weights and values, maximize value within a weight limit. Each item is taken at most once.

```python
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for c in range(capacity + 1):
            dp[i][c] = dp[i - 1][c]                      # skip item i
            if weights[i - 1] <= c:
                dp[i][c] = max(dp[i][c],
                               dp[i - 1][c - weights[i - 1]] + values[i - 1])
    return dp[n][capacity]
```

The knapsack template is the foundation for: Subset Sum, Partition Equal Subset Sum, Target Sum, Coin Change, Combination Sum IV, and "ways to reach amount" problems.

### Interval DP

The state is `(left, right)` — a range within the input. The recurrence considers all ways to split the range. Typical for problems on arrays where the answer depends on choices about contiguous ranges.

Examples: Matrix Chain Multiplication, Burst Balloons, Palindrome Partitioning II, Stone Game variants.

```python
def matrix_chain(dims):
    n = len(dims) - 1
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float('inf')
            for k in range(i, j):
                cost = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]
                dp[i][j] = min(dp[i][j], cost)
    return dp[0][n - 1]
```

The outer loop iterates over interval lengths, ensuring smaller intervals are computed before larger ones — a common pattern for interval DP.

### DP on Trees

The state is `(node, some_flag)`. Solve each subtree recursively, then combine the children's answers at the parent. Examples: House Robber III, Binary Tree Maximum Path Sum, Diameter of Binary Tree.

```python
def rob_tree(root):
    def helper(node):
        if node is None:
            return (0, 0)                    # (rob this, skip this)
        left = helper(node.left)
        right = helper(node.right)
        rob_this = node.val + left[1] + right[1]
        skip_this = max(left) + max(right)
        return (rob_this, skip_this)
    return max(helper(root))
```

Each call returns a tuple capturing both choices the parent might need to consider. The parent picks based on its own choice.

### Bitmask DP

The state includes a bitmask representing which elements (or which features) have been used. Typical for small `n` (up to ~20) where the state space is `2ⁿ × something`. Examples: Traveling Salesman, Shortest Path Visiting All Nodes, Number of Ways to Wear Different Hats.

This pattern is more advanced and shows up in hard problems. Worth knowing it exists; the implementation pattern is `dp[mask][i]` where `mask` is the set of completed elements.

## Top-Down vs Bottom-Up

Both approaches solve the same recurrence. They differ in execution.

| | Top-Down (Memoization) | Bottom-Up (Tabulation) |
|---|------------------------|------------------------|
| Style | Recursive function with cache | Iterative, fills a table |
| Easier to write | Usually yes — follows the natural recurrence | Sometimes harder — requires picking iteration order |
| Speed | Slower — function call overhead | Faster — tight loop |
| Stack risk | Yes — recursion depth | No |
| Computes only what's needed | Yes — only reachable states | No — fills the entire table |
| Easier to space-optimize | No | Yes |

For interview purposes, top-down is often easier to derive and explain. Once it works, you can convert to bottom-up if performance or stack depth requires it.

## Space Optimization

Many DP solutions can use less memory than the obvious table size. The key observation: if `dp[i]` only depends on `dp[i-1]` and `dp[i-2]`, you don't need the whole array — just the last two values. If `dp[i][j]` only depends on the previous row, you don't need a 2D table — just two rows (or sometimes one).

Common reductions:

| Original | Optimized |
|----------|-----------|
| 1D array, depends on last `k` values | `k` variables |
| 2D table, depends on previous row | One or two 1D arrays |
| 2D table, depends on previous row and column | One 1D array, careful update order |

Space optimization is a frequent follow-up question after the candidate produces a working solution. "Can you do it in less space?" is the cue.

## Time and Space Complexity

The general formula is:

```
Time = (number of states) × (work per state)
Space = (number of states), reducible if state dependencies are local
```

| Pattern | Typical Time | Typical Space |
|---------|--------------|---------------|
| 1D linear | O(n) | O(n), often O(1) |
| 2D grid | O(m × n) | O(m × n), often O(min(m, n)) |
| Two-string subsequence | O(m × n) | O(m × n), often O(min(m, n)) |
| Knapsack | O(n × capacity) | O(n × capacity), often O(capacity) |
| Interval DP | O(n³) | O(n²) |
| Tree DP | O(n) | O(h) for recursion, where h is tree height |
| Bitmask DP | O(2ⁿ × n) | O(2ⁿ × n) |

When the problem allows, the goal is to identify the state with the fewest variables that still captures everything needed for the recurrence — fewer variables means fewer states means faster solution.

## When to Use

Reach for DP when the problem:

- Asks for an **optimum** (maximum / minimum) over choices.
- Asks for a **count** of ways to do something.
- Asks **yes/no** about whether something is achievable, with branching choices.
- Has a **natural recursive structure** with overlapping subproblems.
- Resembles one of the canonical patterns above.

DP is **not** the right tool when:

- The problem can be solved greedily (every local choice leads to the global optimum).
- The problem doesn't have overlapping subproblems — divide and conquer fits better.
- The state space is too large to enumerate (then it's heuristic search territory).
- A direct mathematical formula exists.

## Common Pitfalls

- **State definition is too narrow.** If your `dp[i]` doesn't capture everything the recurrence needs, you'll be unable to write a correct recurrence. Add another dimension to the state.
- **State definition is too broad.** Including unnecessary variables explodes the state space. Drop variables that don't affect future decisions.
- **Wrong base case.** Check: what's the answer for the smallest input (empty string, zero items, length-1 array)? Get this wrong and the entire table is off.
- **Wrong iteration order.** In bottom-up, smaller subproblems must be computed before larger ones. For interval DP, this means iterating by interval length, not by left endpoint.
- **Off-by-one in indexing.** Many DP solutions use `dp[i + 1]` to represent "after processing the first `i` elements" — clean for handling empty prefixes but easy to get wrong. Pick a convention and stick with it.
- **Mutating `dp` in place during a sweep.** When optimizing 2D DP to 1D, the update order matters. Updating left-to-right vs right-to-left can differ in correctness.
- **Forgetting to memoize.** A "DP" solution that doesn't actually cache results is still exponential. With `functools.cache`, this is hard to forget; without it, easy.
- **Memoizing on mutable arguments.** `lru_cache` and `functools.cache` require hashable arguments. Pass tuples, not lists.
- **Misidentifying the problem.** Treating a non-DP problem as DP wastes effort. Conversely, brute-forcing a DP problem times out. Recognizing the patterns above is most of the battle.
- **Not space-optimizing when asked.** Most interviewers expect at least an awareness of when O(n²) space can be reduced to O(n).

## Common Interview Problems

### Easy
- Climbing Stairs
- Fibonacci Number
- Min Cost Climbing Stairs
- House Robber
- Maximum Subarray (Kadane's algorithm)
- Best Time to Buy and Sell Stock
- Pascal's Triangle
- Counting Bits
- N-th Tribonacci Number
- Is Subsequence
- Divisor Game

### Medium
- House Robber II
- Decode Ways
- Unique Paths
- Unique Paths II
- Minimum Path Sum
- Coin Change
- Coin Change II
- Longest Increasing Subsequence
- Word Break
- Partition Equal Subset Sum
- Target Sum
- Combination Sum IV
- Maximum Product Subarray
- Longest Palindromic Substring
- Palindromic Substrings
- Edit Distance (sometimes labeled hard)
- Longest Common Subsequence
- Maximal Square
- Perfect Squares
- Best Time to Buy and Sell Stock with Cooldown
- Best Time to Buy and Sell Stock with Transaction Fee
- Delete Operation for Two Strings
- Count Square Submatrices with All Ones
- Number of Longest Increasing Subsequence
- Stone Game
- Predict the Winner
- Ones and Zeroes
- Last Stone Weight II
- Knight Probability in Chessboard
- Out of Boundary Paths
- Champagne Tower

### Hard
- Edit Distance
- Regular Expression Matching
- Wildcard Matching
- Distinct Subsequences
- Burst Balloons
- Best Time to Buy and Sell Stock III
- Best Time to Buy and Sell Stock IV
- Longest Valid Parentheses
- Trapping Rain Water (DP variant)
- Maximum Rectangle
- Russian Doll Envelopes
- Minimum Number of Refueling Stops
- Stone Game II / III / IV / V
- Cherry Pickup
- Cherry Pickup II
- Profitable Schemes
- Number of Ways to Wear Different Hats to Each Other (bitmask DP)
- Frog Jump
- Largest Sum of Averages
- Strange Printer
- Remove Boxes
- Number of Music Playlists
- Tallest Billboard
- Minimum Insertion Steps to Make a String Palindrome
