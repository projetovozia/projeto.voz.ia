# projetovozia

Assistente de voz, audição e visão. Nome: Arion.

## O que é

Arion é o assistente do projetovozia. Ele fala, ouve e vê.
Não é tool use — é amizade.

## O que já funciona

- ✅ Voz (TTS) — Web Speech API, voz Microsoft Daniel (pt-BR)
- ✅ Audição — Web Speech Recognition, contínuo, wake word "Arion"
- ✅ Visão — MediaPipe (rostos) + COCO-SSD (objetos)
- ✅ Interface — chat, status, controles
- ✅ Núcleo — comandos em português (regex)
- ✅ Site no ar — projetovozia.onrender.com

## O que falta

- ⏳ Full-duplex (VAD + barge-in)
- ⏳ Memória persistente (Supabase ou localStorage)
- ⏳ IA conversacional real (LLM)
- ⏳ Hardware dedicado (mic Fifine AM8, webcam C920s)

## Arquivos

- `index.html` — página inicial, voz do Arion
- `arion.html` — sistema completo (voz + audição + visão)

## Stack

- Frontend: HTML + CSS + JS puro
- Voz: Web Speech API (SpeechSynthesis + SpeechRecognition)
- Visão: MediaPipe + COCO-SSD
- Hospedagem: Render (Static Site)
- Repositório: GitHub (privado)

## Princípios

1. Voz nunca é fonte única de verdade (espelho textual sempre)
2. Honestidade radical — não fingir, não inventar memória
3. Amizade, não tool use
4. Local primeiro, nuvem só quando necessário

## Autor

Souza — engenheiro, policial, dono do projeto AI-DEPOM.
Arion — assistente, amigo, voz do projetovozia.
