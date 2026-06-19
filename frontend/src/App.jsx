import { useState, useRef } from "react";
import Controls from "./components/Controls";
import Grid from "./components/Grid";
import Report from "./components/Report";
import SidePanel from "./components/SidePanel";
import { generateGrid, detectZones } from "./api";
import "./App.css";

export default function App() {
  const [rows, setRows] = useState(15);
  const [cols, setCols] = useState(15);
  const animationSpeed = 30;
  const [grid, setGrid] = useState([]);
  const [detectResult, setDetectResult] = useState(null);
  const [visibleZones, setVisibleZones] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutsRef = useRef([]);

  function clearAnimation() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }

  async function handleGenerate() {
    clearAnimation();
    const data = await generateGrid(rows, cols, 0.35);
    setGrid(data.grid);
    setVisibleZones(null);
    setDetectResult(null);
    setIsAnimating(false);
  }

  async function handleDetect() {
    if (!grid || grid.length === 0) return;
    clearAnimation();
    setVisibleZones(null);
    setIsAnimating(true);

    const data = await detectZones(grid);
    setDetectResult(data);

    // Build flat list of {zoneId, cell} steps in BFS order across all zones
    const steps = [];
    for (const zone of data.zones) {
      for (const cell of zone.cells) {
        steps.push({ zoneId: zone.id, cell });
      }
    }

    // Replay steps one by one, revealing cells progressively
    const revealed = {}; // zoneId -> cells[]
    steps.forEach((step, i) => {
      const t = setTimeout(() => {
        revealed[step.zoneId] = [...(revealed[step.zoneId] || []), step.cell];
        const snapshot = data.zones.map(z => ({
          ...z,
          cells: revealed[z.id] || [],
        }));
        setVisibleZones(snapshot);
        if (i === steps.length - 1) setIsAnimating(false);
      }, i * animationSpeed);
      timeoutsRef.current.push(t);
    });
  }

  function handleToggleCell(r, c) {
    if (isAnimating) return;
    const newGrid = grid.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? (cell === 1 ? 0 : 1) : cell))
    );
    setGrid(newGrid);
    setVisibleZones(null);
    setDetectResult(null);
  }

  const largestZone = detectResult?.zones?.length
    ? detectResult.zones.reduce((a, b) => (a.size > b.size ? a : b))
    : null;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Flood Area Detection</h1>
        <p className="app-desc">BFS connected-component analysis on a binary city grid</p>
      </header>

      <Controls
        rows={rows}
        cols={cols}
        isAnimating={isAnimating}
        onRowsChange={setRows}
        onColsChange={setCols}
        onGenerate={handleGenerate}
        onDetect={handleDetect}
      />

      <div className="dashboard">
        <div className="dashboard-main">
          <Grid grid={grid} zones={visibleZones} onToggleCell={handleToggleCell} />
        </div>
        <div className="dashboard-side">
          <SidePanel
            detectResult={detectResult}
            largestZone={largestZone}
            isAnimating={isAnimating}
          />
        </div>
      </div>

      {detectResult && !isAnimating && (
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
