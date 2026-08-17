from pathlib import Path

from PIL import Image


project_root = Path(__file__).resolve().parents[1]
source = project_root / "assets" / "images" / "icon.png"
targets = [
    project_root / "assets" / "images" / "icon.png",
    project_root / "assets" / "images" / "splash-icon.png",
    project_root / "assets" / "images" / "favicon.png",
    project_root / "assets" / "images" / "android-icon-foreground.png",
]

with Image.open(source) as image:
    resized = image.convert("RGB").resize((1024, 1024), Image.Resampling.LANCZOS)
    compact = resized.quantize(colors=96, method=Image.Quantize.MEDIANCUT)
    for target in targets:
        compact.save(target, optimize=True)
