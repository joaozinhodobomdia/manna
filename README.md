# Manna

Sua porção diária da Palavra. Versão 1 de teste do app descrito em "Manna: estrutura do produto".

## Como abrir

Abra `index.html` no navegador (celular ou computador). Não precisa de servidor nem de instalação.
O progresso fica salvo no próprio navegador (localStorage).

## O que tem nesta versão

- Quiz de 8 perguntas, tela "Seu plano para 2027" e paywall com 7 dias grátis (simulado, nada é cobrado).
- Hoje: porção diária da primeira meta, ofensiva, metas do ano com progresso.
- 13 trilhas prontas (livros, personagens e temas) com lição, leitura, explicação e reflexão.
- Domingo: tema, versículos e link da live viram um estudo de 5 dias. EBD para aluno e professor.
- Dúvidas: biblioteca com 20 perguntas no formato fixo (Bíblia, tradições, ponto em comum, converse com seu pastor) e pergunta livre.
- Grupo: desafio, ranking, check-in, feed com Amém e comentários, convite por WhatsApp.
- Gamificação: ofensiva, protetor, pontos, níveis, conquistas e resumo semanal.
- Ferramentas de teste no Perfil: avançar um dia, refazer o quiz, apagar dados.

## Limites do teste

- IA (explicar texto, estudo do culto, EBD, pergunta livre) só funciona na versão publicada no Claude.
  Fora dele, o app usa roteiros prontos e a pergunta livre fica desativada.
- Grupo simulado neste aparelho, com membros de exemplo. Sem sincronização entre celulares.
- Textos bíblicos por referência; a pessoa lê na Bíblia dela.
- Sem notificações reais.

## Código

- `src/data.js`: trilhas, desafios e as 20 dúvidas.
- `src/app.js`: lógica e telas.
- `src/page.html`: estilos e esqueleto.
- `python3 build.py` gera `index.html` e `dist/manna.html`.
