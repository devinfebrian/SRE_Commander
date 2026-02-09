import { serve } from "bun";
import { analyzeIncident } from "./lib/gemini";
import { 
    handleWebSocket, 
    handleWebSocketMessage, 
    handleWebSocketClose,
    type WebSocketData 
} from "./lib/websocket";
import { getAllDemoScenarios, getDemoScenario } from "./lib/demo";
import { getRunbookCommands } from "./lib/runbooks";

const server = serve({
    port: 3000,
    async fetch(req: Request, server) {
        const url = new URL(req.url);

        // WebSocket upgrade for real-time streaming
        if (url.pathname === "/ws") {
            const success = server.upgrade(req, {
                data: {
                    connectionId: crypto.randomUUID(),
                    buffer: [],
                    isAnalyzing: false
                } as WebSocketData
            });
            return success 
                ? undefined 
                : new Response("WebSocket upgrade failed", { status: 400 });
        }

        if (url.pathname === "/health") {
            return new Response("OK");
        }

        // Get all demo scenarios
        if (url.pathname === "/api/demos" && req.method === "GET") {
            return Response.json(getAllDemoScenarios().map(s => ({
                id: s.id,
                name: s.name,
                description: s.description,
                severity: s.severity
            })));
        }

        // Get specific demo scenario
        if (url.pathname.startsWith("/api/demos/") && req.method === "GET") {
            const id = url.pathname.split("/").pop();
            const scenario = id ? getDemoScenario(id) : undefined;
            if (scenario) {
                return Response.json(scenario);
            }
            return new Response("Scenario not found", { status: 404 });
        }

        // Get runbook commands for incident type
        if (url.pathname.startsWith("/api/runbooks/")) {
            const incidentType = decodeURIComponent(url.pathname.split("/").pop() || "");
            const commands = getRunbookCommands(incidentType);
            return Response.json({ commands });
        }

        if (url.pathname === "/api/analyze" && req.method === "POST") {
            try {
                const formData = await req.formData();
                const logsFile = formData.get("logs");
                const imageFiles = formData.getAll("images");

                let logs = "";
                if (typeof logsFile === "string") {
                    logs = logsFile;
                } else if (logsFile instanceof File) {
                    logs = await logsFile.text();
                }

                // Edge Case: Truncate logs if too large to prevent timeouts
                const MAX_LOG_LENGTH = 500000;
                if (logs.length > MAX_LOG_LENGTH) {
                    logs = logs.substring(0, MAX_LOG_LENGTH) + "\n\n[TRUNCATED DUE TO SIZE]";
                }

                if (!logs) {
                    return new Response("Missing 'logs' in body", { status: 400 });
                }

                const images: { mimeType: string; data: string }[] = [];
                for (const entry of imageFiles) {
                    if (entry instanceof File) {
                        // Strict MIME type check for Gemini inlineData
                        if (entry.type.startsWith("image/")) {
                            const arrayBuffer = await entry.arrayBuffer();
                            const base64 = Buffer.from(arrayBuffer).toString("base64");
                            images.push({
                                mimeType: entry.type,
                                data: base64,
                            });
                        } else {
                            console.warn(`Skipping unsupported file type: ${entry.name} (${entry.type})`);
                        }
                    }
                }

                const analysis = await analyzeIncident(logs, images);
                return Response.json(analysis);
            } catch (error) {
                console.error("Analysis failed:", error);
                return new Response("Internal Server Error", { status: 500 });
            }
        }

        const file = Bun.file(`public${url.pathname === "/" ? "/index.html" : url.pathname}`);
        if (await file.exists()) {
            return new Response(file);
        }

        return new Response("Not Found", { status: 404 });
    },
    websocket: {
        open: handleWebSocket,
        message: (ws, message) => handleWebSocketMessage(ws, message.toString()),
        close: handleWebSocketClose,
    }
});

console.log(`🚀 Gemini SRE Commander running at http://localhost:${server.port}`);
console.log(`📊 Health check: http://localhost:${server.port}/health`);
console.log(`🔌 WebSocket endpoint: ws://localhost:${server.port}/ws`);
console.log(`🎮 Demo scenarios: http://localhost:${server.port}/api/demos`);
