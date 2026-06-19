# Flood Area Detection System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app where a city grid is generated, BFS detects all connected flood zones, and results are visualized with a per-zone area report.

**Architecture:** React frontend sends grid to FastAPI backend. Python runs BFS in `bfs.py` (pure, no framework), returns labeled zones. React colors each zone and renders a report table.

**Tech Stack:** Python 3.11+, FastAPI, uvicorn, React 18, Vite, plain CSS (no UI library)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `backend/bfs.py` | Create | Pure BFS algorithm — no FastAPI imports |
| `backend/main.py` | Create | FastAPI app, `/generate` and `/detect` endpoints |
| `backend/requirements.txt` | Create | fastapi, uvicorn |
| `frontend/` | Create | Vite scaffold via CLI |
| `frontend/src/api.js` | Create | fetch wrappers for backend |
| `frontend/src/App.jsx` | Modify | State root: grid, zones, rows, cols, probability |
| `frontend/src/components/Controls.jsx` | Create | Slider + Generate + Detect buttons |
| `frontend/src/components/Grid.jsx` | Create | HTML table, cell colors by zone, click to toggle |
| `frontend/src/components/Report.jsx` | Create | Zone table with area + % |
| `frontend/src/App.css` | Modify | Layout styles |

---

## Task 1: Backend scaffold + BFS core

**Files:**
- Create: `backend/bfs.py`
- Create: `backend/requirements.txt`

- [ ] **Step 1: Create backend directory and requirements**

```bash
mkdir -p backend
```

Create `backend/requirements.txt`:
```
fastapi
uvicorn[standard]
```

- [ ] **Step 2: Write BFS logic in `backend/bfs.py`**

```python
from collections import deque


DIRECTIONS = [(0, 1), (0, -1), (1, 0), (-1, 0)]


def detect_flood_zones(grid: list[list[int]]) -> dict:
    if not grid or not grid[0]:
        return {"zones": [], "total_flooded": 0, "total_cells": 0, "flood_percentage": 0.0}

    rows = len(grid)
    cols = len(grid[0])
    visited = [[False] * cols for _ in range(rows)]
    zones = []
    zone_id = 0

    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == 1 and not visited[i][j]:
                zone_id += 1
                cells = []
                queue = deque()
                queue.append((i, j))
                visited[i][j] = True

                while queue:
                    r, c = queue.popleft()
                    cells.append([r, c])
                    for dr, dc in DIRECTIONS:
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and not visited[nr][nc]:
                            visited[nr][nc] = True
                            queue.append((nr, nc))

                zones.append({"id": zone_id, "size": len(cells), "cells": cells})

    total_cells = rows * cols
    total_flooded = sum(z["size"] for z in zones)
    flood_percentage = round(total_flooded / total_cells * 100, 1) if total_cells > 0 else 0.0

    return {
        "zones": zones,
        "total_flooded": total_flooded,
        "total_cells": total_cells,
        "flood_percentage": flood_percentage,
    }
```

- [ ] **Step 3: Manually verify BFS logic with a quick test in terminal**

```bash
cd backend
python3 -c "
from bfs import detect_flood_zones
grid = [
  [1,1,0,0],
  [1,0,0,1],
  [0,0,0,1],
  [0,1,0,0],
]
result = detect_flood_zones(grid)
print('Zones:', len(result['zones']))
print('Total flooded:', result['total_flooded'])
for z in result['zones']:
    print(f'  Zone {z[\"id\"]}: {z[\"size\"]} cells')
"
```

Expected output:
```
Zones: 3
Total flooded: 6
  Zone 1: 3 cells
  Zone 2: 2 cells
  Zone 3: 1 cells
```

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat: add BFS flood zone detection core"
```

---

## Task 2: FastAPI endpoints

**Files:**
- Create: `backend/main.py`

- [ ] **Step 1: Install dependencies**

```bash
cd backend
pip install -r requirements.txt
```

- [ ] **Step 2: Create `backend/main.py`**

```python
import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bfs import detect_flood_zones

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    rows: int
    cols: int
    probability: float


class DetectRequest(BaseModel):
    grid: list[list[int]]


@app.post("/generate")
def generate(req: GenerateRequest):
    grid = [
        [1 if random.random() < req.probability else 0 for _ in range(req.cols)]
        for _ in range(req.rows)
    ]
    return {"grid": grid}


@app.post("/detect")
def detect(req: DetectRequest):
    return detect_flood_zones(req.grid)
```

- [ ] **Step 3: Start server and verify endpoints respond**

```bash
cd backend
uvicorn main:app --reload --port 8000
```

In a new terminal:
```bash
curl -s -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"rows":5,"cols":5,"probability":0.4}' | python3 -m json.tool
```

Expected: a JSON object with a `grid` key containing a 5×5 array of 0s and 1s.

```bash
curl -s -X POST http://localhost:8000/detect \
  -H "Content-Type: application/json" \
  -d '{"grid":[[1,1,0],[0,1,0],[0,0,1]]}' | python3 -m json.tool
