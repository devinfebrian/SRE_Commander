export interface RunbookCommand {
    command: string;
    description: string;
    requiresConfirmation?: boolean;
}

export interface Runbook {
    incidentTypes: string[];
    commands: RunbookCommand[];
}

export const runbooks: Runbook[] = [
    {
        incidentTypes: ['database', 'connection', 'pool', 'timeout', 'db'],
        commands: [
            {
                command: 'kubectl get pods -n database',
                description: 'Check database pod status'
            },
            {
                command: 'kubectl logs -n database deployment/postgres --tail=100',
                description: 'View recent database logs'
            },
            {
                command: 'psql -c "SELECT count(*) FROM pg_stat_activity;"',
                description: 'Check active connections'
            },
            {
                command: 'psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = \'idle\';"',
                description: 'Kill idle connections',
                requiresConfirmation: true
            },
            {
                command: 'kubectl scale deployment user-service --replicas=0 -n production && sleep 5 && kubectl scale deployment user-service --replicas=3 -n production',
                description: 'Restart user service to clear connection pool',
                requiresConfirmation: true
            }
        ]
    },
    {
        incidentTypes: ['cache', 'stampede', 'redis', 'thundering herd'],
        commands: [
            {
                command: 'redis-cli INFO stats',
                description: 'Check Redis statistics'
            },
            {
                command: 'redis-cli --hotkeys',
                description: 'Identify hot keys'
            },
            {
                command: 'kubectl exec -it deployment/cache-warmer -- /app/warm-cache.sh',
                description: 'Run cache warming job'
            },
            {
                command: 'redis-cli CONFIG SET maxmemory-policy allkeys-lru',
                description: 'Enable LRU eviction policy'
            }
        ]
    },
    {
        incidentTypes: ['memory', 'leak', 'oom', 'heap', 'gc'],
        commands: [
            {
                command: 'kubectl top pods -n production',
                description: 'Check pod memory usage'
            },
            {
                command: 'kubectl logs -n production deployment/payment-service | grep -i "heap\|memory\|gc"',
                description: 'Search for memory-related logs'
            },
            {
                command: 'jmap -histo:live <pid> | head -20',
                description: 'Get heap histogram'
            },
            {
                command: 'kubectl rollout restart deployment/payment-service -n production',
                description: 'Rolling restart of payment service',
                requiresConfirmation: true
            }
        ]
    },
    {
        incidentTypes: ['ddos', 'attack', 'waf', 'rate limit', 'traffic'],
        commands: [
            {
                command: 'kubectl logs -n edge deployment/waf-service | grep "BLOCK\|rate limit" | tail -50',
                description: 'View blocked requests'
            },
            {
                command: 'curl -X POST https://api.cloudflare.com/client/v4/zones/<zone>/firewall/access_rules/rules \
  -H "Authorization: Bearer <token>" \
  -d \'{"mode":"challenge","configuration":{"target":"ip","value":"<suspicious_ip>"}}\'',
                description: 'Add IP to challenge mode'
            },
            {
                command: 'kubectl scale deployment cdn-service --replicas=10 -n edge',
                description: 'Scale up CDN edge nodes'
            },
            {
                command: 'curl -X POST https://api.cloudflare.com/client/v4/zones/<zone>/settings/security_level \
  -H "Authorization: Bearer <token>" \
  -d \'{"value":"under_attack"}\'',
                description: 'Enable Under Attack mode',
                requiresConfirmation: true
            }
        ]
    }
];

export function getRunbookCommands(incidentType: string): RunbookCommand[] {
    const normalizedType = incidentType.toLowerCase();
    
    for (const runbook of runbooks) {
        if (runbook.incidentTypes.some(type => normalizedType.includes(type))) {
            return runbook.commands;
        }
    }
    
    // Default runbook
    return [
        {
            command: 'kubectl get pods --all-namespaces',
            description: 'Check all pod statuses'
        },
        {
            command: 'kubectl top nodes',
            description: 'Check node resource usage'
        },
        {
            command: 'kubectl logs -n kube-system deployment/kube-dns',
            description: 'Check DNS resolution'
        }
    ];
}
