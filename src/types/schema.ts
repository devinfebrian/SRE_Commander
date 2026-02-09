export interface RootCause {
    summary: string;
    confidence: number;
}

export interface Evidence {
    source: 'logs' | 'metrics' | 'architecture';
    detail: string;
}

export interface MitigationStep {
    step: number;
    action: string;
    risk: string;
}

export interface TimelineEvent {
    time: string;
    event: string;
}

export interface PostMortem {
    impact: string;
    what_went_wrong: string;
    what_went_well: string;
    action_items: string[];
}

export interface IncidentAnalysis {
    incident_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    root_cause: RootCause;
    evidence: Evidence[];
    mitigation_plan: MitigationStep[];
    timeline: TimelineEvent[];
    postmortem: PostMortem;
}
