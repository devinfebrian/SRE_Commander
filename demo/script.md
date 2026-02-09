# Gemini SRE Commander - Demo Script

## Scenario: The Cache Stampede
**Concept**: A Redis failure causes a massive spike in database traffic ("thundering herd"), bringing down the primary database and the API.

## Step 1: The Setup
1. Open the SRE Commander Dashboard (`http://localhost:3000`).
2. Show the empty state: "Ready to analyze."

## Step 2: The Incident
*Narrator: "It's 9:00 AM on Black Friday. Traffic is surging. Suddenly, on-call pagers start exploding."*

1. **Action**: Select the `logs_crisis.txt` file from the `demo/` folder.
2. **Action**: (Optional) Upload a screenshot of a spiked CPU graph if available (or just skip).
3. **Action**: Click **"Analyze Incident"**.

## Step 3: The Analysis
*Narrator: "Usually, this would take 3 engineers 20 minutes to correlate. Gemini does it in seconds."*

1. **Observe**: Watch the loading state.
2. **Result**:
   - Check **Incident Type**: Should be "Cache Stampede" or "Database Overload".
   - Check **Severity**: Should be "CRITICAL".
   - READ the **Root Cause**: "Redis OOM eviction caused cache misses, leading to DB connection saturation."
   - Check **Confidence**: High (>90%).

## Step 4: The Mitigation
1. Review the **Mitigation Plan**:
   - Expect suggestions like: "Resize/Fluctuate Redis", "Enable DB connection pooling", "Implement exponential backoff".

## Step 5: Post-Mortem
1. Click **"Download Post-Mortem"**.
2. Open the file to show the generated Markdown report.
3. *End Scene*.
