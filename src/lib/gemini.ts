import { GoogleGenAI } from "@google/genai";
import type { IncidentAnalysis } from "../types/schema";

// Initialize Gemini with the new SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Schema definition matching the new SDK format if needed, 
// or simpler JSON schema object. The new SDK handles schema differently in some cases,
// but often accepts standard JSON schema.
const schema = {
    type: "OBJECT",
    properties: {
        incident_type: { type: "STRING" },
        severity: { type: "STRING", enum: ["low", "medium", "high", "critical"] },
        root_cause: {
            type: "OBJECT",
            properties: {
                summary: { type: "STRING" },
                confidence: { type: "NUMBER" },
            },
            required: ["summary", "confidence"],
        },
        evidence: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    source: { type: "STRING", enum: ["logs", "metrics", "architecture"] },
                    detail: { type: "STRING" },
                },
                required: ["source", "detail"],
            },
        },
        mitigation_plan: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    step: { type: "NUMBER" },
                    action: { type: "STRING" },
                    risk: { type: "STRING" },
                },
                required: ["step", "action", "risk"],
            },
        },
        timeline: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    time: { type: "STRING" },
                    event: { type: "STRING" },
                },
                required: ["time", "event"],
            },
        },
        postmortem: {
            type: "OBJECT",
            properties: {
                impact: { type: "STRING" },
                what_went_wrong: { type: "STRING" },
                what_went_well: { type: "STRING" },
                action_items: {
                    type: "ARRAY",
                    items: { type: "STRING" },
                },
            },
            required: ["impact", "what_went_wrong", "what_went_well", "action_items"],
        },
    },
    required: [
        "incident_type",
        "severity",
        "root_cause",
        "evidence",
        "mitigation_plan",
        "timeline",
        "postmortem",
    ],
};

export async function analyzeIncident(
    logs: string,
    images: { mimeType: string; data: string }[] = []
): Promise<IncidentAnalysis> {
    const parts: any[] = [{ text: `Analyze these system logs:\n\n${logs}` }];

    for (const image of images) {
        parts.push({
            inlineData: {
                mimeType: image.mimeType,
                data: image.data,
            },
        });
    }

    console.log("Sending parts to Gemini:", JSON.stringify(parts, null, 2));

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts }],
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            systemInstruction: `You are a senior Site Reliability Engineer.

You are responsible for analyzing system incidents using logs, metrics screenshots, and architecture diagrams.

You must:
1. Identify the specific technical incident type (e.g., "Cache Stampede", "DB Deadlock", not generic "Outage")
2. Determine the most likely root cause
3. Provide supporting evidence
4. Generate a step-by-step mitigation plan
5. Produce a post-incident summary

Return only valid JSON matching the provided schema.

Instructions:
- Reason across all inputs together
- Use evidence from logs and images
- Prefer causality over correlation
- Be concise and precise
`,
        },
    });

    // The new SDK response structure might differ slighty, verifying based on docs
    if (response.text) {
        try {
            return JSON.parse(response.text) as IncidentAnalysis;
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", response.text);
            // Fallback object so UI doesn't crash
            return {
                incident_type: "Analysis Error",
                severity: "critical",
                root_cause: { summary: "Failed to parse model output.", confidence: 0 },
                evidence: [],
                mitigation_plan: [],
                timeline: [],
                postmortem: {
                    impact: "Unknown",
                    what_went_wrong: "Model returned invalid JSON",
                    what_went_well: "System handled the error gracefully",
                    action_items: ["Retry analysis"]
                }
            };
        }
    }

    throw new Error("No response text derived from Gemini");
}
