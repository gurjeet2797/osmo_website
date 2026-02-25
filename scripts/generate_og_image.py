#!/usr/bin/env python3
"""Generate 1200x630 OG image: logo centered on pure black background."""
from pathlib import Path
from PIL import Image

ASSETS = Path(__file__).parent.parent / "assets"
LOGO = ASSETS / "osmo-logo.png"
OUT = ASSETS / "og-image.png"

W, H = 1200, 630
LOGO_SIZE = 400  # Logo will be scaled to fit within this

img = Image.new("RGB", (W, H), (0, 0, 0))
logo = Image.open(LOGO).convert("RGBA")
logo.thumbnail((LOGO_SIZE, LOGO_SIZE), Image.Resampling.LANCZOS)
x = (W - logo.width) // 2
y = (H - logo.height) // 2
img.paste(logo, (x, y), logo)
img.save(OUT, "PNG", optimize=True)
print(f"Created {OUT}")
