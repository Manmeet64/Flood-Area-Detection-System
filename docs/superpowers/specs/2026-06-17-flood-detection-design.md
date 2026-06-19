# Flood Area Detection System — Design Spec
**Date:** 2026-06-17
**Topic:** BFS | Industry: Disaster Management

---

## Problem Summary

Detect flooded regions in a city represented as a binary grid (1 = flooded, 0 = dry). Use BFS to find all connected flood zones, label each zone, calculate its area, and visualize the result.

This is equivalent to LeetCode 695 (Max Area of Island) extended to report ALL zones, not just the largest — implemented with BFS (not DFS) as required.

---

## Target Users & Usage Scenario

A disaster management operator loads a city grid map, runs flood detection, and gets a zone-by-zone breakdown of affected areas to prioritize emergency response.

For this implementation: a student/examiner runs the web app locally, generates a random city grid, optionally edits it, clicks Detect, and sees the BFS result visualized.

---

## Architecture

```
Browser (React + Vite)
        ↕ HTTP (localhost:8000)
FastAPI (Python)
```

No database. No auth. Two endpoints.

---

## API Endpoints

### POST /generate
**Input:**
```json
{ "rows": 15, "cols": 15, "probability": 0.35 }
```
**Output:**
```json
{ "grid": [[0,1,0,...], [1,1,0,...], ...] }
```
Generates a random binary grid. `probability` controls flood density (0.0–1.0).

### POST /detect
**Input:**
```json
{ "grid": [[0,1,0,...], ...] }
```
**Output:**
```json
{
  "zones": [
    { "id": 1, "size": 14, "cells": [[0,1],[0,2],[1,1]] },
    { "id": 2, "size": 6,  "cells": [[3,4],[3,5],[4,4]] }
  ],
  "total_flooded": 20,
  "total_cells": 225,
  "flood_percentage": 8.9
}
```

---

## DSA Core: BFS Algorithm (bfs.py)

```
for each cell (i, j) in grid:
    if grid[i][j] == 1 and not visited[i][j]:
        zone_id += 1
        BFS from (i, j):
            queue = deque([(i, j)])
            mark visited
            while queue not empty:
                (r, c) = queue.popleft()
                add (r, c) to current zone cells
                for each of 4 neighbors (up/down/left/right):
                    if in bounds and grid[nr][nc] == 1 and not visited:
                        mark visited, enqueue
        append zone {id, size, cells} to result
```

**Complexity:** O(rows × cols) time and space — each cell visited at most once.

---

## File Structure

```
DSA_2026/
├── backend/
│   ├── main.py          # FastAPI app — two endpoints, calls bfs.py
│   └── bfs.py           # Pure BFS logic — no framework dependencies
│
└── frontend/
    ├── src/
    │   ├── App.jsx               # State: grid, zones. Layout root.
    │   ├── components/
    │   │   ├── Grid.jsx          # Renders cell table, colors by zone_id
    │   │   ├── Controls.jsx      # Size slider, Generate button, Detect button
    │   │   └── Report.jsx        # Zone table: id, size, % of grid
    │   └── api.js                # fetch wrappers for /generate and /detect
    ├── package.json
    └── vite.config.js
```

---

## State (App.jsx)

| State var | Type | Description |
|-----------|------|-------------|
| `grid` | `number[][]` | Current grid (0s and 1s) |
| `zones` | `Zone[]` | BFS result — null until Detect is run |
| `rows` | `number` | Grid height (slider, 5–30) |
| `cols` | `number` | Grid width (slider, 5–30) |
| `probability` | `number` | Flood density for generation (0.1–0.7) |

---

## Component Responsibilities

**Controls.jsx** — inputs only, no logic. Emits: `onGenerate()`, `onDetect()`, `onSizeChange()`, `onToggleCell()` is handled in Grid directly.

**Grid.jsx** — renders an HTML table. Each cell gets a background color:
- `0` (dry) → white
- `1` (flooded, undetected) → light gray
- `1` in zone N → color from a fixed palette (10 colors, cycling)
- Click on cell → toggle 0/1 in parent grid state

**Report.jsx** — renders only when `zones` is not null. Shows:
- Per-zone table (id, area in cells, % of total grid)
- Summary row: total flooded cells, flood %
- Largest zone highlighted

---

## User Flow

1. Set grid size via slider (default 15×15)
2. Click **Generate** → random grid appears
3. Optionally click cells to toggle flooded/dry
4. Click **Detect Floods** → BFS runs, zones colored, report appears
5. Repeat with new grid or manual edits

---

## Deliverables Mapping

| Assignment Deliverable | Implementation |
|------------------------|---------------|
| BFS flood detection logic | `backend/bfs.py` — pure, standalone |
| Grid visualization | `Grid.jsx` — colored by zone |
| Flood area report | `Report.jsx` — zone table with area + % |
| Simulation output | Generate → Detect flow demonstrates end-to-end |

---

## DSA Concept Efficiency Note

BFS ensures each cell is visited exactly once (O(n×m)). A naive approach checking all cells for every zone would be O((n×m)²). For a 50×50 grid: BFS = 2,500 operations vs naive = 6,250,000. The `visited` array is the key — it prevents re-processing and ensures correct zone separation.

---

## Scalability & Performance

- Grid up to 50×50 (2,500 cells) — BFS completes in <1ms
- No persistence needed — stateless API, grid lives in browser
- CORS enabled on FastAPI for local dev (localhost:5173 → localhost:8000)
