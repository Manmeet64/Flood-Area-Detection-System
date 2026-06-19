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