```

Expected:
```json
{
  "zones": [
    {"id": 1, "size": 3, "cells": [[0,0],[0,1],[1,1]]},
    {"id": 2, "size": 1, "cells": [[2,2]]}
  ],
  "total_flooded": 4,
  "total_cells": 9,
  "flood_percentage": 44.4
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/main.py
git commit -m "feat: add FastAPI endpoints for generate and detect"
```

---

## Task 3: React scaffold + api.js

**Files:**
- Create: `frontend/` (Vite scaffold)
- Create: `frontend/src/api.js`

- [ ] **Step 1: Scaffold Vite React project**

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

- [ ] **Step 2: Delete boilerplate files**

```bash
rm src/assets/react.svg public/vite.svg src/App.css
```

Create blank `src/App.css`:
```css
/* styles added in Task 6 */
```

- [ ] **Step 3: Create `frontend/src/api.js`**

```js
const BASE = "http://localhost:8000";

export async function generateGrid(rows, cols, probability) {
  const res = await fetch(`${BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows, cols, probability }),
  });
  return res.json();
}

export async function detectZones(grid) {
  const res = await fetch(`${BASE}/detect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grid }),
  });
  return res.json();
}
```

- [ ] **Step 4: Verify dev server starts**

```bash
cd frontend
npm run dev
```

Expected: Vite prints `Local: http://localhost:5173/` with no errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold React frontend and api.js"
```

---

## Task 4: Controls component

**Files:**
- Create: `frontend/src/components/Controls.jsx`

Design rules applied: flat controls bar, `#111111` primary button, `#FBFBFA` surface, `Geist Sans` font, `1px solid #EAEAEA` borders, no shadows, no pill buttons, no blue primary.

- [ ] **Step 1: Create `frontend/src/components/Controls.jsx`**

```jsx
export default function Controls({ rows, cols, probability, onRowsChange, onColsChange, onProbabilityChange, onGenerate, onDetect }) {
  return (
    <div className="controls">
      <div className="controls-sliders">
        <div className="control-row">
          <label className="control-label">
            <span>Rows</span>
            <span className="control-value">{rows}</span>
          </label>
          <input type="range" min={5} max={30} value={rows} onChange={e => onRowsChange(Number(e.target.value))} />
        </div>
        <div className="control-row">
          <label className="control-label">
            <span>Columns</span>
            <span className="control-value">{cols}</span>
          </label>
          <input type="range" min={5} max={30} value={cols} onChange={e => onColsChange(Number(e.target.value))} />
        </div>
        <div className="control-row">
          <label className="control-label">
            <span>Flood density</span>
            <span className="control-value">{Math.round(probability * 100)}%</span>
          </label>
          <input type="range" min={10} max={70} value={Math.round(probability * 100)} onChange={e => onProbabilityChange(Number(e.target.value) / 100)} />
        </div>
      </div>
      <div className="control-buttons">
        <button className="btn-secondary" onClick={onGenerate}>Generate</button>
        <button className="btn-primary" onClick={onDetect}>Detect Floods</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Controls.jsx
git commit -m "feat: add Controls component"
```

---

## Task 5: Grid component

**Files:**
- Create: `frontend/src/components/Grid.jsx`

Design rules applied: desaturated muted pastel zone colors (not saturated primaries), dry cells `#F7F6F3`, undetected flood cells `#D4D4D4`, `1px solid #EAEAEA` cell borders, 20px cells with smooth color transition.

- [ ] **Step 1: Create `frontend/src/components/Grid.jsx`**

```jsx
// Desaturated pastel zone colors — readable on white, never neon
const ZONE_COLORS = [
  "#93C5FD", // pale blue
  "#FCA5A5", // pale red
  "#86EFAC", // pale green
  "#FCD34D", // pale amber
  "#C4B5FD", // pale violet
  "#F9A8D4", // pale pink
  "#5EEAD4", // pale teal
  "#A3E635", // pale lime
  "#FDBA74", // pale orange
  "#67E8F9", // pale cyan
];

function getCellColor(row, col, grid, zones) {
  if (!grid[row] || grid[row][col] === 0) return "#F7F6F3";
  if (!zones || zones.length === 0) return "#D4D4D4";
  for (const zone of zones) {
    if (zone.cells.some(([r, c]) => r === row && c === col)) {
      return ZONE_COLORS[(zone.id - 1) % ZONE_COLORS.length];
    }
  }
  return "#D4D4D4";
}

export default function Grid({ grid, zones, onToggleCell }) {
  if (!grid || grid.length === 0) {
    return (
      <div className="grid-placeholder">
        <p>Set grid size and click Generate to begin</p>
      </div>
    );
  }

  return (
    <div className="grid-wrapper">
      <table className="grid-table">
        <tbody>
          {grid.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td
                  key={c}
                  className="grid-cell"
                  style={{ backgroundColor: getCellColor(r, c, grid, zones) }}
                  onClick={() => onToggleCell(r, c)}
                  title={`(${r}, ${c}) — ${cell === 1 ? "flooded" : "dry"}`}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Grid.jsx
git commit -m "feat: add Grid component with zone coloring"
```

