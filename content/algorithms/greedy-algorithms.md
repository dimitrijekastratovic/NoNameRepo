# Greedy Algorithms

A **greedy algorithm** builds a solution one step at a time, at each step making the choice that looks best in the moment — without considering future consequences and without ever undoing a past choice. When greedy works, it's typically the simplest and fastest solution. When greedy doesn't work, it produces wrong answers that *look* right on small inputs, which makes greedy one of the easiest techniques to misapply in an interview.

The hardest part of greedy isn't writing the code. It's recognizing whether greedy applies at all and being able to defend the choice with an argument the interviewer accepts.

A few terms used throughout:

- **Locally optimal choice** — the choice that looks best given only the current state, ignoring what comes later.
- **Globally optimal solution** — the best solution to the entire problem.
- **Greedy choice property** — the property that says: making the locally optimal choice at every step leads to the globally optimal solution.
- **Exchange argument** — a proof technique showing that any optimal solution can be transformed into the greedy solution without losing optimality.

## When Greedy Works

A greedy algorithm is correct only when the problem has **both** of these properties:

**1. Greedy choice property.** A globally optimal solution can be built by making locally optimal choices. Once a choice is made, the problem reduces to a smaller subproblem, and you never need to revisit the choice.

**2. Optimal substructure.** The optimal solution to the full problem contains optimal solutions to its subproblems. (This is the same property dynamic programming requires — but DP solves the subproblems and combines them, while greedy commits to one choice and never reconsiders.)

If only the second holds, the problem is a DP problem, not a greedy one. If neither holds, brute force or backtracking is the path.

The catch: for many problems, the greedy choice property is **not obvious** and **not always true**. A greedy strategy that works on every example you can think of can still fail on a corner case the interviewer chose specifically to break it.

## Greedy vs Dynamic Programming

Both rely on optimal substructure, but they differ in how they handle choices.

| | Greedy | Dynamic Programming |
|---|--------|---------------------|
| Decision style | Commits to one choice per step | Considers all choices |
| Correctness | Requires the greedy choice property | Always works given optimal substructure |
| Time | Usually O(n log n) — dominated by a sort | Usually O(n²) or worse |
| Space | Usually O(1) extra | Usually O(n) or O(n²) |
| Risk | Easy to apply incorrectly | Easy to identify but harder to write |
| Proof needed | Yes — non-trivial | No — recurrence is the proof |

When you suspect greedy might work, the safe interview move is to first state the greedy strategy, give a one-line argument for why it works, and acknowledge the alternative DP approach in case greedy fails.

## A Worked Example: Activity Selection

Given `n` activities, each with a start and end time, select the maximum number that don't overlap.

**Greedy strategy:** Sort by **end time**. Repeatedly pick the next activity whose start is at or after the previous chosen activity's end.

```python
def max_activities(intervals):
    intervals.sort(key=lambda x: x[1])      # sort by end time
    count = 0
    last_end = float('-inf')
    for start, end in intervals:
        if start >= last_end:
            count += 1
            last_end = end
    return count
```

**Why it works (exchange argument):** Suppose the greedy picks activity `A` first (the one ending earliest). Consider any optimal solution. If it doesn't include `A`, swap its first activity for `A` — the result is still valid (because `A` ends at least as early, leaving at least as much room afterward) and has the same count, so it's still optimal. By induction, the rest of the greedy choices are also optimal.

**Why other natural strategies fail:**

- *Sort by start time* — picks the earliest-starting activity, which might be very long and block many others.
- *Sort by duration* — picks the shortest activity, which might be in the middle and split the available range awkwardly.
- *Pick fewest conflicts first* — sometimes works, but no general guarantee.

This pattern — sort by the right key, then sweep — is one of the most common greedy templates.

## Common Greedy Patterns

### Sort, Then Sweep

The dominant greedy pattern. Sort the input by some criterion, then make one pass making local decisions.

- **Activity Selection / Interval Scheduling** — sort by end time.
- **Merge Intervals** — sort by start time, merge overlapping.
- **Non-overlapping Intervals** — sort by end time, count how many to remove.
- **Minimum Number of Arrows to Burst Balloons** — sort by end time, count groups.

