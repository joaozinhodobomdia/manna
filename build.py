"""Gera dist/manna.html (conteúdo do Artifact) e index.html (página completa para abrir no navegador)."""
from pathlib import Path
root = Path(__file__).parent
page = (root / "src/page.html").read_text()
page = page.replace("/*DATA*/", (root / "src/data.js").read_text()).replace("/*APP*/", (root / "src/app.js").read_text())
(root / "dist").mkdir(exist_ok=True)
(root / "dist/manna.html").write_text(page)
full = ('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<meta name="theme-color" content="#0F1B3D">\n'
        '<style>body{margin:0}[hidden]{display:none!important}img{max-width:100%}'
        ':root{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}</style>\n'
        '</head>\n<body>\n' + page + '\n</body>\n</html>\n')
(root / "index.html").write_text(full)
print("ok", len(full))
