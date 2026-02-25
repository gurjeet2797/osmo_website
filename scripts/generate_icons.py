#!/usr/bin/env python3
"""Generate favicon, apple-touch-icon, and og-image from Osmo logo."""
from pathlib import Path
from PIL import Image

ASSETS = Path(__file__).parent.parent / "assets"
SRC = Path("/Users/gurjeetsingh/.cursor/projects/Users-gurjeetsingh-Projects/assets/Osmo_logo-c2a68dd8-562e-4816-84ec-5bd5097f1028.png")

if not SRC.exists():
    print(f"Source not found: {SRC}")
    exit(1)

logo = Image.open(SRC).convert("RGBA")

# 1. osmo-logo.png — keep original or resize to 1024 for consistency
logo_1024 = logo.resize((1024, 1024), Image.Resampling.LANCZOS)
logo_1024.save(ASSETS / "osmo-logo.png", "PNG", optimize=True)
print(f"Created {ASSETS / 'osmo-logo.png'}")

# 2. favicon.png — 32x32
favicon_32 = logo.resize((32, 32), Image.Resampling.LANCZOS)
favicon_32.save(ASSETS / "favicon.png", "PNG", optimize=True)
print(f"Created {ASSETS / 'favicon.png'} (32x32)")

# 3. favicon.ico — 32x32 (browser standard)
favicon_32.save(ASSETS / "favicon.ico", format="ICO")
print(f"Created {ASSETS / 'favicon.ico'} (32x32)")

# 4. apple-touch-icon.png — 180x180 for iOS home screen
apple_icon = logo.resize((180, 180), Image.Resampling.LANCZOS)
apple_icon.save(ASSETS / "apple-touch-icon.png", "PNG", optimize=True)
print(f"Created {ASSETS / 'apple-touch-icon.png'} (180x180)")

# 5. og-image.png — 1200x630, logo centered on black
W, H = 1200, 630
img = Image.new("RGB", (W, H), (0, 0, 0))
logo_scaled = logo.resize((400, 400), Image.Resampling.LANCZOS)
x = (W - logo_scaled.width) // 2
y = (H - logo_scaled.height) // 2
img.paste(logo_scaled, (x, y), logo_scaled)
img.save(ASSETS / "og-image.png", "PNG", optimize=True)
print(f"Created {ASSETS / 'og-image.png'} (1200x630)")

print("Done.")
