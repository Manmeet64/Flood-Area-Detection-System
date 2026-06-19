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
