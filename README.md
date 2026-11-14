# Manna

Sua porção diária da Palavra. Versão 1 de teste do app descrito em "Manna: estrutura do produto".

## Como abrir

Abra `index.html` no navegador (celular ou computador). Não precisa de servidor nem de instalação.
O progresso fica salvo no próprio navegador (localStorage).

## O que tem nesta versão (v2, gamificada)

- Onboarding com o mascote Mani: quiz de 8 perguntas, "Seu plano para 2027" e paywall com 7 dias grátis (simulado).
- Jornada: caminho de lições em zigue-zague, dividido em unidades, com cenário do Êxodo (tendas, palmeiras de Elim, coluna de nuvem, pilar de fogo, tábuas) e um vaso de maná no fim de cada unidade.
- Lição em etapas: ler o texto, múltipla escolha, completar a frase, montar o título com palavras e refletir. Erro volta no fim, sequência de acertos, sons e chuva de maná ao terminar. Com IA, entram perguntas sobre o texto.
- XP, meta diária, 3 missões do dia, grãos de maná e loja (protetor de ofensiva, XP em dobro, recuperar ofensiva).
- Liga semanal com 6 divisões (Semente a Cedro), promoção e rebaixamento.
- Conquistas em 5 níveis com medalhas, calendário da ofensiva e cartão da semana.
- Domingo (culto e EBD), Dúvidas (20 respostas prontas e pergunta livre) e grupo da igreja.
- Ferramentas de teste no Perfil: avançar um dia, ganhar grãos, refazer o quiz, apagar dados.

## Limites do teste

- IA (explicar texto, estudo do culto, EBD, pergunta livre) só funciona na versão publicada no Claude.
  Fora dele, o app usa roteiros prontos e a pergunta livre fica desativada.
- Grupo simulado neste aparelho, com membros de exemplo. Sem sincronização entre celulares.
- Textos bíblicos por referência; a pessoa lê na Bíblia dela.
- Sem notificações reais.

## Código

- `src/data.js`: trilhas, desafios e as 20 dúvidas.
- `src/art.js`: ilustrações em SVG (mascote, cenário, medalhas, escudos).
- `src/core.js`: estado, XP, ofensiva, missões, liga, conquistas, sons.
- `src/content.js`: estudo do culto, EBD, dúvida livre e grupo.
- `src/game.js`: jornada e motor das lições.
- `src/screens.js`: telas e ações.
- `src/page.html`: estilos e esqueleto.
- `python3 build.py` gera `index.html` e `dist/manna.html`.
