#!/usr/bin/env python3
"""
Extract the onboarding / authentication artwork from the reference screens.

The composite reference is the only source we have for the splash and onboarding
illustrations, so the character art is cropped from those screens and matted with
the same "flood fill from the outside" alpha channel used by extract_assets.py:
the flat pastel background becomes transparent while enclosed areas (faces,
flowers, clothing) stay opaque.

Run:  python3 scripts/extract_auth_assets.py
"""
from PIL import Image
import numpy as np
from scipy import ndimage
import os

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "..", "design", "reference")
OUT = os.path.join(HERE, "..", "public", "assets")
os.makedirs(OUT, exist_ok=True)

# Design-space screen size used by every crop below (the reference tiles are
# upscaled to 744 px wide, i.e. 1.907 px per css px for a 390 px board).
SCALE = 744 / 390


def load(name):
    return np.array(Image.open(os.path.join(REF, name)).convert("RGB")).astype(np.float64)


def matte(rgb, tol=24.0, feather=0.9):
    h, w, _ = rgb.shape
    t = max(1, min(h, w) // 10)
    ring = np.concatenate([
        rgb[:t, :].reshape(-1, 3), rgb[-t:, :].reshape(-1, 3),
        rgb[:, :t].reshape(-1, 3), rgb[:, -t:].reshape(-1, 3),
    ])
    bg = np.median(ring, axis=0)
    dist = np.abs(rgb - bg).sum(axis=2)
    bgish = dist < tol
    lab, n = ndimage.label(bgish)
    edge = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    edge.discard(0)
    outside = np.isin(lab, list(edge))
    alpha = np.where(outside, 0.0, 1.0)
    if feather:
        alpha = ndimage.gaussian_filter(alpha, feather)
        alpha = np.clip((alpha - 0.35) / 0.4, 0, 1)
    return alpha


def crop(name, box, out, tol=24.0, pad=4):
    """box is fractional (x0, y0, x1, y1) of the reference tile."""
    rgb = load(name)
    h, w, _ = rgb.shape
    x0, y0, x1, y1 = box[0] * w, box[1] * h, box[2] * w, box[3] * h
    x0, y0, x1, y1 = int(x0), int(y0), int(x1), int(y1)
    sub = rgb[max(0, y0 - pad):min(h, y1 + pad), max(0, x0 - pad):min(w, x1 + pad)]
    a = matte(sub, tol=tol)
    ys, xs = np.where(a > 0.35)
    if len(xs):
        sub = sub[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    out_arr = np.dstack([np.clip(sub, 0, 255), a * 255]).astype(np.uint8)
    Image.fromarray(out_arr, "RGBA").save(os.path.join(OUT, out), optimize=True)
    print(f"  {out:24s} {out_arr.shape[1]}x{out_arr.shape[0]}")


# fractional boxes measured off each reference screen
JOBS = [
    ("05_Splash.png",          (0.02, 0.485, 0.98, 0.795), "splash-hero.png"),
    ("05_Splash.png",          (0.32, 0.12, 0.71, 0.285), "splash-flower.png"),
    ("06_Onboarding_1.png",    (0.06, 0.055, 0.94, 0.435), "onboard-1-hero.png"),
    ("08_Onboarding_3.png",    (0.05, 0.13, 0.95, 0.50),  "onboard-3-hero.png"),
    ("09_Create_Account.png",  (0.20, 0.09, 0.62, 0.26),  "auth-girl-signup.png"),
    ("10_Login.png",           (0.19, 0.09, 0.66, 0.30),  "auth-girl-login.png"),
    ("11_Profile_Setup.png",   (0.20, 0.05, 0.62, 0.23),  "auth-girl-profile.png"),
    ("12_Goals_Setup.png",     (0.20, 0.05, 0.67, 0.23),  "auth-girl-goals.png"),
]

if __name__ == "__main__":
    for ref, box, out in JOBS:
        crop(ref, box, out)
    print("done")
