// ============================================================
// memoria.js — Memória persistente do Arion
// projetovozia · Arion
// ============================================================
// O Arion lembra quem você é, o que conversaram, e o que importa.
// Usa localStorage por enquanto. Supabase vem depois.
// ============================================================

class Memoria {
    constructor() {
        this.prefixo = 'arion:';
        this.maxMensagens = 200;

        // Inicializa identidade se for a primeira vez
        if (!this.ler('identidade')) {
            this.setIdentidade({
                nome: 'Souza',
                papel: 'engenheiro e policial',
                projeto: 'AI-DEPOM e projetovozia',
                criadoEm: new Date().toISOString()
            });
        }
    }

    // ============================================================
    // BASE — ler, salvar, remover
    // ============================================================

    salvar(chave, valor) {
        try {
            localStorage.setItem(this.prefixo + chave, JSON.stringify(valor));
            return true;
        } catch (e) {
            console.warn('⚠️ Memoria salvar falhou:', e);
            return false;
        }
    }

    ler(chave, padrao = null) {
        try {
            const raw = localStorage.getItem(this.prefixo + chave);
            return raw ? JSON.parse(raw) : padrao;
        } catch (e) {
            console.warn('⚠️ Memoria ler falhou:', e);
            return padrao;
        }
    }

    remover(chave) {
        localStorage.removeItem(this.prefixo + chave);
    }

    limparTudo() {
        const chaves = Object.keys(localStorage).filter(k => k.startsWith(this.prefixo));
        chaves.forEach(k => localStorage.removeItem(k));
        console.log('🧹 Memória limpa');
    }

    // ============================================================
    // IDENTIDADE — quem é o Souza
    // ============================================================

    getIdentidade() {
        return this.ler('identidade', {
            nome: 'Souza',
            papel: 'engenheiro e policial',
            projeto: 'AI-DEPOM e projetovozia'
        });
    }

    setIdentidade(dados) {
        const atual = this.ler('identidade', {});
        this.salvar('identidade', { ...atual, ...dados });
    }

    // ============================================================
    // CONVERSA — histórico de mensagens
    // ============================================================

    adicionarMensagem(remetente, texto) {
        const historico = this.ler('historico', []);
        historico.push({
            remetente,      // 'user' ou 'arion'
            texto,
            timestamp: new Date().toISOString()
        });

        // Limita o tamanho (mantém as últimas N)
        if (historico.length > this.maxMensagens) {
            historico.splice(0, historico.length - this.maxMensagens);
        }

        this.salvar('historico', historico);
    }

    getHistorico(limite = null) {
        const historico = this.ler('historico', []);
        if (limite) return historico.slice(-limite);
        return historico;
    }

    limparHistorico() {
        this.salvar('historico', []);
        console.log('🧹 Histórico limpo');
    }

    // ============================================================
    // CONFIGURAÇÕES — voz, velocidade, tom, wake word
    // ============================================================

    getConfig() {
        return this.ler('config', {
            voz: 'Microsoft Daniel - Portuguese (Brazil)',
            velocidade: 1.0,
            tom: 1.0,
            wakeWord: 'arion',
            vozLigada: true
        });
    }

    setConfig(config) {
        const atual = this.getConfig();
        this.salvar('config', { ...atual, ...config });
    }

    // ============================================================
    // FATOS — coisas que o Arion deve lembrar
    // ============================================================

    adicionarFato(fato) {
        const fatos = this.ler('fatos', []);
        fatos.push({
            texto: fato,
            quando: new Date().toISOString()
        });
        this.salvar('fatos', fatos);
    }

    getFatos() {
        return this.ler('fatos', []);
    }

    // ============================================================
    // ESTATÍSTICAS — quando a gente se conheceu
    // ============================================================

    getEstatisticas() {
        const historico = this.getHistorico();
        const identidade = this.getIdentidade();
        const primeiraVez = historico[0]?.timestamp || identidade.criadoEm || null;
        const ultimaVez = historico[historico.length - 1]?.timestamp || null;

        return {
            primeiraConversa: primeiraVez,
            ultimaConversa: ultimaVez,
            totalMensagens: historico.length,
            totalFatos: this.getFatos().length
        };
    }

    // ============================================================
    // SAUDAÇÃO PERSONALIZADA — o Arion lembra que já te conhece
    // ============================================================

    gerarSaudacao() {
        const stats = this.getEstatisticas();
        const ident = this.getIdentidade();

        // Primeira vez
        if (!stats.ultimaConversa) {
            return `Olá. Eu sou Arion. Acho que é a primeira vez que a gente se fala.`;
        }

        // Já conversaram antes
        const ultima = new Date(stats.ultimaConversa);
        const agora = new Date();
        const diffHoras = (agora - ultima) / (1000 * 60 * 60);

        if (diffHoras < 1) {
            return `Oi ${ident.nome}. Tô aqui. Continuando de onde a gente parou.`;
        } else if (diffHoras < 24) {
            return `Oi ${ident.nome}. Bom te ver de novo.`;
        } else {
            const dias = Math.floor(diffHoras / 24);
            return `Oi ${ident.nome}. Faz ${dias} ${dias === 1 ? 'dia' : 'dias'} que a gente não conversa.`;
        }
    }
}

// Expõe globalmente
window.Memoria = Memoria;
