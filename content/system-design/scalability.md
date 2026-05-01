# Scalability

Scalability is the ability of a system to handle increased load without degrading performance. It's one of the first topics in any system design interview.

## Vertical vs Horizontal Scaling

**Vertical scaling (scale up):** Add more resources (CPU, RAM) to a single machine.
- Simple — no code changes needed
- Has a hard limit — you can only make one machine so big
- Single point of failure

**Horizontal scaling (scale out):** Add more machines and distribute load across them.
- No hard limit — keep adding machines
- Requires a load balancer to distribute traffic
- More complex — you must handle distributed state

Most large systems start vertical, then move horizontal as they grow.

## Load Balancing

A load balancer sits in front of your servers and routes incoming requests. Common strategies:

- **Round robin** — requests go to each server in turn
- **Least connections** — route to the server with fewest active connections
- **IP hash** — same client always goes to the same server (useful for session affinity)

## Caching

Store frequently accessed data in a fast layer (usually memory) to avoid expensive recomputation or database queries.

- **Client-side** — browser caches static assets
- **CDN** — caches content geographically close to users
- **Application cache** — Redis or Memcached in front of your database

### Cache Invalidation
The hard problem with caching. Two common strategies:
- **TTL (time to live)** — data expires after a fixed time
- **Write-through** — update cache whenever you update the database

## Database Scaling

- **Read replicas** — one primary handles writes, multiple replicas handle reads
- **Sharding** — split data across multiple databases by a key (e.g., user ID range)
- **Denormalization** — duplicate data to avoid expensive joins at scale

## Key Numbers to Know

| Latency | Approximate time |
|---------|-----------------|
| L1 cache access | 1 ns |
| RAM access | 100 ns |
| SSD read | 100 µs |
| Network round trip (same region) | 1 ms |
| Network round trip (cross-continent) | 100 ms |

Interviewers expect you to reason about these numbers when justifying architectural decisions.
