// ============================================================
// vad.js — Voice Activity Detection + Barge-in
// projetovozia · Arion
// ============================================================
// Detecta quando o usuário começa a falar e interrompe o Arion.
// É o começo do full-duplex: dois fluxos que se escutam.
// ============================================================

class VAD {
    constructor(opcoes = {}) {
        // Configurações ajustáveis
        this.limiar = opcoes.limiar || 0.02;       // energia RMS mínima
        this.tempoFala = opcoes.tempoFala || 150;  // ms de fala contínua
        this.debounce = opcoes.debounce || 500;    // ms entre disparos
        this.debug = opcoes.debug || false;

        // Estado interno
        this.audioContext = null;
        this.analyser = null;
        this.stream = null;
        this.rodando = false;
        this.ultimoDisparo = 0;
        this.callbackFala = null;
        this.callbackSilencio = null;
        this.estavaFalando = false;
    }

    async iniciar(callbackFala, callbackSilencio) {
        this.callbackFala = callbackFala || null;
        this.callbackSilencio = callbackSilencio || null;

        try {
            // Pede microfone com cancelamento de eco ativado
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,   // evita que o Arion se ouça
                    noiseSuppression: true,   // reduz ruído de fundo
                    autoGainControl: true     // normaliza volume
                }
            });

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(this.stream);

            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 512;
            source.connect(this.analyser);

            this.rodando = true;
            this._loop();

            console.log('🎤 VAD iniciado — full-duplex ligado');
            return true;
        } catch (e) {
            console.error('❌ VAD erro:', e);
            return false;
        }
    }

    _loop() {
        if (!this.rodando) return;

        const buffer = new Uint8Array(this.analyser.fftSize);
        this.analyser.getByteTimeDomainData(buffer);

        // Calcula energia RMS (root mean square)
        let soma = 0;
        for (let i = 0; i < buffer.length; i++) {
            const v = (buffer[i] - 128) / 128;
            soma += v * v;
        }
        const rms = Math.sqrt(soma / buffer.length);

        const agora = performance.now();
        const falando = rms > this.limiar;

        // Transição: silêncio → fala
        if (falando && !this.estavaFalando) {
            this.estavaFalando = true;
            if (agora - this.ultimoDisparo > this.debounce) {
                this.ultimoDisparo = agora;
                if (this.callbackFala) this.callbackFala(rms);
                if (this.debug) console.log(`🔊 Fala detectada (RMS: ${rms.toFixed(3)})`);
            }
        }

        // Transição: fala → silêncio
        if (!falando && this.estavaFalando) {
            this.estavaFalando = false;
            if (this.callbackSilencio) this.callbackSilencio();
            if (this.debug) console.log('🔇 Silêncio');
        }

        requestAnimationFrame(() => this._loop());
    }

    parar() {
        this.rodando = false;
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        console.log('🎤 VAD parado');
    }

    // Ajuste fino do limiar em tempo real
    calibrar(novoLimiar) {
        this.limiar = novoLimiar;
        console.log(`🎚️ Limiar ajustado para ${novoLimiar}`);
    }
}

// Expõe globalmente
window.VAD = VAD;
