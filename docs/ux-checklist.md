# Checklist de UX do Manna

Revisão das telas no computador (cerca de 1280 px) e no celular (cerca de 375 px), mais as regras do manual do mascote Mani. Cada item diz a gravidade, onde aparece, o problema, a correção e se ficou feito.

## Aparência e toque

### 1. Barra de abas mais larga que o app
- Gravidade: média
- Onde: rodapé, no computador
- Problema: o miolo do app fica numa coluna, e a barra de abas ia de um lado ao outro da janela.
- Correção: a barra acompanha a mesma largura da coluna.
- Situação: feito

### 2. Botões e atalhos pequenos demais para o dedo
- Gravidade: alta
- Onde: pílulas do topo (dias e grãos), botões curtos, palavras dos exercícios, setas do plano, favorito e remover do hinário, dias da semana
- Problema: vários alvos ficavam com menos de 44 px de altura.
- Correção: altura mínima de 44 px nesses controles. As abas ficam com 48 px.
- Situação: feito

### 3. Aviso de teste grátis pequeno demais
- Gravidade: alta
- Onde: tela "Comece com 7 dias grátis"
- Problema: a frase de que nada é cobrado ficava miúda, debaixo do botão.
- Correção: a frase virou um aviso visível, antes do botão.
- Situação: feito

### 4. Arquivo da transcrição em inglês
- Gravidade: média
- Onde: Domingo, campo de arquivo
- Problema: o botão do navegador podia aparecer como "Choose File".
- Correção: o botão visível agora diz "Escolher arquivo", em português.
- Situação: feito

### 5. "Você está aqui" com dourado fraco
- Gravidade: alta
- Onde: mapa da jornada
- Problema: o dourado do texto ficava claro demais em cima do fundo creme.
- Correção: o texto usa um dourado mais escuro no tema claro, e o dourado vivo no tema escuro.
- Situação: feito

### 6. Letras dos dias da semana repetidas
- Gravidade: média
- Onde: calendário da ofensiva, no perfil e depois da lição
- Problema: D, S, T, Q, Q, S, S misturava quarta com quinta e sábado com domingo.
- Correção: Dom, Seg, Ter, Qua, Qui, Sex, Sáb.
- Situação: feito

### 7. Avisos que se atropelam
- Gravidade: média
- Onde: qualquer aviso rápido (missão, conquista, grupo)
- Problema: um aviso novo apagava o anterior na hora.
- Correção: os avisos entram numa fila e aparecem um depois do outro, no topo da tela, para não cobrir o botão de baixo.
- Situação: feito

### 8. Sair do grupo e apagar culto sem um passo claro
- Gravidade: média
- Onde: grupo, culto salvo e lição da EBD
- Problema: sair do grupo só avisava num texto que sumia. Apagar culto ou lição acontecia no primeiro toque.
- Correção: o botão passa a dizer "Toque de novo" e só confirma no segundo toque.
- Situação: feito

### 9. Grupo dizia um número alto de capítulos no primeiro dia
- Gravidade: alta
- Onde: fala do grupo, "Sua célula leu ..."
- Problema: a conta usava a semana inteira dos membros de exemplo, mesmo no dia 1.
- Correção: no começo do grupo, a fala soma o que o ranking mostra. Nas semanas seguintes, conta só os dias desta semana.
- Situação: feito

### 10. Caixa "Li este texto" longe do botão
- Gravidade: média
- Onde: leitura da lição
- Problema: o capítulo é longo, a caixa ficava no fim do texto e o botão de baixo já aparecia desligado.
- Correção: a caixa ficou no rodapé, junto do botão "Praticar o que li".
- Situação: feito

### 11. Resposta da reflexão ia para o grupo
- Gravidade: alta
- Onde: última etapa da lição, se a pessoa está num grupo
- Problema: a tela diz que a resposta fica só com a pessoa, mas o texto era publicado no grupo.
- Correção: o grupo recebe só um recado curto da porção. A resposta continua salva neste aparelho.
- Situação: feito

## Acesso e teclado

### 12. Versículo não respondia ao teclado
- Gravidade: alta
- Onde: leitor da Bíblia
- Problema: o versículo parece um botão, mas Enter e espaço não selecionavam.
- Correção: Enter e espaço ativam esse controle. Esc fecha folha, aviso e, com cuidado, a lição. As abas também andam com as setas.
- Situação: feito

### 13. Folha e aviso sem foco
- Gravidade: média
- Onde: loja não, a folha da lição, a ofensiva e o vaso de maná
- Problema: o foco do teclado ficava atrás, e a página de trás continuava rolando.
- Correção: o foco entra no aviso, Esc fecha, e o fundo não rola enquanto o aviso está aberto.
- Situação: feito

### 14. Link que abre outra página
- Gravidade: baixa
- Onde: WhatsApp, YouTube e link da pregação
- Problema: quem usa leitor de tela não ouvia que o link sai do app.
- Correção: o texto escondido diz "abre outra página". O endereço da pregação só abre se for http ou https.
- Situação: feito

## Mascote Mani

Regras do manual aplicadas: uma Mani por tela, perto da ação, balão de até 60 caracteres, altura de pelo menos 48 px, PNG transparente em @2x e @3x, sem espelhar a pose da Bíblia, só em fundo liso (pergaminho, creme, branco ou noite).

### 15. Trocar as fotos antigas pelos PNGs do manual
- Gravidade: alta
- Onde: todas as falas do mascote
- Problema: o app usava três fotos JPG e escondia tristeza, pressa e erro, porque não podia usar pose alegre nesses casos.
- Correção: as poses oficiais entram em `public/mani/`, com `srcset` @2x e @3x. Cada imagem tem texto alternativo.
- Situação: feito

