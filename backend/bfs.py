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