```python
def merge_intervals(intervals):
    intervals.sort()
    result = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= result[-1][1]:
            result[-1][1] = max(result[-1][1], end)
        else:
            result.append([start, end])
    return result
```

### Two Pointers / Greedy Match

When you have two sorted (or sortable) collections and want to pair them optimally.

**Assign Cookies** — give each child one cookie; maximize content children. Sort both arrays, give the smallest cookie that satisfies the smallest unsatisfied child.

```python
def find_content_children(g, s):
    g.sort()
    s.sort()
    i = j = 0
    while i < len(g) and j < len(s):
        if s[j] >= g[i]:
            i += 1
        j += 1
    return i
```

### Heap-Based Greedy

When the "best next choice" changes dynamically and depends on previous choices, a heap maintains the current best in O(log n).

**Meeting Rooms II** — minimum rooms needed for all meetings. Sort by start time. Use a min-heap of end times: when a new meeting starts, if the earliest-ending room is free (its end ≤ new start), reuse it; otherwise, allocate a new room.

```python
import heapq

def min_meeting_rooms(intervals):
    intervals.sort()
    heap = []                            # ends of currently-occupied rooms
    for start, end in intervals:
        if heap and heap[0] <= start:
            heapq.heappop(heap)
        heapq.heappush(heap, end)
    return len(heap)
```

Many "schedule N tasks optimally" problems follow this shape.

### Reach / Maximum Frontier

For path or sequence problems, track the farthest position reachable so far and extend it greedily.

**Jump Game** — given an array where each element is the maximum jump length from that position, decide whether you can reach the end.

```python
def can_jump(nums):
    farthest = 0
    for i, jump in enumerate(nums):
        if i > farthest:
            return False                 # can't even reach this position
        farthest = max(farthest, i + jump)
    return True
```

**Jump Game II** (minimum jumps) extends this: track the current jump's range and the farthest reachable position; when you exhaust the current range, increment the jump count and switch to the new range.

### Greedy on a Window

**Gas Station** — circular route; at each station, you gain `gas[i]` and spend `cost[i]`. Find a starting station that lets you complete the loop. Greedy: if total gas ≥ total cost, an answer exists. Walk through, tracking a running tank; if it ever drops below zero, no station up to here can be the start, so reset and try the next station.

```python
def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    total = start = 0
    for i in range(len(gas)):
        total += gas[i] - cost[i]
        if total < 0:
            start = i + 1
            total = 0
    return start
```

The non-obvious insight: if you fail at station `j` starting from `i`, then no station between `i` and `j` (inclusive) can be a valid start, because reaching `j` from any of them would also fail. So you can skip ahead to `j + 1` without checking each.

## Where Greedy Famously Fails

**Coin Change with arbitrary denominations.** Given coins `[1, 3, 4]`, make change for `6`. Greedy picks `4 + 1 + 1 = 3 coins`. The optimum is `3 + 3 = 2 coins`. Greedy fails because the "best" coin in the moment isn't part of an optimal combination.

US coin denominations (1, 5, 10, 25) happen to be greedy-friendly, which is why the technique is taught with coin examples — but the general problem requires DP.

**0/1 Knapsack.** Sorting items by value-to-weight ratio and picking greedily fails because items can't be split. (Fractional knapsack, where items can be split, *is* solvable greedily.)

**Longest Increasing Subsequence.** Picking the smallest available next element fails. The problem requires DP or a more careful technique using binary search.

The lesson: greedy intuition can mislead you. Always check whether the greedy choice property holds before committing to a greedy solution.

## How to Argue Greedy Correctness

In an interview, you don't need a full proof, but you should be able to articulate *why* the greedy choice is safe. Three approaches that work:

**1. Exchange argument.** Show that any solution that doesn't make the greedy choice can be modified to do so without becoming worse. Standard for interval scheduling, Huffman coding, scheduling problems.

**2. Loop invariant.** Show that after each greedy step, the partial solution can still be extended to a globally optimal solution. Useful for sweep-style problems.

