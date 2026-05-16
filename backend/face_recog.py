import os
import math
import threading
from typing import Dict, Optional

import urllib.request

import cv2
import numpy as np


_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
_ENCODINGS_PATH = os.path.join(_DATA_DIR, "encodings.npz")
_LOCK = threading.Lock()

_MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
_EMOTION_MODEL_PATH = os.path.join(_MODEL_DIR, "emotion-ferplus-8.onnx")
_EMOTION_MODEL_URL = (
    "https://github.com/onnx/models/raw/main/validated/vision/body_analysis/emotion_ferplus/model/emotion-ferplus-8.onnx"
)
_EMOTION_LABELS = [
    "neutral",
    "happiness",
    "surprise",
    "sadness",
    "anger",
    "disgust",
    "fear",
    "contempt",
]

_EMOTION_SESSION = None
_EMOTION_SESSION_LOCK = threading.Lock()

_EMOTIEFF_RECOGNIZER = None
_EMOTIEFF_RECOGNIZER_LOCK = threading.Lock()

_AUTH_THRESHOLD = 0.35


def open_camera(index: int = 0) -> cv2.VideoCapture:
    cap = cv2.VideoCapture(index)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open camera at index {index}")
    return cap


def load_registered_encodings() -> Dict[str, np.ndarray]:
    """Load stored face descriptors.

    Returns a mapping: username -> descriptor vector (float32).
    """
    os.makedirs(_DATA_DIR, exist_ok=True)

    if not os.path.exists(_ENCODINGS_PATH):
        return {}

    data = np.load(_ENCODINGS_PATH, allow_pickle=True)
    usernames = data.get("usernames")
    descriptors = data.get("descriptors")

    if usernames is None or descriptors is None:
        return {}

    result: Dict[str, np.ndarray] = {}
    for username, descriptor in zip(usernames.tolist(), descriptors):
        if isinstance(username, str) and descriptor is not None:
            result[username] = np.asarray(descriptor, dtype=np.float32)
    return result


def analyze_frame(frame_bgr: np.ndarray) -> Dict:
    """Analyze a BGR frame.

    Current implementation:
    - Detects faces via Haar cascade.
    - Returns a placeholder emotion ("neutral") plus basic face stats.

    You can later replace `predict_emotion(face_crop_bgr)` with a real model.
    """
    frame_h, frame_w = frame_bgr.shape[:2]
    face_boxes = _detect_faces(frame_bgr)

    per_face = []
    for (x, y, w, h) in face_boxes:
        face_crop = _crop_face_square(frame_bgr, int(x), int(y), int(w), int(h), pad_ratio=0.25)
        emotion, scores, source = _predict_emotion(face_crop)
        per_face.append(
            {
                "box": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)},
                "emotion": emotion,
                "emotion_scores": scores,
                "emotion_source": source,
            }
        )

    dominant_emotion = "neutral"
    dominant_scores = None
    dominant_source = None
    if per_face:
        # simplest: use first face's emotion
        dominant_emotion = per_face[0]["emotion"]
        dominant_scores = per_face[0].get("emotion_scores")
        dominant_source = per_face[0].get("emotion_source")

    return {
        "frame": {"w": int(frame_w), "h": int(frame_h)},
        "faces": per_face,
        "num_faces": len(per_face),
        "emotion": dominant_emotion,
        "emotion_scores": dominant_scores,
        "emotion_source": dominant_source,
    }


def register_user_from_frame(username: str, frame_bgr: np.ndarray) -> Dict:
    """Register a user from a single frame.

    Stores a single descriptor per user (overwrites existing).
    """
    if not username or not username.strip():
        raise ValueError("username is required")

    descriptor = _extract_face_descriptor(frame_bgr)
    if descriptor is None:
        return {"ok": False, "reason": "no_face_detected"}

    with _LOCK:
        encodings = load_registered_encodings()
        encodings[username] = descriptor
        _save_registered_encodings(encodings)

    return {"ok": True, "username": username}


