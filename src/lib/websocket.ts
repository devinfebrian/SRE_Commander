import type { ServerWebSocket } from "bun";
import { analyzeIncident } from "./gemini";

export interface WebSocketData {
    connectionId: string;
    buffer: string[];
    isAnalyzing: boolean;
}

// Store active connections
const connections = new Map<string, ServerWebSocket<WebSocketData>>();

export function handleWebSocket(ws: ServerWebSocket<WebSocketData>) {
    console.log(`WebSocket connected: ${ws.data.connectionId}`);
    connections.set(ws.data.connectionId, ws);

    ws.send(JSON.stringify({
        type: 'connected',
        message: 'Real-time log streaming started'
    }));
}

export function handleWebSocketMessage(ws: ServerWebSocket<WebSocketData>, message: string) {
    try {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'logs':
                // Buffer incoming logs
                ws.data.buffer.push(data.logs);
                
                // Keep buffer size manageable
                if (ws.data.buffer.length > 100) {
                    ws.data.buffer.shift();
                }

                // Send acknowledgment
                ws.send(JSON.stringify({
                    type: 'received',
                    bufferSize: ws.data.buffer.length
                }));

                // Trigger analysis if buffer is substantial and not already analyzing
                const combinedLogs = ws.data.buffer.join('\n');
                if (combinedLogs.length > 500 && !ws.data.isAnalyzing) {
                    triggerAnalysis(ws, combinedLogs);
                }
                break;

            case 'analyze':
                // Force immediate analysis
                const allLogs = ws.data.buffer.join('\n');
                triggerAnalysis(ws, allLogs, data.images || []);
                break;

            case 'clear':
                ws.data.buffer = [];
                ws.data.isAnalyzing = false;
                ws.send(JSON.stringify({ type: 'cleared' }));
                break;
        }
    } catch (error) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
        }));
    }
}

async function triggerAnalysis(
    ws: ServerWebSocket<WebSocketData>,
    logs: string,
    images?: { mimeType: string; data: string }[]
) {
    if (ws.data.isAnalyzing) return;

    ws.data.isAnalyzing = true;
    ws.send(JSON.stringify({ type: 'analyzing' }));

    try {
        const analysis = await analyzeIncident(logs, images || []);
        ws.send(JSON.stringify({
            type: 'analysis',
            data: analysis
        }));
    } catch (error) {
        ws.send(JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Analysis failed'
        }));
    } finally {
        ws.data.isAnalyzing = false;
    }
}

export function handleWebSocketClose(ws: ServerWebSocket<WebSocketData>) {
    console.log(`WebSocket disconnected: ${ws.data.connectionId}`);
    connections.delete(ws.data.connectionId);
}

// Broadcast to all connected clients (useful for team collaboration)
export function broadcast(message: object) {
    const data = JSON.stringify(message);
    for (const ws of connections.values()) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    }
}