---

## Task 6: Report component

**Files:**
- Create: `frontend/src/components/Report.jsx`

Design rules applied: table uses `border-bottom: 1px solid #EAEAEA` dividers (no box backgrounds), zone dot replaces color swatch, uppercase small-caps column headers, monospace font for numbers, largest zone gets pale red badge tag.

- [ ] **Step 1: Create `frontend/src/components/Report.jsx`**

```jsx
const ZONE_COLORS = [
  "#93C5FD", "#FCA5A5", "#86EFAC", "#FCD34D",
  "#C4B5FD", "#F9A8D4", "#5EEAD4", "#A3E635",
  "#FDBA74", "#67E8F9",
];

export default function Report({ zones, totalFlooded, totalCells, floodPercentage }) {
  if (!zones || zones.length === 0) return null;

  const maxSize = Math.max(...zones.map(z => z.size));

  return (
    <div className="report">
      <div className="report-header">
        <h2 className="report-title">Flood Area Report</h2>
        <span className="report-meta">{zones.length} zone{zones.length !== 1 ? "s" : ""} · {totalCells} cells total</span>
      </div>
      <table className="report-table">
        <thead>
          <tr>
            <th>Zone</th>
            <th>Area</th>
            <th>Coverage</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {zones.map(zone => (
            <tr key={zone.id}>
              <td>
                <span className="zone-dot" style={{ backgroundColor: ZONE_COLORS[(zone.id - 1) % ZONE_COLORS.length] }} />
                Zone {zone.id}
              </td>
              <td className="num">{zone.size} cells</td>
              <td className="num">{((zone.size / totalCells) * 100).toFixed(1)}%</td>
              <td>
                {zone.size === maxSize && (
                  <span className="badge-largest">largest</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="report-total">
            <td>Total flooded</td>
            <td className="num">{totalFlooded} cells</td>
            <td className="num">{floodPercentage}%</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Report.jsx
git commit -m "feat: add Report component with zone table"
```

---

## Task 7: Wire App.jsx

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Replace `frontend/src/App.jsx` entirely**

```jsx
import { useState } from "react";
import Controls from "./components/Controls";
import Grid from "./components/Grid";
import Report from "./components/Report";
import { generateGrid, detectZones } from "./api";
import "./App.css";

export default function App() {
  const [rows, setRows] = useState(15);
  const [cols, setCols] = useState(15);
  const [probability, setProbability] = useState(0.35);
  const [grid, setGrid] = useState([]);
  const [zones, setZones] = useState(null);
  const [detectResult, setDetectResult] = useState(null);

  async function handleGenerate() {
    const data = await generateGrid(rows, cols, probability);
    setGrid(data.grid);
    setZones(null);
    setDetectResult(null);
  }

  async function handleDetect() {
    if (!grid || grid.length === 0) return;
    const data = await detectZones(grid);
    setZones(data.zones);
    setDetectResult(data);
  }

  function handleToggleCell(r, c) {
    const newGrid = grid.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? (cell === 1 ? 0 : 1) : cell))
    );
    setGrid(newGrid);
    setZones(null);
    setDetectResult(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Flood Area Detection</h1>
        <p className="app-desc">BFS connected-component analysis on a binary city grid</p>
      </header>
      <Controls
        rows={rows}
        cols={cols}
        probability={probability}
        onRowsChange={setRows}
        onColsChange={setCols}
        onProbabilityChange={setProbability}
        onGenerate={handleGenerate}
        onDetect={handleDetect}
      />
      <Grid grid={grid} zones={zones} onToggleCell={handleToggleCell} />
      {detectResult && (
        <Report
          zones={detectResult.zones}
          totalFlooded={detectResult.total_flooded}
          totalCells={detectResult.total_cells}
          floodPercentage={detectResult.flood_percentage}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "feat: wire App.jsx with state and handlers"
```

---

## Task 8: Styles

**Files:**
- Modify: `frontend/src/App.css`
- Modify: `frontend/index.css`