def authenticate_user_from_frame(
    frame_bgr: np.ndarray,
    username: Optional[str] = None,
) -> Dict:
    """Authenticate a frame against stored encodings.

    Similarity is cosine distance (lower is better). The threshold is a heuristic.
    """
    probe = _extract_face_descriptor(frame_bgr)
    if probe is None:
        return {"ok": False, "reason": "no_face_detected"}

    with _LOCK:
        encodings = load_registered_encodings()

    if not encodings:
        return {"ok": False, "reason": "no_registered_users"}

    candidates = encodings
    if username is not None:
        if username not in encodings:
            return {"ok": False, "reason": "unknown_user"}
        candidates = {username: encodings[username]}

    best_user = None
    best_dist = None

    for u, desc in candidates.items():
        dist = _cosine_distance(probe, desc)
        if best_dist is None or dist < best_dist:
            best_dist = dist
            best_user = u

    assert best_user is not None and best_dist is not None

    threshold = _AUTH_THRESHOLD

    return {
        "ok": best_dist <= threshold,
        "matched_user": best_user,
        "distance": float(best_dist),
        "threshold": float(threshold),
    }


def _save_registered_encodings(encodings: Dict[str, np.ndarray]) -> None:
    os.makedirs(_DATA_DIR, exist_ok=True)
    usernames = np.array(list(encodings.keys()), dtype=object)
    descriptors = np.stack([encodings[u].astype(np.float32) for u in encodings.keys()])
    np.savez_compressed(_ENCODINGS_PATH, usernames=usernames, descriptors=descriptors)


def _detect_faces(frame_bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)

    cascade = _get_haar_face_cascade()
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
    return faces


def _extract_face_descriptor(frame_bgr: np.ndarray) -> Optional[np.ndarray]:
    faces = _detect_faces(frame_bgr)
    if faces is None or len(faces) == 0:
        return None

    # choose largest face
    x, y, w, h = max(faces, key=lambda b: int(b[2]) * int(b[3]))
    face = frame_bgr[y : y + h, x : x + w]

    # simple, dependency-free descriptor: normalized grayscale pixels at fixed size
    gray = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, (64, 64), interpolation=cv2.INTER_AREA)

    vec = gray.astype(np.float32).reshape(-1)
    norm = float(np.linalg.norm(vec))
    if norm <= 1e-8:
        return None
    return vec / norm


def _cosine_distance(a: np.ndarray, b: np.ndarray) -> float:
    a = a.astype(np.float32)
    b = b.astype(np.float32)
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denom <= 1e-8:
        return 1.0
    sim = float(np.dot(a, b) / denom)
    # clamp numeric drift
    sim = max(-1.0, min(1.0, sim))
    return float(1.0 - sim)


def _predict_emotion(face_crop_bgr: np.ndarray) -> tuple[str, Optional[Dict[str, float]], str]:
    """Return (label, scores, source).

    - label: top predicted emotion label
    - scores: dict label->probability (may be None if using heuristic)
    - source: "onnx_emotiefflib", "onnx_ferplus", or "smile_heuristic"
    """

    recognizer = _get_emotieff_recognizer()
    if recognizer is not None:
        try:
            probs = _infer_emotion_probs_emotiefflib(recognizer, face_crop_bgr)
            best = max(probs.items(), key=lambda kv: kv[1])[0]
            return best, probs, "onnx_emotiefflib"
        except Exception:
            # If inference fails for any reason, fall back to FER+.
            pass

    session = _get_emotion_session()
    if session is not None:
        try:
            probs = _infer_emotion_probs_ferplus(session, face_crop_bgr)
            best = max(probs.items(), key=lambda kv: kv[1])[0]
            return best, probs, "onnx_ferplus"
        except Exception:
            # If inference fails for any reason, fall back to heuristic.
            pass

    label = _predict_emotion_smile(face_crop_bgr)
    return label, None, "smile_heuristic"


def _predict_emotion_smile(face_crop_bgr: np.ndarray) -> str:
    gray = cv2.cvtColor(face_crop_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    try:
        smile_cascade = _get_haar_smile_cascade()
    except Exception:
        return "neutral"

    smiles = smile_cascade.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=20,
        minSize=(20, 20),
    )

    if smiles is not None and len(smiles) > 0:
        # keep label names aligned with FER+ labels where possible
        return "happiness"

    return "neutral"


