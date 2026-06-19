const ZONE_COLORS = [
  "#93C5FD", "#FCA5A5", "#86EFAC", "#FCD34D",
  "#C4B5FD", "#F9A8D4", "#5EEAD4", "#A3E635",
  "#FDBA74", "#67E8F9",
];

const COL_WIDTHS = ["40%", "22%", "22%", "16%"];

export default function Report({ zones, totalFlooded, totalCells, floodPercentage }) {
  if (!zones || zones.length === 0) return null;

  const maxSize = Math.max(...zones.map(z => z.size));

  return (
    <div className="report">
      <div className="report-header">
        <h2 className="report-title">Flood Area Report</h2>
        <span className="report-meta">{zones.length} zone{zones.length !== 1 ? "s" : ""} · {totalCells} cells total</span>
      </div>

      {/* Fixed header */}
      <table className="report-table report-table-header">
        <colgroup>
          {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
        </colgroup>
        <thead>
          <tr>
            <th>Zone</th>
            <th>Area</th>
            <th>Coverage</th>
            <th></th>
          </tr>
        </thead>
      </table>

      {/* Scrollable body */}
      <div className="report-body-scroll">
        <table className="report-table">
          <colgroup>
            {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
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
        </table>
      </div>

      {/* Fixed footer total */}
      <table className="report-table report-table-footer">
        <colgroup>
          {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
        </colgroup>
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
