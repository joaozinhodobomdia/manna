# Mani: poses

As poses que o app usa estão em `public/mani/`, em PNG transparente, nos tamanhos @2x e @3x. O app escolhe o arquivo com `srcset`. A pose Leitora, que segura a Bíblia, não é espelhada.

Sonolento, determinado e acolhedor não entram no app nesta versão, porque ainda não existe a tela correspondente (lembrete da noite, começo de desafio e recomeço depois de dias parado).

Os prompts abaixo servem se for preciso gerar de novo uma pose. Use a Leitora como referência e confira o manual.

## Como colocar uma pose nova

1. Salve `public/mani/mani-NOME@2x.png` e `public/mani/mani-NOME@3x.png`, com fundo transparente.
2. Rode `python3 build.py`. O build lê o arquivo @2x e o app passa a usar a pose, se o código pedir esse nome.
3. Pose que o código não pede não aparece. O app não troca uma pose de dor por uma pose alegre.

Poses no app: leitora, grata, joinha, oliveira, feliz, animado, curioso, pensativo, surpreso, ansioso, triste, bravinho e orando.

## Onde cada pose entra no app

| Pose | Onde aparece | Fala de Mani |
| --- | --- | --- |
| Leitora (pronta) | Boas-vindas, porção do dia, tela do culto | Oi! Eu sou Mani. Vamos colher sua porção de hoje? |
| Grata (pronta) | Plano montado, fim da lição, trilha concluída | Glória a Deus! Porção colhida. |
| Joinha (pronta) | Ofensiva mantida, porção já colhida, grupo, convite | 7 dias seguidos! Continue firme. |
| Animado | Recorde de ofensiva, subir de liga | Recorde novo! |
| Feliz | Meta do dia cumprida | Meta de hoje cumprida! |
| Curioso | Aba Dúvidas | Pode perguntar. Só você vê. |
| Pensativo | IA montando estudo, trilha ou sugestões | Estou preparando seu estudo. |
| Surpreso | Conquista nova, vaso de maná aberto | Olha o que você ganhou! |
| Determinado | Começo de desafio do grupo | Bora começar o desafio? |
| Ansioso | Ofensiva em risco (depois das 19h) | Ainda dá tempo de ler hoje. |
| Triste | Ofensiva perdida | Tudo bem. Amanhã a gente recomeça. |
| Sonolento | Lembrete da noite | Antes de dormir, só um versículo? |
| Bravinho | Erro do app (nunca contra a pessoa) | Ops, algo travou aqui. Tenta de novo? |
| Orando | Pergunta de reflexão no fim da lição | Vamos guardar isso no coração. |
| Acolhedor | Recomeço depois de dias parado | Que bom te ver de volta. |
| Com ramo de oliveira | Trilha concluída, vida nova (pedido no manual) | Você chegou ao destino! |

