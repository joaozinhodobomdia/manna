# Manna

Sua porção diária da Palavra. Versão 1 de teste do app descrito em "Manna: estrutura do produto".

## Como abrir

Rode `python3 build.py` e abra `dist/index.html` no navegador (celular ou computador). Não precisa de servidor nem de instalação.
O progresso fica salvo no próprio navegador (localStorage).

## O que tem nesta versão (v2, gamificada)

- Onboarding com o mascote Mani: quiz de 8 perguntas, "Seu plano para 2027" e paywall com 7 dias grátis (simulado).
- Jornada: caminho de lições em zigue-zague, dividido em unidades, com cenário do Êxodo (tendas, palmeiras de Elim, coluna de nuvem, pilar de fogo, tábuas) e um vaso de maná no fim de cada unidade.
- Lição em etapas: ler o texto, múltipla escolha, completar a frase, montar o título com palavras e refletir. Erro volta no fim, sequência de acertos, sons e chuva de maná ao terminar. Com IA, entram perguntas sobre o texto.
- XP, meta diária, 3 missões do dia, grãos de maná e loja (protetor de ofensiva, XP em dobro, recuperar ofensiva).
- Liga semanal com 6 divisões (Semente a Cedro), promoção e rebaixamento.
- Conquistas em 5 níveis com medalhas, calendário da ofensiva e cartão da semana.
- Domingo (culto e EBD), Dúvidas (21 respostas prontas e pergunta livre) e grupo da igreja.
- Ferramentas de teste no Perfil: avançar um dia, ganhar grãos, refazer o quiz, apagar dados.

## Novidades da v3

- Mascote Mani agora é uma pombinha.
- Igreja Adventista do Sétimo Dia: visão adventista nas 21 dúvidas, nova dúvida sobre sábado e domingo, aba "Sábado" e "Escola Sabatina" para adventistas.
- Objetivo do ano em texto livre, com ideias prontas e sugestões de trilhas (com IA quando disponível).
- Plano aberto: 5 planos de leitura (Bíblia em 1 ano e outros), os 66 livros, 14 personagens, 8 épocas, temas e trilhas criadas por IA. O plano é uma lista de etapas que a pessoa ordena, adiciona e remove.
- Bíblia Livre completa dentro do app (`public/blivre.js`, gerado por `tools/blivre.py` a partir do repositório oficial blivre/biblialivre, licença CC BY 3.0 Brasil). As lições mostram o texto e criam exercícios a partir dos versículos.
- Leitor da Bíblia com marcação de capítulos lidos, seleção de versículos, cópia e postagem no grupo.
- Hinário: escolha do hinário (Adventista, Harpa Cristã, Cantor Cristão, Novo Cântico, CCB e outros), hinos guardados por número e título, atalho para ouvir no YouTube. As letras não estão incluídas por direitos autorais.
- Pregação vira trilha: transcrição colada ou enviada em arquivo (.txt, .srt, .vtt), ditado de anotações e criação de uma trilha de aprendizado sobre o tema.

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
