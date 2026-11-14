"""Converte a Bíblia Livre (repositório oficial blivre/biblialivre, formato f4, NT Textus Receptus)
em public/blivre.js: window.BLIVRE = {livros: [{n, a, c: [[verso, ...], ...]}]}.
Uso: python3 tools/blivre.py CAMINHO/textos/f4/tr"""
import json, re, sys
from pathlib import Path

ORDEM = "GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV".split()
src = Path(sys.argv[1])
livros = {}
for f in src.glob("*.txt"):
    txt = f.read_text(encoding="utf-8-sig")
    txt = re.sub(r"\\fn.*?\\\*fn", "", txt, flags=re.S)
    txt = re.sub(r"\\ref.*?\\\*ref", "", txt, flags=re.S)
    get = lambda tag: re.search(r"\\%s\s*(.*?)\s*\\\*%s" % (tag, tag), txt, re.S).group(1).strip()
    code, nome, abrev = get("ubs-code"), get("name-short"), get("abbreviation")
    txt = re.sub(r"\\psalm-title.*?\\\*psalm-title", "", txt, flags=re.S)
    caps = {}
    for m in re.finditer(r"\\v\s+[^.\s]+\.(\d+)\.(\d+)\s*(.*?)(?=\\v\s|\Z)", txt, re.S):
        c, v, t = int(m.group(1)), int(m.group(2)), m.group(3)
        t = re.sub(r"\\\*?added", "", t)
        t = re.sub(r"\\[a-z*-]+", "", t)
        t = re.sub(r"\s+", " ", t).strip()
        caps.setdefault(c, {})[v] = t
    capl = []
    for c in sorted(caps):
        vs = caps[c]
        capl.append([vs.get(i, "") for i in range(1, max(vs) + 1)])
    livros[code] = {"n": nome, "a": abrev, "c": capl}
out = {"fonte": "Bíblia Livre (BLIVRE), Copyright © Diego Santos, Mario Sérgio e Marco Teles, fevereiro de 2018. Licença Creative Commons Atribuição 3.0 Brasil.",
       "livros": [livros[c] for c in ORDEM]}
dest = Path(__file__).parent.parent / "public" / "blivre.js"
dest.parent.mkdir(exist_ok=True)
dest.write_text("window.BLIVRE=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
tot = sum(len(v) for l in out["livros"] for v in l["c"])
print(len(out["livros"]), "livros,", sum(len(l["c"]) for l in out["livros"]), "capítulos,", tot, "versículos,", dest.stat().st_size // 1024, "KB")
print([ (l["n"], l["a"], len(l["c"])) for l in out["livros"][:3]], out["livros"][18]["n"], len(out["livros"][18]["c"]))
print(out["livros"][42]["c"][2][15])
