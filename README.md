
# 🌌 AI Quest: Infinite Worlds

**O RPG Sandbox Definitivo Movido por Inteligência Artificial.**

AI Quest é uma experiência imersiva de nova geração que utiliza todo o ecossistema do **Google Gemini API** para criar um multiverso infinito onde cada herói, cada lenda e cada voz são gerados em tempo real por IA.

![AI Quest Logo](./logo.png)

## ✨ Funcionalidades Principais

### ⚔️ Forja de Heróis (Hero Forge)
*   **Geração de Avatares Pro**: Criação de heróis únicos usando `gemini-3-pro-image-preview`.
*   **Atributos Dinâmicos**: Poder, Agilidade e Magia calculados via IA.
*   **Cofre de Heróis (Vault)**: Salve suas lendas localmente e gerencie seu exército.

### 🎙️ Voz do Ancião (NPC Live Voice)
*   **Interação em Tempo Real**: Conversas por voz de baixa latência usando a **Gemini Live API**.
*   **Transcrição ao Vivo**: Veja o que o Ancião está sussurrando enquanto ele fala.
*   **Personalidade Mística**: Um guia sábio que responde de forma poética e única a cada interação.

### 📜 Diário de Missões (Quest Log)
*   **Grounding com Google Search**: Consulte o multiverso sobre histórias e fatos reais verificados.
*   **Portal Hunt (Google Maps)**: Use seu GPS real para encontrar "portais mágicos" em locais próximos a você.
*   **Enigmas do Oráculo**: Desafie a IA com problemas complexos utilizando o `thinkingConfig` (Raciocínio Avançado).

### 🎬 Estúdio Cinemático (Veo Studio)
*   **Animação de Visões**: Gere vídeos épicos de 720p das suas aventuras usando o modelo **Veo 3.1**.
*   **Direção de Cena**: Escolha a proporção (Wide ou Mobile) para suas cinemáticas.

---

## 🛠️ Stack Tecnológica

*   **Frontend**: React 19 + TypeScript.
*   **Estilização**: Tailwind CSS (Design Futurista/Cyberpunk).
*   **IA Engine**: `@google/genai` (SDK Oficial).
*   **Modelos Utilizados**:
    *   `gemini-3-pro-image-preview` (Imagens de alta qualidade).
    *   `gemini-3-pro-preview` (Raciocínio e Enigmas).
    *   `gemini-2.5-flash-native-audio` (Voz em tempo real).
    *   `veo-3.1-fast-generate-preview` (Vídeos cinemáticos).
*   **PWA**: Service Workers para suporte offline e instalação como App Nativo.

---

## 🎮 Gamificação e Retenção

*   **Sistema de Mana**: Gerenciamento de recursos para ações épicas (regeneração em tempo real).
*   **Progressão de XP**: Ganhe experiência ao criar e explorar, subindo de nível seu perfil de jogador.
*   **Recompensas Diárias**: Colete "Essência" todos os dias para recuperar Mana e ganhar XP.
*   **Feedback Háptico**: Vibrações táteis integradas para uma sensação de app premium.

---

## 🚀 Como Executar

1.  Clone o repositório.
2.  Certifique-se de ter uma **Gemini API Key** válida.
3.  Configure a variável de ambiente `API_KEY`.
4.  Abra o `index.html` ou use um servidor local (como Vite ou Live Server).

---

## 📱 Mobile-First Design

Este projeto foi desenhado especificamente para ser utilizado em dispositivos móveis, com suporte a:
*   Áreas seguras (Safe Areas) para iPhone/Android.
*   Prevenção de pull-to-refresh acidental.
*   Instalação via Manifest PWA.

---

Desevolvido com ❤️ e muita IA.
