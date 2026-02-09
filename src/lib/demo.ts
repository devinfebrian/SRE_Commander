export interface DemoScenario {
    id: string;
    name: string;
    description: string;
    logs: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export const demoScenarios: DemoScenario[] = [
    {
        id: 'db-outage',
        name: '🔥 Database Connection Storm',
        description: 'Connection pool exhaustion causing cascading failures',
        severity: 'critical',
        logs: `2023-10-27 10:00:01 INFO  api-gateway Received request GET /api/v1/users/123
2023-10-27 10:00:01 INFO  api-gateway Received request GET /api/v1/users/124
2023-10-27 10:00:01 INFO  api-gateway Received request GET /api/v1/users/125
2023-10-27 10:00:02 INFO  user-service Querying database for user 123
2023-10-27 10:00:02 INFO  user-service Querying database for user 124
2023-10-27 10:00:02 INFO  user-service Querying database for user 125
2023-10-27 10:00:05 WARN  user-service Database query took 3000ms
2023-10-27 10:00:05 WARN  user-service Database query took 3100ms
2023-10-27 10:00:05 WARN  user-service Database query took 3200ms
2023-10-27 10:00:06 ERROR user-service ConnectionTimeout: Failed to connect to DB-Primary
2023-10-27 10:00:06 ERROR user-service ConnectionPoolExhausted: No available connections (100/100 in use)
2023-10-27 10:00:06 ERROR api-gateway 500 Internal Server Error
2023-10-27 10:00:06 ERROR api-gateway 500 Internal Server Error
2023-10-27 10:00:07 ERROR api-gateway Circuit breaker opened for user-service
2023-10-27 10:00:07 WARN  load-balancer Health check failed for user-service-01
2023-10-27 10:00:07 WARN  load-balancer Health check failed for user-service-02
2023-10-27 10:00:08 ERROR db-watcher Replication lag high: 500s
2023-10-27 10:00:10 ERROR db-primary Too many connections (max_connections = 100)
2023-10-27 10:00:15 WARN  cache-service Cache miss rate: 95%
2023-10-27 10:00:20 ERROR api-gateway Request timeout after 30s`
    },
    {
        id: 'cache-stampede',
        name: '⚡ Cache Stampede',
        description: 'Thundering herd problem after cache expiry',
        severity: 'high',
        logs: `2023-10-27 14:30:00 INFO  cache-service Cache key "user:profile:*" expired
2023-10-27 14:30:00 INFO  api-gateway Received request GET /api/v1/users/profile/1
2023-10-27 14:30:00 INFO  api-gateway Received request GET /api/v1/users/profile/2
2023-10-27 14:30:00 INFO  api-gateway Received request GET /api/v1/users/profile/3
2023-10-27 14:30:00 INFO  api-gateway Received request GET /api/v1/users/profile/4
2023-10-27 14:30:00 INFO  api-gateway Received request GET /api/v1/users/profile/5
2023-10-27 14:30:00 INFO  api-gateway Received request GET /api/v1/users/profile/6
2023-10-27 14:30:00 INFO  api-gateway Received request GET /api/v1/users/profile/7
2023-10-27 14:30:00 INFO  api-gateway Received request GET /api/v1/users/profile/8
2023-10-27 14:30:00 INFO  api-gateway Received request GET /api/v1/users/profile/9
2023-10-27 14:30:00 INFO  api-gateway Received request GET /api/v1/users/profile/10
2023-10-27 14:30:01 INFO  user-service Cache miss for user:profile:1 - querying DB
2023-10-27 14:30:01 INFO  user-service Cache miss for user:profile:2 - querying DB
2023-10-27 14:30:01 INFO  user-service Cache miss for user:profile:3 - querying DB
2023-10-27 14:30:01 INFO  user-service Cache miss for user:profile:4 - querying DB
2023-10-27 14:30:01 INFO  user-service Cache miss for user:profile:5 - querying DB
2023-10-27 14:30:01 WARN  db-replica Active connections spike: 50 -> 500
2023-10-27 14:30:02 WARN  db-replica Active connections spike: 500 -> 800
2023-10-27 14:30:02 WARN  db-replica Query latency p99: 500ms -> 5000ms
2023-10-27 14:30:03 ERROR user-service DB query timeout after 5000ms
2023-10-27 14:30:03 ERROR user-service DB query timeout after 5000ms
2023-10-27 14:30:03 ERROR api-gateway 503 Service Unavailable
2023-10-27 14:30:03 ERROR api-gateway 503 Service Unavailable
2023-10-27 14:30:05 WARN  rate-limiter Rate limit exceeded for /api/v1/users/profile
2023-10-27 14:30:10 INFO  cache-service Deploying cache warming job
2023-10-27 14:30:15 INFO  cache-service Cache warmed for 1000 user profiles`
    },
    {
        id: 'memory-leak',
        name: '💧 Memory Leak',
        description: 'Gradual memory exhaustion in payment service',
        severity: 'medium',
        logs: `2023-10-27 08:00:00 INFO  payment-service Started processing batch payments
2023-10-27 08:15:00 INFO  payment-service Heap usage: 128MB
2023-10-27 08:30:00 INFO  payment-service Heap usage: 256MB
2023-10-27 08:45:00 WARN  payment-service Heap usage: 512MB
2023-10-27 09:00:00 WARN  payment-service Heap usage: 768MB
2023-10-27 09:15:00 WARN  payment-service Heap usage: 1024MB
2023-10-27 09:30:00 WARN  payment-service Heap usage: 1280MB - approaching limit
2023-10-27 09:45:00 ERROR payment-service Heap usage: 1536MB - GC thrashing detected
2023-10-27 09:45:30 WARN  payment-service Response time p99: 200ms -> 2000ms
2023-10-27 09:46:00 ERROR payment-service OutOfMemoryError: Java heap space
2023-10-27 09:46:01 ERROR payment-service Service restarting due to OOM
2023-10-27 09:46:05 INFO  payment-service Service restarted, heap: 64MB
2023-10-27 09:46:30 INFO  payment-service Heap usage: 128MB
2023-10-27 09:47:00 INFO  payment-service Heap usage: 256MB
2023-10-27 09:47:30 WARN  payment-service Pattern detected: Memory growing 128MB every 30s
2023-10-27 09:48:00 INFO  alert-manager Sending alert: Memory leak detected in payment-service`
    },
    {
        id: 'ddos',
        name: '🌊 DDoS Attack',
        description: 'Distributed denial of service from suspicious IPs',
        severity: 'high',
        logs: `2023-10-27 16:00:00 INFO  edge-gateway Traffic: 1000 req/s - normal
2023-10-27 16:05:00 INFO  edge-gateway Traffic: 5000 req/s - spike detected
2023-10-27 16:05:01 INFO  edge-gateway Traffic: 10000 req/s
2023-10-27 16:05:02 INFO  edge-gateway Traffic: 50000 req/s
2023-10-27 16:05:03 WARN  edge-gateway Traffic: 100000 req/s - potential attack
2023-10-27 16:05:04 WARN  waf-service Blocking IP: 192.168.1.100 - rate limit exceeded
2023-10-27 16:05:04 WARN  waf-service Blocking IP: 192.168.1.101 - rate limit exceeded
2023-10-27 16:05:04 WARN  waf-service Blocking IP: 192.168.1.102 - rate limit exceeded
2023-10-27 16:05:05 WARN  waf-service 1000 IPs blocked in last 10 seconds
2023-10-27 16:05:06 ERROR origin-server Connection pool exhausted
2023-10-27 16:05:07 ERROR origin-server 503 Service Unavailable
2023-10-27 16:05:10 INFO  cdn-service Cache hit ratio: 95% - absorbing traffic
2023-10-27 16:05:15 INFO  waf-service Enabling challenge mode for suspicious ASNs
2023-10-27 16:05:20 INFO  edge-gateway Traffic dropping: 80000 req/s
2023-10-27 16:05:30 INFO  edge-gateway Traffic normalized: 1200 req/s
2023-10-27 16:06:00 INFO  security-team Attack mitigated - botnet signatures detected`
    }
];

export function getDemoScenario(id: string): DemoScenario | undefined {
    return demoScenarios.find(s => s.id === id);
}

export function getAllDemoScenarios(): DemoScenario[] {
    return demoScenarios;
}
