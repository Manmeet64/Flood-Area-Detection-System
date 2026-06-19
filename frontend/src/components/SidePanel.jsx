const ZONE_COLORS = [
  "#93C5FD", "#FCA5A5", "#86EFAC", "#FCD34D",
  "#C4B5FD", "#F9A8D4", "#5EEAD4", "#A3E635",
  "#FDBA74", "#67E8F9",
];

export default function SidePanel({ detectResult, largestZone, isAnimating }) {
  if (!detectResult && !isAnimating) {
    return (
      <div className="side-panel side-panel-empty">
        <p>Run detection to see zone statistics</p>
      </div>
    );
  }

  if (isAnimating) {
    return (
      <div className="side-panel side-panel-empty">
        <p className="side-animating">BFS running…</p>
      </div>
    );
  }

  const { zones, total_flooded, total_cells, flood_percentage } = detectResult;
  const largestColor = largestZone
    ? ZONE_COLORS[(largestZone.id - 1) % ZONE_COLORS.length]
    : "#93C5FD";

  return (
    <div className="side-panel">
      {/* Summary stats */}
      <div className="side-section">
        <p className="side-label">Total zones</p>
        <p className="side-value">{zones.length}</p>
      </div>
      <div className="side-divider" />
      <div className="side-section">
        <p className="side-label">Flooded cells</p>
        <p className="side-value">{total_flooded} <span className="side-unit">/ {total_cells}</span></p>
      </div>
      <div className="side-divider" />
      <div className="side-section">
        <p className="side-label">Flood coverage</p>
        <p className="side-value">{flood_percentage}<span className="side-unit">%</span></p>
      </div>

      {/* Largest zone card */}
      {largestZone && (
        <>
          <div className="side-divider" />
          <div className="side-largest" style={{ borderLeftColor: largestColor }}>
            <p className="side-largest-label">Largest zone</p>
            <div className="side-largest-row">
              <span className="zone-dot" style={{ backgroundColor: largestColor }} />
              <span className="side-largest-name">Zone {largestZone.id}</span>
            </div>
            <p className="side-largest-stat">{largestZone.size} cells</p>
            <p className="side-largest-stat">
              {((largestZone.size / total_cells) * 100).toFixed(1)}% of grid
            </p>
          </div>
        </>
      )}
    </div>
  );
}