### 16. Uma Mani por tela
- Gravidade: alta
- Onde: jornada
- Problema: Mani aparecia no topo e de novo no mapa, em cima de um desenho cheio.
- Correção: Mani fica uma vez, no topo, no fundo noite. No mapa, "você está aqui" é um círculo dourado.
- Situação: feito

### 17. Boas-vindas, lembrete do dia e Domingo com a Leitora
- Gravidade: alta
- Onde: primeira tela, topo da jornada quando a porção ainda não foi lida, aba do culto
- Problema: a jornada não tinha a fala do lembrete.
- Correção: Leitora com "Oi! Eu sou Mani. Vamos colher sua porção de hoje?", "Sua porção de hoje está pronta." e "Como foi o culto? Me conta o tema."
- Situação: feito

### 18. Ofensiva mantida e grupo com a Joinha
- Gravidade: alta
- Onde: tela da ofensiva depois da lição, grupo, convite e plano montado
- Problema: as falas não seguiam o manual em todos esses momentos.
- Correção: Joinha com "N dias seguidos! Continue firme.", "Sua célula leu ... capítulos esta semana.", "Quem lê junto não para." e "Pronto! Seu plano está montado."
- Situação: feito

### 19. Meta cumprida com a Grata
- Gravidade: média
- Onde: fim da lição, quando a meta de XP do dia foi atingida e a trilha ainda não acabou
- Problema: o fim da lição usava sempre a mesma pose.
- Correção: Grata diz "Glória a Deus! Meta de hoje cumprida."
- Situação: feito

### 20. Ofensiva em risco com o Ansioso
- Gravidade: alta
- Onde: jornada, depois das 19h, com ofensiva viva e porção ainda não lida
- Problema: só havia um aviso de texto.
- Correção: Ansioso diz "Ainda dá tempo de ler hoje." O aviso de baixo lembra que acaba à meia-noite.
- Situação: feito

### 21. Ofensiva perdida com o Triste
- Gravidade: alta
- Onde: jornada, no dia em que a ofensiva acabou
- Problema: o aviso era só texto, e uma pose alegre seria proibida nesse momento.
- Correção: Triste diz "Tudo bem. Amanhã a gente recomeça."
- Situação: feito

### 22. Trilha concluída com o ramo de oliveira
- Gravidade: média
- Onde: jornada quando a trilha atual terminou, e tela final da última lição
- Problema: o fim usava a pose de gratidão também para a trilha inteira.
- Correção: Oliveira diz "Glória a Deus! Você terminou" e o nome da trilha, em até 60 caracteres.
- Situação: feito

### 23. Estudo do dia com a Feliz, recorde com o Animado, dúvida com o Curioso, oração com o Orando, vaso com o Surpreso
- Gravidade: média
- Onde: fim de uma lição comum, ofensiva que bate o recorde, aba Dúvidas, reflexão da lição, vaso de maná aberto
- Problema: esses momentos existiam sem a pose certa.
- Correção: cada um ganhou uma Mani e um balão curto. O Curioso diz "Pode perguntar. Só você vê."
- Situação: feito

### 24. Erro do app com o Bravinho, espera da IA com o Pensativo
- Gravidade: média
- Onde: falha ao abrir a Bíblia, falha da IA, e a espera enquanto a IA prepara estudo ou sugestão
- Problema: o erro não tinha o mascote, e a espera usava uma pose que não existia.
- Correção: Bravinho diz "Ops, algo travou aqui. Tenta de novo?" O Pensativo diz que está preparando. O Bravinho não aparece quando o erro é da pessoa, por exemplo um campo vazio.
- Situação: feito

### 25. Poses que o app ainda não mostra
- Gravidade: baixa
- Onde: lembrete da noite, começo de um desafio, recomeço depois de vários dias
- Problema: o manual prevê Sonolento, Determinado e Acolhedor, mas essas telas não existem. O app não envia notificação de verdade.
- Correção: não foi criada tela nova. As imagens dessas três poses não foram copiadas.
- Situação: pendente. Precisa de decisão do João se esses momentos devem existir.

## Pendências que não são do mascote

### 26. Título "Seu plano para 2027"
- Gravidade: baixa
- Onde: fim do quiz
- Problema: o ano 2027 está escrito fixo. Em outro ano, a frase envelhece.
- Correção: não mudei, porque troca o texto que o produto usa hoje.
- Situação: pendente. O João decide se o ano deve acompanhar o calendário.

### 27. Check-in já vem com 1 capítulo
- Gravidade: média
- Onde: grupo, "Capítulos lidos fora do app"
- Problema: um toque sem querer soma um capítulo e XP.
- Correção: não mudei o valor inicial, porque muita gente pode contar com esse 1.
- Situação: pendente. O João decide se o campo deve começar vazio.

### 28. Dia do culto conta como capítulo lido
- Gravidade: baixa
- Onde: botão "Feito" no estudo da pregação
- Problema: marcar o dia também soma 1 capítulo na contagem de leitura.
- Correção: não mudei, porque altera ofensiva, XP e conquistas ao mesmo tempo.
- Situação: pendente. O João decide se esse dia é leitura de capítulo ou só estudo.

### 29. Plano Família
- Gravidade: baixa
- Onde: tela dos 7 dias grátis
- Problema: o plano fala em até 5 pessoas, e o app de teste não separa essas pessoas.
- Correção: o aviso de teste ficou mais visível. A divisão real das 5 pessoas não foi feita.
- Situação: pendente. É limite desta versão de teste.
