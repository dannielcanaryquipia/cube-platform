"""Generate EAS-ready Layer by Layer icons from the website favicon mark."""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1] / "assets" / "images"
SIZE = 1024
BG = (31, 42, 55, 255)  # #1f2a37
CREAM = (245, 243, 238, 255)  # #f5f3ee
YELLOW = (244, 196, 48, 255)  # #f4c430
GREEN = (58, 167, 109, 255)  # #3aa76d
ORANGE = (232, 116, 59, 255)  # #e8743b
WHITE = (242, 242, 242, 255)  # #f2f2f2
INK = (28, 35, 45, 255)

# Website favicon.svg sticker layout in a 32x32 viewBox.
CELLS = [
    (5.0, 5.0, YELLOW),
    (12.75, 5.0, YELLOW),
    (20.5, 5.0, YELLOW),
    (5.0, 12.75, GREEN),
    (12.75, 12.75, GREEN),
    (20.5, 12.75, ORANGE),
    (5.0, 20.5, WHITE),
    (12.75, 20.5, WHITE),
    (20.5, 20.5, WHITE),
]
CELL = 6.5
CELL_RX = 1.5
VIEW = 32.0


def draw_mark(img: Image.Image, *, pad: float, fill_plate: tuple[int, int, int, int] | None, mono: bool = False):
    draw = ImageDraw.Draw(img)
    inner = SIZE - pad * 2
    scale = inner / VIEW
    ox, oy = pad, pad
    if fill_plate:
        r = 7.0 * scale
        draw.rounded_rectangle([ox, oy, ox + inner, oy + inner], radius=r, fill=fill_plate)
    for x, y, color in CELLS:
        left = ox + x * scale
        top = oy + y * scale
        right = left + CELL * scale
        bottom = top + CELL * scale
        rx = CELL_RX * scale
        draw.rounded_rectangle([left, top, right, bottom], radius=rx, fill=WHITE if mono else color)


def save(im: Image.Image, name: str):
    path = ROOT / name
    im.save(path, "PNG", optimize=True)
    print(f"wrote {path.name} {im.size} {im.mode}")


def main():
    ROOT.mkdir(parents=True, exist_ok=True)

    # iOS / generic: full-bleed dark plate, mark inset so the OS mask keeps all stickers.
    icon = Image.new("RGBA", (SIZE, SIZE), BG)
    draw_mark(icon, pad=118, fill_plate=None, mono=False)
    # Flatten to opaque RGB for store icon (no transparent pixels).
    rgb = Image.new("RGB", (SIZE, SIZE), BG[:3])
    rgb.paste(icon, mask=icon.split()[-1])
    rgb.save(ROOT / "icon.png", "PNG", optimize=True)
    print("wrote icon.png", rgb.size, rgb.mode)

    # Android adaptive foreground: transparent, content inside the 66% safe zone.
    fg = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw_mark(fg, pad=210, fill_plate=None, mono=False)
    save(fg, "android-icon-foreground.png")

    bg = Image.new("RGB", (SIZE, SIZE), BG[:3])
    bg.save(ROOT / "android-icon-background.png", "PNG", optimize=True)
    print("wrote android-icon-background.png", bg.size, bg.mode)

    mono = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw_mark(mono, pad=210, fill_plate=None, mono=True)
    save(mono, "android-icon-monochrome.png")

    # Splash (light): dark plate on transparent so cream launch color shows around it.
    splash = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw_mark(splash, pad=160, fill_plate=BG, mono=False)
    save(splash, "splash-icon.png")

    # Splash (dark): stickers only, so they sit on the dark launch color.
    splash_dark = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw_mark(splash_dark, pad=210, fill_plate=None, mono=False)
    save(splash_dark, "splash-icon-dark.png")

    fav = rgb.resize((64, 64), Image.Resampling.LANCZOS)
    fav.save(ROOT / "favicon.png", "PNG", optimize=True)
    print("wrote favicon.png", fav.size, fav.mode)


if __name__ == "__main__":
    main()
