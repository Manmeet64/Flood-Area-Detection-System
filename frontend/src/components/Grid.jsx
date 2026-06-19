const ZONE_COLORS = [
  "#93C5FD",
  "#FCA5A5",
  "#86EFAC",
  "#FCD34D",
  "#C4B5FD",
  "#F9A8D4",
  "#5EEAD4",
  "#A3E635",
  "#FDBA74",
  "#67E8F9",
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
