# Plano de revisão do Manna

> Para quem for implementar: faça uma fase de cada vez, com o teste da fase verde antes de seguir. As caixas `[ ]` marcam o que ainda falta. A fase 0 e a fase 1 deste arquivo já foram feitas neste pedido.

**Objetivo:** deixar o app certo, seguro e menor, sem mudar o que a pessoa vê e faz, e só depois revisar a aparência.

**Como o app é feito:** HTML, CSS e JS em `src/`. `python3 build.py` junta tudo em `dist/index.html` e `dist/manna.html`. A Bíblia Livre fica em `public/blivre.js` e é copiada para `dist/blivre.js`. Não editar `public/blivre.js`, `dist/blivre.js` nem `tools/blivre.py`.

**Quem usa:** uma pessoa, no próprio celular, sem servidor. O progresso fica no navegador (localStorage). Liga e grupo são de exemplo neste aparelho.

## Regras que valem em todas as fases

- Não quebrar o que já funciona: onboarding, jornada, porção, Bíblia, hinário, domingo, dúvidas, grupo e perfil.
- Continuar em HTML, CSS e JS com `build.py`. Sem framework e sem biblioteca nova.
- Texto para o João em português simples, sem os caracteres de travessão.
- A identidade visual fica: noite `#0F1B3D`, ouro `#F2C14E`, pergaminho. Não trocar por outra paleta.
- Uma fase, um PR. Não juntar os PRs, não apagar ramos, não fazer push forçado.

## Como saber que nada quebrou

1. `node tools/check.js` termina com `tudo certo`. Esse script confere referências bíblicas, o domingo da semana, a reflexão que não vai para o grupo, o link `javascript:` barrado, e a abertura com dados locais estragados.
2. `python3 build.py` termina com `ok`.
3. Abrir `dist/index.html` num navegador sem janela (Chrome headless, celular 390 por 844) e percorrer: onboarding, primeira pergunta, jornada, uma lição com o texto da Bíblia Livre, Bíblia, hinário, domingo, dúvidas, grupo e perfil. Nenhum erro de JavaScript no console.
4. Comparar essas telas com a versão anterior. O desenho deve ser o mesmo. A fase 2 é que mexe na aparência.

## Pronto quando

- O check e o build passam.
- As telas principais abrem e a lição mostra o texto.
- O tamanho de `src/` (os 9 arquivos) e de `dist/index.html` está medido, sem contar `blivre.js`.
- O que ficou para o João decidir está escrito no PR.

## O que já estava no ramo antigo

O ramo `cursor/revisao-codigo-ux-3f6f` já está inteiro dentro deste. Não havia correção nova para trazer. Conferido de novo no código atual:

- A reflexão da porção não é publicada. O grupo recebe só o recado curto.
- A semana da ofensiva vai de domingo a sábado (Dom, Seg, Ter, Qua, Qui, Sex, Sáb).
- `Jo.` abre João. `Jo` sozinho continua Jó.
- O link da pregação só abre se for http ou https.
- Hino só entra com número de 1 a 999.
- Dados locais inválidos não derrubam a abertura (e agora também não derrubam grupo, culto, EBD, Bíblia e perfil).
- A Bíblia mostra "Tentar de novo" quando o arquivo não carrega.
- Os avisos entram numa fila.
- A Mani está nos momentos do manual, inclusive andando no mapa.
- A área segura do iPhone, o topo e o cartão Destino já estão no CSS.
- `docs/ux-checklist.md` já está no repositório.

O exercício de completar a frase com palavras soltas saiu quando a porção virou devocional (ler, meditar, refletir, orar, levar para o dia). Não há o que recolocar, a menos que o João queira os exercícios de volta.

## Fase 0. Plano

- [x] Escrever este arquivo com as fases, o teste e o critério de pronto.

## Fase 1. Código, segurança, desempenho e tamanho

Feita neste PR. O que mudou:

- [x] `1 Jo.`, `2 Co.`, `1 Pe.` e as outras abreviações com número passam a abrir o livro certo. `Jo` sozinho continua Jó.
- [x] Se a pessoa toca em "Seguir sem esperar", o texto local não é trocado no meio da leitura quando a IA responde. Se ela ainda está na leitura, a tela não pula para o topo.
- [x] Dados salvos tortos (ofensiva, liga, grupo, foto, culto, EBD, hino, capítulo da Bíblia, reflexões) não quebram as telas. Foto que não é JPEG do próprio app não entra no HTML.
- [x] Apagado o que ninguém chama: estilos do quiz antigo, ícones sem uso, a conta da semana do grupo que ficou sem tela, e a função de anotação da lição antiga.
- [x] `node tools/check.js` e `python3 build.py`.
- [x] Telas principais abertas no navegador headless.

Tamanho, em bytes, sem `blivre.js`:

| | Antes | Depois | Diferença |
| --- | --- | --- | --- |
| `src/` (9 arquivos) | 271518 | 270551 | 967 a menos |
| `dist/index.html` | 272128 | 271161 | 967 a menos |

A limpeza pagou o código novo que protege os dados, e ainda sobrou essa diferença.

### Decisão para o João (não mudei)

No dia 1 do grupo, os irmãos de exemplo já entram com uma base de capítulos (Débora começa com 6, o pastor Samuel com 9). A fala "sua célula leu" que somava a semana inteira saiu quando o grupo mudou de cara, e a função que fazia essa conta foi apagada porque ninguém a chamava. O ranking do dia 1 continua com essa base. Se quiser que todo mundo comece do zero no dia 1, isso é um PR pequeno.

## Fase 2. Aparência (não fazer neste PR)

Próximo pedido, outro PR, em cima deste. Usar o UI UX Pro Max sem trocar a paleta.

Uma busca automática com "devocional bíblico" devolveu vermelho e rosa. Isso não serve para o Manna. A busca seguinte tem que nomear as cores que já existem (noite, ouro, pergaminho) e o uso no celular.

- [ ] **Passo 1.** Na raiz do repositório, rodar buscas pequenas, uma de cada vez, e guardar só o que combinar com o app:

```bash
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "faith devotional reading mobile calm night gold" --design-system -p "Manna"
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "touch target 44px safe area" --domain ux
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "focus not obscured sticky footer" --domain ux
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "form error summary" --domain ux
```

Não gravar um design system novo com `--persist` se a paleta sugerida não for a do Manna.

- [ ] **Passo 2.** Aplicar só o que a busca confirmar e que o checklist `docs/ux-checklist.md` ainda deixar aberto. Arquivos: `src/page.html` para o CSS, e o mínimo de HTML em `src/screens.js`, `src/screens2.js` e `src/game.js`.

  Casos já vistos para essa fase:
  - O atalho "Continuar em João 1" na Bíblia não tem estilo (as classes `culto-row`, `cr-ic` e `chev` não existem no CSS). O título e o "Onde você parou" ficam grudados.
  - Conferir de novo, no celular de 390 px e no computador, contraste, alvo de 44 px, foco do teclado e área segura.

- [ ] **Passo 3.** Repetir o teste da seção "Como saber que nada quebrou". Comparar as telas de antes e depois desta fase. O check `node tools/check.js` continua obrigatório.

## O que este plano não faz

Não mexe na Bíblia Livre, não cria conta de verdade, não sincroniza o grupo entre celulares e não cobra o teste grátis. Isso continua simulado neste aparelho.
