# Emotion + Face Recognition (Backend)

This backend is **FastAPI** + **OpenCV**. It exposes endpoints that your JS frontend can call by sending image frames (JPG/PNG).

## Setup

From the repo root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000/docs

## API

- `GET /health` → `{ ok: true }`
- `GET /users` → list registered usernames
- `POST /analyze` (multipart `file`) → face detection + emotion prediction
- `POST /register` (multipart `username`, `file`) → registers/overwrites user descriptor
- `POST /authenticate` (multipart `file`, optional `username`) → matches face against stored users

Notes:
- Face descriptors are stored at `backend/data/encodings.npz`.
- Emotion output tries EmotiEffLib (ONNX) first.
	- Default model: `enet_b0_8_best_vgaf` (8 classes).
	- Set `EMOTIEFF_MODEL_NAME` to any name returned by EmotiEffLib's `get_model_list()`.
	- If EmotiEffLib isn't installed (or its model download fails), it falls back to the FER+ ONNX model (8 classes) via `onnxruntime`.
		- First run may download the model (~34MB) into `backend/models/emotion-ferplus-8.onnx`.
		- Labels: `neutral`, `happiness`, `surprise`, `sadness`, `anger`, `disgust`, `fear`, `contempt`.
	- If both models can't be loaded, it falls back to a simple smile heuristic.