**3. Brute-force comparison on small cases.** Not a proof, but verifying greedy matches brute force on a few small inputs at least catches obvious counterexamples. If they disagree, your greedy strategy is wrong.

## Time and Space Complexity

| Pattern | Time | Space |
|---------|------|-------|
| Sort, then sweep | O(n log n) | O(1) extra (in-place sort) |
| Two-pointer greedy | O(n) after sort | O(1) |
| Heap-based greedy | O(n log n) | O(n) |
| Single pass (e.g., Jump Game) | O(n) | O(1) |

Sort cost dominates most greedy algorithms. The sweep itself is usually O(n).

## When to Use

Reach for greedy when:

- The problem asks for an **optimum** (max / min / count).
- You can identify a clear "best next choice" rule (sort by something, take the largest, take the smallest).
- The problem has the structure of "make a sequence of choices, each from a small set."
- A natural sort order or priority queue would expose the right ordering.
- You can argue the greedy choice property via exchange or induction.

Greedy is **not** the right tool when:

- The greedy choice property doesn't hold — different local choices lead to different global outcomes.
- The problem has overlapping subproblems requiring DP.
- "Best next choice" depends on the entire future, not just current state.
- Counterexamples exist where greedy gives a suboptimal answer.

## Common Pitfalls

- **Picking the wrong sort key.** "Sort by end time" works for activity selection; "sort by start time" doesn't. Many greedy problems hinge on choosing the right sort criterion, and the right one isn't always obvious.
- **Assuming greedy works without proof.** A strategy that handles your test cases is not the same as a strategy that's correct. Try adversarial inputs.
- **Confusing greedy with brute-force iteration.** "Try every starting position and pick the best" is brute force, not greedy. Greedy commits to one starting position based on local information.
- **Forgetting to sort.** Some greedy solutions assume sorted input; if you forget, the algorithm produces wrong answers silently.
- **Greedy on the wrong dimension.** For interval problems, sorting by end vs start vs length all give different (and sometimes wrong) results. Think carefully about which key actually corresponds to "best next."
- **Mixing greedy with DP without realizing it.** "Greedy with backtracking" is just brute force or DP. If you find yourself wanting to undo a greedy choice, greedy isn't the right approach.
- **Tie-breaking errors.** When multiple choices look equally good, the tie-breaker can matter. Make it explicit.
- **Off-by-one in the comparison.** `start > last_end` vs `start >= last_end` changes whether touching intervals are considered overlapping. Read the problem carefully.

## Common Interview Problems

### Easy
- Best Time to Buy and Sell Stock
- Best Time to Buy and Sell Stock II
- Assign Cookies
- Lemonade Change
- Can Place Flowers
- Maximum 69 Number
- Minimum Cost to Move Chips to The Same Position

### Medium
- Jump Game
- Jump Game II
- Gas Station
- Task Scheduler
- Partition Labels
- Non-overlapping Intervals
- Minimum Number of Arrows to Burst Balloons
- Queue Reconstruction by Height
- Merge Intervals
- Insert Interval
- Meeting Rooms II
- Two City Scheduling
- Boats to Save People
- Minimum Deletions to Make Character Frequencies Unique
- Reduce Array Size to The Half
- Maximum Number of Events That Can Be Attended
- Bag of Tokens
- Largest Number
- Wiggle Subsequence
- Minimum Number of Increments on Subarrays to Form a Target Array
- Hand of Straights
- Minimum Add to Make Parentheses Valid
- Removing Stars From a String
- Maximum Ice Cream Bars
- Furthest Building You Can Reach
- Smallest String With A Given Numeric Value
- Maximum Performance of a Team

### Hard
- Candy
- Minimum Number of Refueling Stops
- Course Schedule III
- Patching Array
- Split Array into Consecutive Subsequences
- IPO
- Minimum Cost to Hire K Workers
- Maximum Profit in Job Scheduling
- Find Minimum Time to Finish All Jobs
- Minimum Number of Taps to Open to Water a Garden
- Maximum Number of Tasks You Can Assign
- Reorganize String (greedy + heap)
- Minimum Cost to Connect Two Groups of Points
- Minimum Number of Visible White Tiles After Covering With Carpets
