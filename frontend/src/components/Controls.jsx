export default function Controls({
  rows, cols, isAnimating,
  onRowsChange, onColsChange,
  onGenerate, onDetect
}) {
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
      </div>
      <div className="control-buttons">
        <button className="btn-secondary" onClick={onGenerate} disabled={isAnimating}>Generate</button>
        <button className="btn-primary" onClick={onDetect} disabled={isAnimating}>
          {isAnimating ? "Detecting…" : "Detect Floods"}
        </button>
      </div>
    </div>
  );
}