Design system applied:
- Font: `'Geist Sans', 'Helvetica Neue', sans-serif` — never Inter or Roboto
- Canvas: `#FBFBFA` (warm off-white), cards `#FFFFFF`
- All borders: `1px solid #EAEAEA` — no heavy shadows
- Primary button: `#111111` bg, `#FFFFFF` text, `4px` radius, `scale(0.98)` on active
- Secondary button: `#FFFFFF` bg, `#111111` text, `1px solid #EAEAEA` border
- Monospace numbers in report using `'Geist Mono', 'SF Mono', monospace`
- Largest zone badge: pale red `#FDEBEC` bg, `#9F2F2D` text
- Cells: `20px × 20px`, `1px solid #EAEAEA`, smooth color transition

- [ ] **Step 1: Replace `frontend/index.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #FBFBFA;
  color: #111111;
  font-family: 'Geist', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: Replace `frontend/src/App.css`**

```css
/* Layout */
.app {
  max-width: 860px;
  margin: 0 auto;
  padding: 3rem 2rem 6rem;
}

/* Header */
.app-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #EAEAEA;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #111111;
  margin-bottom: 0.25rem;
}

.app-desc {
  font-size: 0.875rem;
  color: #787774;
  line-height: 1.5;
}

/* Controls */
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #FFFFFF;
  border: 1px solid #EAEAEA;
  border-radius: 8px;
}

.controls-sliders {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  flex: 1;
}

.control-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 140px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: #787774;
}

.control-value {
  font-family: 'Geist Mono', 'SF Mono', monospace;
  color: #111111;
  font-size: 0.8125rem;
}

input[type="range"] {
  width: 100%;
  accent-color: #111111;
  height: 2px;
}

.control-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.btn-primary {
  padding: 0.5rem 1.25rem;
  background: #111111;
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary:hover { background: #333333; }
.btn-primary:active { transform: scale(0.98); }

.btn-secondary {
  padding: 0.5rem 1.25rem;
  background: #FFFFFF;
  color: #111111;
  border: 1px solid #EAEAEA;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s;
}

.btn-secondary:hover { border-color: #111111; }
.btn-secondary:active { transform: scale(0.98); }

/* Grid */
.grid-wrapper {
  overflow: auto;
  margin-bottom: 2rem;
}

.grid-table {
  border-collapse: collapse;
}

.grid-cell {
  width: 20px;
  height: 20px;
  border: 1px solid #EAEAEA;
  cursor: pointer;
  transition: background-color 0.12s ease, opacity 0.1s;
}

.grid-cell:hover { opacity: 0.75; }

.grid-placeholder {
  padding: 4rem 2rem;
  text-align: center;
  color: #787774;
  background: #FFFFFF;
  border: 1px solid #EAEAEA;
  border-radius: 8px;
  margin-bottom: 2rem;
  font-size: 0.875rem;
}

/* Report */
.report {
  background: #FFFFFF;
  border: 1px solid #EAEAEA;
  border-radius: 8px;
  overflow: hidden;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #EAEAEA;
}

.report-title {
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.report-meta {
  font-size: 0.8125rem;
  color: #787774;
  font-family: 'Geist Mono', 'SF Mono', monospace;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
}

.report-table th {
  padding: 0.625rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #787774;
  border-bottom: 1px solid #EAEAEA;
  background: #FBFBFA;
}

.report-table td {
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  border-bottom: 1px solid #EAEAEA;
  vertical-align: middle;
}

.report-table tbody tr:last-child td { border-bottom: none; }

.zone-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;
  vertical-align: middle;
}

.num {
  font-family: 'Geist Mono', 'SF Mono', monospace;
  font-size: 0.8125rem;
}

.badge-largest {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: #FDEBEC;
  color: #9F2F2D;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 9999px;
}

.report-total td {
  font-weight: 600;
  background: #FBFBFA;
  border-top: 1px solid #EAEAEA;
  font-size: 0.875rem;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.css frontend/index.css
git commit -m "feat: apply minimalist design system to frontend"
```

---

## Task 9: End-to-end verification

- [ ] **Step 1: Start backend**

```bash
cd backend
uvicorn main:app --reload --port 8000
```

- [ ] **Step 2: Start frontend (new terminal)**

```bash
cd frontend
npm run dev
```

- [ ] **Step 3: Test full flow**

Open `http://localhost:5173` in browser.

Checklist:
- [ ] Page loads with title "Flood Area Detection System"
- [ ] Sliders work (rows, cols, flood density)
- [ ] "Generate Grid" → colored grid appears
- [ ] Cells are toggleable (click to flip)
- [ ] "Detect Floods" → each zone gets a distinct color
- [ ] Report table appears below with zone count, area, %
- [ ] Largest zone is marked with ⚠
- [ ] Changing sliders and regenerating clears the old zones

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete flood area detection system"
```
