# Simple Frontend Demo (Plain JS)

This is a tiny webcam UI that calls the FastAPI backend.

## Run backend

From `backend/`:

```powershell
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

If port `8000` is already in use, run on `8001` instead:

```powershell
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

## Run frontend

You must open it via a local server (not `file://`) for webcam permissions.

From `frontend/`:

```powershell
python -m http.server 5173
```

Open:
- http://127.0.0.1:5173

The frontend auto-detects the backend on ports `8000` then `8001`, and calls:
- `POST http://127.0.0.1:8000/analyze`
- `POST http://127.0.0.1:8000/register`
- `POST http://127.0.0.1:8000/authenticate`
