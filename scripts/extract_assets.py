#!/usr/bin/env python3
"""
Asset extraction pipeline for the Myflo image-to-UI reconstruction.

The reference screenshots (design/reference/*.png) are the source of truth for the
artwork. Illustrations are cropped from those references and matted with a
"flood fill from the outside" alpha channel, which suits the flat line-art style:
the pastel background is removed while enclosed fills (faces, cream highlights)
stay opaque.

Run:  python3 scripts/extract_assets.py
"""
from PIL import Image
import numpy as np
from scipy import ndimage
import os

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "..", "design", "reference")
OUT = os.path.join(HERE, "..", "public", "assets")
os.makedirs(OUT, exist_ok=True)


def load(name):
    return np.array(Image.open(os.path.join(REF, name)).convert("RGB")).astype(np.float64)


def local_bg(rgb):
    """Median colour of the border ring — the flat surface the art sits on."""
    h, w, _ = rgb.shape
    t = max(1, min(h, w) // 10)
    ring = np.concatenate([
        rgb[:t, :].reshape(-1, 3), rgb[-t:, :].reshape(-1, 3),
        rgb[:, :t].reshape(-1, 3), rgb[:, -t:].reshape(-1, 3),
    ])
    return np.median(ring, axis=0)


def matte(rgb, tol=26.0, feather=0.9):
    """Alpha matte: background-like pixels connected to the border become transparent."""
    h, w, _ = rgb.shape
    bg = local_bg(rgb)
    dist = np.abs(rgb - bg).sum(axis=2)
    bgish = dist < tol
    lab, n = ndimage.label(bgish)
    edge_labels = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    edge_labels.discard(0)
    outside = np.isin(lab, list(edge_labels))
    alpha = np.where(outside, 0.0, 1.0)
    if feather:
        alpha = ndimage.gaussian_filter(alpha, feather)
        # re-solidify the interior so art doesn't go translucent
        alpha = np.clip((alpha - 0.35) / 0.4, 0, 1)
    return alpha


def save(name, rgb, alpha):
    out = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(os.path.join(OUT, name), optimize=True)
    print(f"  {name:26s} {rgb.shape[1]}x{rgb.shape[0]}  opaque={int((alpha > .5).sum())}")


def crop(im, box, name, tol=26.0, pad=0, trim=False, bg_fill=None):
    x0, y0, x1, y1 = box
    sub = im[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad]
    rgb = sub.copy()
    if bg_fill is not None:
        pass
    a = matte(rgb, tol=tol)
    if trim:
        ys, xs = np.where(a > 0.4)
        if len(xs):
            rgb = rgb[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
            a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    save(name, rgb, a)


def save_raw(name, rgb, alpha):
    """Un-matted RGBA (used for translucent line-art decorations)."""
    out = np.dstack([np.clip(rgb, 0, 255), np.clip(alpha, 0, 1) * 255]).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(os.path.join(OUT, name), optimize=True)
    print(f"  {name:26s} {rgb.shape[1]}x{rgb.shape[0]}")


def save_decor(im, box, name, floor=250.0, ceil=264.0):
    """Line-art decor: keep the drawing, lift alpha out of the paper tint."""
    x0, y0, x1, y1 = box
    sub = im[y0:y1, x0:x1]
    # "pinkness": how far the pixel is from the paper (paper is ~ (253,247,245))
    a = (255.0 - sub[:, :, 1]) / 14.0
    a = np.clip((a - 0.02) / 0.55, 0, 1)
    # restore a plausible line colour by un-premultiplying against the paper
    paper = np.array([253.0, 247.0, 245.0])
    solid = np.array([248.0, 168.0, 176.0])
    with np.errstate(divide="ignore", invalid="ignore"):
        c = np.where(a[..., None] > 0.05,
                     paper + (sub - paper) / np.maximum(a[..., None], 0.12),
                     solid)
    c = np.clip(c, 0, 255)
    save_raw(name, c, a)


def find_art(im, box, min_size=40, dark=520):
    """Split a region into art bounding boxes by dilating dark pixels."""
    x0, y0, x1, y1 = box
    sub = im[y0:y1, x0:x1]
    m = sub.sum(axis=2) < dark
    m = ndimage.binary_dilation(m, iterations=4)
    lab, n = ndimage.label(m)
    boxes = []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        ys, xs = sl
        w, h = xs.stop - xs.start, ys.stop - ys.start
        if w >= min_size and h >= min_size:
            boxes.append((x0 + xs.start, y0 + ys.start, x0 + xs.stop, y0 + ys.stop))
    return sorted(boxes, key=lambda b: (round(b[1] / 60), b[0]))


def sheet(paths, cols=8, cell=150, out="/tmp/asset_sheet.png"):
    rows = (len(paths) + cols - 1) // cols
    s = Image.new("RGBA", (cols * cell, rows * cell), (233, 230, 243, 255))
    for i, p in enumerate(paths):
        im = Image.open(p).convert("RGBA")
        im.thumbnail((cell - 10, cell - 10))
        s.alpha_composite(im, ((i % cols) * cell + (cell - im.width) // 2,
                               (i // cols) * cell + (cell - im.height) // 2))
    s.save(out)
    print(f"  sheet -> {out}")


if __name__ == "__main__":
    home, cal = load("01_Home_Dashboard.png"), load("02_Calendar.png")
    sym, his = load("03_Log_Symptoms.png"), load("04_Cycle_History.png")

    print("Home")
    crop(home, (497, 946, 726, 1206), "girl-hug.png", tol=22)
    crop(home, (98, 1296, 186, 1399), "quick-mood.png", trim=True, tol=24)
    crop(home, (325, 1293, 423, 1397), "quick-cramps.png", trim=True, tol=24)
    crop(home, (567, 1309, 658, 1385), "quick-medicine.png", trim=True, tol=26)

    print("Calendar")
    crop(cal, (88, 1128, 176, 1212), "ev-periods.png", trim=True, tol=24)
    crop(cal, (250, 1130, 322, 1210), "ev-mucus.png", trim=True, tol=24)
    crop(cal, (400, 1130, 476, 1210), "ev-ovulation.png", trim=True, tol=24)
    crop(cal, (556, 1132, 640, 1210), "ev-looming.png", trim=True, tol=24)
    crop(cal, (62, 1436, 112, 1490), "note-pencil.png", trim=True, tol=24)

    print("Log Symptoms — moods")
    moods = ["calm", "happy", "anxious", "sad", "depressed", "confused", "guilty", "sleepy"]
    boxes = find_art(sym, (40, 340, 720, 600), dark=480)
    for name, b in zip(moods, boxes):
        crop(sym, b, f"mood-{name}.png", trim=True, tol=24)

    print("Log Symptoms — physical")
    phys = ["cramps", "headache", "bloating", "acne",
            "nausea", "backpain", "fatigue", "foodcravings"]
    boxes = find_art(sym, (40, 700, 720, 960), dark=480)
    for name, b in zip(phys, boxes):
        crop(sym, b, f"sym-{name}.png", trim=True, tol=24)

    print("Log Symptoms — bleeding")
    for name, b in zip(["spotting", "light", "moderate", "heavy"], [
            (100, 1252, 168, 1332), (258, 1244, 326, 1332),
            (420, 1240, 490, 1332), (576, 1244, 646, 1332)]):
        crop(sym, b, f"bleed-{name}.png", trim=True, tol=30)

    print("Cycle History")
    crop(his, (490, 388, 730, 562), "girl-banner.png", tol=20)
    crop(his, (34, 1558, 192, 1752), "girl-insight.png", tol=20)

    print("Ring badges")
    crop(home, (556, 494, 602, 540), "drop-small.png", trim=True, tol=22)
    crop(home, (462, 786, 510, 834), "drop-note.png", trim=True, tol=22)

    print("Decor")
    save_decor(home, (396, 20, 744, 210), "decor-top-right.png")
    save_decor(home, (396, 212, 700, 400), "decor-flower.png")
    save_decor(home, (20, 740, 320, 964), "decor-bottom-left.png")
    save_decor(home, (30, 280, 160, 380), "decor-sprig.png")
    save_decor(cal, (470, 12, 744, 240), "decor-cal.png")
    save_decor(sym, (470, 12, 744, 230), "decor-sym.png")
    save_decor(his, (470, 12, 744, 210), "decor-his.png")

    print()
    sheet(sorted(os.path.join(OUT, f) for f in os.listdir(OUT) if f.endswith(".png")))
