# 🔥 Gemini SRE Commander

> **AI-Powered Incident Response System** —  project built with Bun, TypeScript, and Gemini 3 Flash.

[![Bun](https://img.shields.io/badge/Bun-1.0+-black?style=flat-square&logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Gemini](https://img.shields.io/badge/Gemini-3_Flash-4285f4?style=flat-square&logo=google)](https://ai.google.dev)

---

## 🚀 What It Does

Gemini SRE Commander transforms chaotic system logs and metrics into **actionable incident intelligence** in seconds:

- 📊 **Upload logs** (text, JSON, or stream in real-time)
- 📸 **Add screenshots** (Grafana dashboards, architecture diagrams)
- 🧠 **AI analyzes** everything together using Gemini 3 Flash
- ✅ **Get structured output**: Root cause, mitigation plan, timeline, post-mortem
- 📖 **Auto-generated runbook commands** ready to copy-paste

---

## ✨ Worthy Features

| Feature | Why It Wins |
|---------|-------------|
| **🎮 4 Demo Scenarios** | Pre-loaded incidents: DB Outage, Cache Stampede, Memory Leak, DDoS |
| **📡 Real-time Streaming** | WebSocket-powered live log analysis |
| **✅ Interactive Checklist** | Track mitigation progress with visual progress bar |
| **📖 Smart Runbooks** | Context-aware commands based on incident type |
| **📥 Export Post-Mortem** | One-click markdown export |
| **🌙 Dark Mode UI** | Professional SRE aesthetic |

---

## 🛠️ Quick Start

```bash
# Clone the repository
git clone https://github.com/devinfebrian/SRE_Commander.git
cd SRE_Commander

# Install dependencies
bun install

# Copy environment file and add your API key
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run the server
bun run src/index.ts

# Open http://localhost:3000
```

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy it to your `.env` file

---

## 🎯 Demo Scenarios

Click **"🎮 Load Demo"** to try these pre-built incidents:

1. **🔥 Database Connection Storm** — Connection pool exhaustion causing cascading failures
2. **⚡ Cache Stampede** — Thundering herd problem after cache expiry
3. **💧 Memory Leak** — Gradual memory exhaustion in payment service
4. **🌊 DDoS Attack** — Distributed denial of service mitigation

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────┐     ┌─────────────────┐
│   User Upload   │────▶│  Bun Server  │────▶│  Gemini 3       │
│  (Logs + Images)│      │  (HTTP+WS)   │     │  Flash API      │
└─────────────────┘      └──────────────┘     └─────────────────┘
                               │                       │
                               ▼                       ▼
                        ┌──────────────┐     ┌─────────────────┐
                        │  Demo Data   │     │  Structured     │
                        │  Runbooks    │     │  JSON Output    │
                        └──────────────┘     └─────────────────┘
```

---

## 📡 Real-time Streaming

Connect via WebSocket for live log analysis:

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.send(JSON.stringify({
    type: 'logs',
    logs: '[2024-01-01] ERROR connection timeout'
}));

// Auto-analysis triggers when buffer reaches threshold
ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === 'analysis') {
        console.log('Incident detected:', data.data);
    }
};
```

---

## 🧠 AI Prompt Engineering

The system uses structured output with Gemini's JSON schema enforcement:

```typescript
const schema = {
    type: "OBJECT",
    properties: {
        incident_type: { type: "STRING" },
        severity: { type: "STRING", enum: ["low", "medium", "high", "critical"] },
        root_cause: {
            summary: { type: "STRING" },
            confidence: { type: "NUMBER" }
        },
        mitigation_plan: { /* ... */ },
        timeline: { /* ... */ },
        postmortem: { /* ... */ }
    }
};
```

---

## 📁 Project Structure

```
.
├── src/
│   ├── index.ts           # Bun HTTP + WebSocket server
│   ├── lib/
│   │   ├── gemini.ts      # Gemini 2.5 Flash integration
│   │   ├── websocket.ts   # Real-time streaming handler
│   │   ├── demo.ts        # 4 demo scenarios
│   │   └── runbooks.ts    # Context-aware runbook commands
│   └── types/
│       └── schema.ts      # TypeScript interfaces
├── public/
│   ├── index.html         # Enhanced UI with all features
│   └── style.css          # Dark theme + animations
└── plan/                  # Documentation & design
```

---

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/analyze` | POST | Analyze logs + images |
| `/api/demos` | GET | List demo scenarios |
| `/api/demos/:id` | GET | Get specific demo |
| `/api/runbooks/:type` | GET | Get runbook commands |
| `/ws` | WS | Real-time log streaming |

---

## 🔮 Future Enhancements

- [ ] Slack/Discord bot integration
- [ ] PagerDuty/Opsgenie webhook support
- [ ] Historical incident similarity search
- [ ] Team collaboration (comments, assignments)
- [ ] Custom runbook editor

---
