"""Gera dist/manna.html (conteúdo do app) e dist/index.html (página para abrir no navegador)."""
import json
import shutil
from pathlib import Path

from PIL import Image

root = Path(__file__).parent
page = (root / "src/page.html").read_text(encoding="utf-8")
partes = ["data.js", "art.js", "core.js", "catalog.js", "content.js", "game.js", "screens2.js", "screens.js"]
js = "\n".join((root / "src" / nome).read_text(encoding="utf-8") for nome in partes)

mani = {}
pasta = root / "public/mani"
for arq in sorted(pasta.glob("mani-*@2x.png")):
    pose = arq.name[len("mani-"):-len("@2x.png")]
    with Image.open(arq) as im:
        mani[pose] = [im.size[0], im.size[1]]
js = "const MANI_FILES = " + json.dumps(mani, ensure_ascii=False) + ";\n" + js
page = page.replace("/*JS*/", js)

dist = root / "dist"
dist.mkdir(exist_ok=True)
(dist / "manna.html").write_text(page, encoding="utf-8")
full = (
    "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n"
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n"
    "<meta name=\"theme-color\" content=\"#0F1B3D\">\n"
    "<style>body{margin:0}[hidden]{display:none!important}img{max-width:100%}"
    ":root{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}</style>\n"
    "</head>\n<body>\n" + page + "\n</body>\n</html>\n"
)
(dist / "index.html").write_text(full, encoding="utf-8")
shutil.copy(root / "public/blivre.js", dist / "blivre.js")
shutil.copytree(pasta, dist / "mani", dirs_exist_ok=True)
print("ok", len(full), "poses", ",".join(mani))
