"""Gera dist/manna.html (conteúdo do Artifact) e index.html (página completa para abrir no navegador)."""
from pathlib import Path
root = Path(__file__).parent
page = (root / "src/page.html").read_text()
js = "\n".join((root / "src" / f).read_text() for f in ["data.js", "art.js", "core.js", "catalog.js", "content.js", "game.js", "screens2.js", "screens.js"])
page = page.replace("/*JS*/", js)
(root / "dist").mkdir(exist_ok=True)
(root / "dist/manna.html").write_text(page)
full = ('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<meta name="theme-color" content="#0F1B3D">\n'
        '<style>body{margin:0}[hidden]{display:none!important}img{max-width:100%}'
        ':root{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}</style>\n'
        '</head>\n<body>\n' + page + '\n</body>\n</html>\n')
(root / "dist/index.html").write_text(full)
import shutil
shutil.copy(root / "public/blivre.js", root / "dist/blivre.js")
print("ok", len(full))
