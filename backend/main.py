from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np

from face_recog import (
    analyze_frame,
    authenticate_user_from_frame,
    load_registered_encodings,
    register_user_from_frame,
)


app = FastAPI(title="Emotion + Face Recognition API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _bytes_to_bgr(contents: bytes) -> np.ndarray:
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image; ensure it's a valid JPG/PNG")
    return img


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/")
def root():
    return {
        "message": "Backend is running. Visit /docs for Swagger UI.",
        "endpoints": [
            "GET /health",
            "GET /users",
            "POST /analyze",
            "POST /register",
            "POST /authenticate",
        ],
    }


@app.get("/users")
def list_users():
    encodings = load_registered_encodings()
    return {"users": sorted(encodings.keys())}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    contents = await file.read()
    frame_bgr = _bytes_to_bgr(contents)
    return analyze_frame(frame_bgr)


@app.post("/register")
async def register(username: str = Form(...), file: UploadFile = File(...)):
    contents = await file.read()
    frame_bgr = _bytes_to_bgr(contents)
    return register_user_from_frame(username=username, frame_bgr=frame_bgr)


@app.post("/authenticate")
async def authenticate(
    file: UploadFile = File(...),
    username: Optional[str] = Form(None),
):
    contents = await file.read()
    frame_bgr = _bytes_to_bgr(contents)
    return authenticate_user_from_frame(frame_bgr=frame_bgr, username=username)


# Backwards-compatible alias with your original endpoint name
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    return await analyze(file=file)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)