def _get_emotieff_recognizer():
    """Create and cache an EmotiEffLib ONNX recognizer.

    Returns None if EmotiEffLib (or its ONNX dependencies) aren't installed.
    """

    global _EMOTIEFF_RECOGNIZER

    with _EMOTIEFF_RECOGNIZER_LOCK:
        if _EMOTIEFF_RECOGNIZER is not None:
            return _EMOTIEFF_RECOGNIZER

        try:
            from emotiefflib.facial_analysis import EmotiEffLibRecognizer, get_model_list
        except Exception:
            return None

        model_name = os.getenv("EMOTIEFF_MODEL_NAME") or "enet_b0_8_best_vgaf"
        try:
            available = get_model_list()
            if isinstance(available, list) and available:
                if model_name not in available:
                    model_name = available[0]
        except Exception:
            pass

        try:
            _EMOTIEFF_RECOGNIZER = EmotiEffLibRecognizer(
                engine="onnx",
                model_name=model_name,
                device="cpu",
            )
        except Exception:
            return None

        return _EMOTIEFF_RECOGNIZER


def _infer_emotion_probs_emotiefflib(recognizer, face_crop_bgr: np.ndarray) -> Dict[str, float]:
    # EmotiEffLib expects color images; use RGB (not BGR).
    face_rgb = cv2.cvtColor(face_crop_bgr, cv2.COLOR_BGR2RGB)

    # Request logits so we can build stable probability outputs.
    emotions, scores = recognizer.predict_emotions(face_rgb, logits=True)
    scores = np.asarray(scores, dtype=np.float32)
    if scores.ndim >= 2:
        scores = scores[0]

    if bool(getattr(recognizer, "is_mtl", False)):
        # Multi-task models append 2 regression values (e.g., valence/arousal).
        if scores.shape[0] > 2:
            scores = scores[:-2]

    probs = _softmax(scores)

    idx_to_class = getattr(recognizer, "idx_to_emotion_class", None)
    if not isinstance(idx_to_class, dict) or not idx_to_class:
        # Fallback: if we can't map indices, at least return the top label.
        top = "neutral"
        if emotions:
            top = _normalize_emotion_label(str(emotions[0]))
        return {top: 1.0}

    out: Dict[str, float] = {}
    for idx, name in idx_to_class.items():
        if idx < 0 or idx >= probs.shape[0]:
            continue
        out[_normalize_emotion_label(str(name))] = float(probs[idx])

    # Ensure we always include the predicted label.
    if emotions:
        pred = _normalize_emotion_label(str(emotions[0]))
        if pred not in out:
            out[pred] = float(np.max(probs))

    return out


def _normalize_emotion_label(label: str) -> str:
    s = (label or "").strip().lower()
    mapping = {
        "happy": "happiness",
        "happiness": "happiness",
        "sad": "sadness",
        "sadness": "sadness",
        "angry": "anger",
        "anger": "anger",
        "neutral": "neutral",
        "surprised": "surprise",
        "surprise": "surprise",
        "disgust": "disgust",
        "fear": "fear",
        "contempt": "contempt",
    }
    return mapping.get(s, s or "neutral")


def _get_emotion_session():
    global _EMOTION_SESSION

    with _EMOTION_SESSION_LOCK:
        if _EMOTION_SESSION is not None:
            return _EMOTION_SESSION

        try:
            import onnxruntime as ort
        except Exception:
            return None

        os.makedirs(_MODEL_DIR, exist_ok=True)

        if not os.path.exists(_EMOTION_MODEL_PATH):
            try:
                _download_file(_EMOTION_MODEL_URL, _EMOTION_MODEL_PATH)
            except Exception:
                return None

        try:
            # CPU execution provider
            sess = ort.InferenceSession(_EMOTION_MODEL_PATH, providers=["CPUExecutionProvider"])
        except Exception:
            return None

        _EMOTION_SESSION = sess
        return _EMOTION_SESSION


def _download_file(url: str, dest_path: str) -> None:
    tmp_path = dest_path + ".tmp"
    if os.path.exists(tmp_path):
        try:
            os.remove(tmp_path)
        except Exception:
            pass

    urllib.request.urlretrieve(url, tmp_path)
    os.replace(tmp_path, dest_path)