Formato: PNG com fundo transparente (ou creme liso #FDEFE2), pelo menos 480 px de largura, Mani inteiro sem cortes e com respiro em volta.

## Feliz (`feliz`)

Uso: Estudo do dia concluído.

```
Cute 3D cartoon white dove mascot named Mani, chubby round body, big glossy dark brown eyes with thick black outline and small eyelashes, soft gray-brown eyebrows, rounded orange beak, orange feet, soft white feathers with a three-feather tuft on the head, wings used like little hands, soft clay-like render, warm cream background, soft studio light, soft ground shadow, no text. eyes closed in happy arcs, open beak smiling
```

## Animado (`animado`)

Uso: Ofensiva batida, recorde.

```
Cute 3D cartoon white dove mascot named Mani, chubby round body, big glossy dark brown eyes with thick black outline and small eyelashes, soft gray-brown eyebrows, rounded orange beak, orange feet, soft white feathers with a three-feather tuft on the head, wings used like little hands, soft clay-like render, warm cream background, soft studio light, soft ground shadow, no text. sparkling eyes, raised eyebrows, wings up, small golden seeds floating
```

## Curioso (`curioso`)

Uso: Seção de dúvidas.

```
Cute 3D cartoon white dove mascot named Mani, chubby round body, big glossy dark brown eyes with thick black outline and small eyelashes, soft gray-brown eyebrows, rounded orange beak, orange feet, soft white feathers with a three-feather tuft on the head, wings used like little hands, soft clay-like render, warm cream background, soft studio light, soft ground shadow, no text. one eyebrow raised, looking up, golden question mark
```

## Pensativo (`pensativo`)

Uso: IA preparando o estudo.

```
Cute 3D cartoon white dove mascot named Mani, chubby round body, big glossy dark brown eyes with thick black outline and small eyelashes, soft gray-brown eyebrows, rounded orange beak, orange feet, soft white feathers with a three-feather tuft on the head, wings used like little hands, soft clay-like render, warm cream background, soft studio light, soft ground shadow, no text. looking up to the side, wing tip touching chin
```

## Surpreso (`surpreso`)

Uso: Conquista ou desafio novo.

```
Cute 3D cartoon white dove mascot named Mani, chubby round body, big glossy dark brown eyes with thick black outline and small eyelashes, soft gray-brown eyebrows, rounded orange beak, orange feet, soft white feathers with a three-feather tuft on the head, wings used like little hands, soft clay-like render, warm cream background, soft studio light, soft ground shadow, no text. wide eyes, eyebrows high, beak open in an O
```

## Determinado (`determinado`)

Uso: Desafio começando.

```
Cute 3D cartoon white dove mascot named Mani, chubby round body, big glossy dark brown eyes with thick black outline and small eyelashes, soft gray-brown eyebrows, rounded orange beak, orange feet, soft white feathers with a three-feather tuft on the head, wings used like little hands, soft clay-like render, warm cream background, soft studio light, soft ground shadow, no text. eyebrows slightly down, confident closed smile
```

## Ansioso (`ansioso`)

Uso: Ofensiva em risco.

```
Cute 3D cartoon white dove mascot named Mani, chubby round body, big glossy dark brown eyes with thick black outline and small eyelashes, soft gray-brown eyebrows, rounded orange beak, orange feet, soft white feathers with a three-feather tuft on the head, wings used like little hands, soft clay-like render, warm cream background, soft studio light, soft ground shadow, no text. worried eyebrows, small sweat drop, wavy mouth
```

## Triste (`triste`)

Uso: Ofensiva perdida.

```
Cute 3D cartoon white dove mascot named Mani, chubby round body, big glossy dark brown eyes with thick black outline and small eyelashes, soft gray-brown eyebrows, rounded orange beak, orange feet, soft white feathers with a three-feather tuft on the head, wings used like little hands, soft clay-like render, warm cream background, soft studio light, soft ground shadow, no text. worried eyebrows, one tear, beak turned down
```

## Bravinho (`bravinho`)

Uso: Erro do app (nunca contra a pessoa).

```
Cute 3D cartoon white dove mascot named Mani, chubby round body, big glossy dark brown eyes with thick black outline and small eyelashes, soft gray-brown eyebrows, rounded orange beak, orange feet, soft white feathers with a three-feather tuft on the head, wings used like little hands, soft clay-like render, warm cream background, soft studio light, soft ground shadow, no text. grumpy half-closed eyes, frown, two small steam puffs, still cute
```

## Sonolento (`sonolento`)

Uso: Lembrete da noite.

```
Cute 3D cartoon white dove mascot named Mani, chubby round body, big glossy dark brown eyes with thick black outline and small eyelashes, soft gray-brown eyebrows, rounded orange beak, orange feet, soft white feathers with a three-feather tuft on the head, wings used like little hands, soft clay-like render, warm cream background, soft studio light, soft ground shadow, no text. half-closed eyes, two small z letters
```

## Orando (`orando`)

Uso: Momento de oração.

```
Cute 3D cartoon white dove mascot named Mani, chubby round body, big glossy dark brown eyes with thick black outline and small eyelashes, soft gray-brown eyebrows, rounded orange beak, orange feet, soft white feathers with a three-feather tuft on the head, wings used like little hands, soft clay-like render, warm cream background, soft studio light, soft ground shadow, no text. eyes gently closed, wings together in prayer
```

## Acolhedor (`acolhedor`)

Uso: Mensagens delicadas, recomeço.

```
Cute 3D cartoon white dove mascot named Mani, chubby round body, big glossy dark brown eyes with thick black outline and small eyelashes, soft gray-brown eyebrows, rounded orange beak, orange feet, soft white feathers with a three-feather tuft on the head, wings used like little hands, soft clay-like render, warm cream background, soft studio light, soft ground shadow, no text. soft closed eyes, gentle smile, wings open for a hug, small golden heart
```