def _infer_emotion_probs_ferplus(session, face_crop_bgr: np.ndarray) -> Dict[str, float]:
    # Preprocess: Nx1x64x64 grayscale
    gray = cv2.cvtColor(face_crop_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    gray = cv2.resize(gray, (64, 64), interpolation=cv2.INTER_AREA)

    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name

    # FER+ variants in the wild differ by normalization.
    # We try two common modes and pick the output with the highest max probability.
    x_a = _preprocess_ferplus(gray, mode="raw_0_255")
    x_b = _preprocess_ferplus(gray, mode="centered")

    probs_a = _softmax(
        np.asarray(session.run([output_name], {input_name: x_a})[0], dtype=np.float32).reshape(-1)
    )
    probs_b = _softmax(
        np.asarray(session.run([output_name], {input_name: x_b})[0], dtype=np.float32).reshape(-1)
    )

    best = probs_a
    if float(np.max(probs_b)) > float(np.max(probs_a)):
        best = probs_b

    return {label: float(prob) for label, prob in zip(_EMOTION_LABELS, best)}


def _softmax(scores: np.ndarray) -> np.ndarray:
    scores = scores.astype(np.float32)
    scores = scores - np.max(scores)
    exp = np.exp(scores)
    denom = np.sum(exp)
    if float(denom) <= 1e-8:
        return np.full_like(scores, 1.0 / scores.size)
    return exp / denom


def _preprocess_ferplus(gray_64: np.ndarray, mode: str) -> np.ndarray:
    x = gray_64.astype(np.float32)

    if mode == "raw_0_255":
        # as-is (0..255)
        pass
    elif mode == "centered":
        # common normalization for CNNs
        x = (x - 127.5) / 127.5
    else:
        raise ValueError(f"Unknown preprocess mode: {mode}")

    return x.reshape(1, 1, 64, 64)


def _crop_face_square(
    frame_bgr: np.ndarray, x: int, y: int, w: int, h: int, pad_ratio: float = 0.25
) -> np.ndarray:
    """Crop a padded square region around a face box."""
    fh, fw = frame_bgr.shape[:2]

    cx = x + w / 2.0
    cy = y + h / 2.0

    side = float(max(w, h)) * (1.0 + 2.0 * float(pad_ratio))
    half = side / 2.0

    x0 = int(math.floor(cx - half))
    y0 = int(math.floor(cy - half))
    x1 = int(math.ceil(cx + half))
    y1 = int(math.ceil(cy + half))

    x0 = max(0, min(fw - 1, x0))
    y0 = max(0, min(fh - 1, y0))
    x1 = max(1, min(fw, x1))
    y1 = max(1, min(fh, y1))

    crop = frame_bgr[y0:y1, x0:x1]
    if crop.size == 0:
        return frame_bgr[y : y + h, x : x + w]
    return crop


def _get_haar_smile_cascade() -> cv2.CascadeClassifier:
    cascade_path = os.path.join(getattr(cv2.data, "haarcascades", ""), "haarcascade_smile.xml")
    if not cascade_path or not os.path.exists(cascade_path):
        # If this file isn't present in the OpenCV build, fall back to neutral.
        # We signal this by raising and catching in caller would be noisy, so we raise here
        # only if it's unexpectedly missing from a standard install.
        raise RuntimeError(
            "OpenCV haarcascade_smile.xml not found. Ensure opencv-python is installed correctly."
        )

    cascade = cv2.CascadeClassifier(cascade_path)
    if cascade.empty():
        raise RuntimeError("Failed to load smile Haar cascade classifier")
    return cascade


def _get_haar_face_cascade() -> cv2.CascadeClassifier:
    # Prefer OpenCV's built-in haarcascade path.
    cascade_path = os.path.join(getattr(cv2.data, "haarcascades", ""), "haarcascade_frontalface_default.xml")
    if not cascade_path or not os.path.exists(cascade_path):
        raise RuntimeError(
            "OpenCV haarcascade not found. Ensure opencv-python is installed correctly."
        )

    cascade = cv2.CascadeClassifier(cascade_path)
    if cascade.empty():
        raise RuntimeError("Failed to load Haar cascade classifier")
    return cascade
