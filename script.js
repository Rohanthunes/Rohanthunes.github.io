/**
 * vinheta.js — Lógica da tela de abertura
 * História da Europa
 *
 * Responsabilidades:
 *  1. Partículas douradas animadas no canvas
 *  2. Efeito de brilho pulsante no título
 *  3. Transição suave de saída ao clicar em "Explorar História"
 *  4. Áudio ambiente opcional (ativado por interação do usuário)
 */

/* ─────────────────────────────────────────────────────────────────
   1. PARTÍCULAS DOURADAS
   ─────────────────────────────────────────────────────────────────
   Cria centenas de partículas com brilho variado que flutuam
   suavemente, simulando poeira de ouro e brasas antigas.
   ───────────────────────────────────────────────────────────────── */
(function iniciarParticulas() {
    const canvas = document.getElementById('canvas-particulas');
    const ctx    = canvas.getContext('2d');

    /** Ajusta o canvas ao tamanho da janela */
    function redimensionar() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    redimensionar();
    window.addEventListener('resize', redimensionar);

    /** Gera uma cor dourada aleatória com variação sutil */
    function corOuro(alpha) {
        const r = 180 + Math.random() * 71;  // 180–251
        const g = 140 + Math.random() * 50;  // 140–190
        const b =  20 + Math.random() * 40;  //  20–60
        return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`;
    }

    /**
     * Classe Particula
     * Cada partícula tem posição, velocidade, tamanho e ciclo de vida próprios.
     */
    class Particula {
        constructor() { this.reiniciar(true); }

        reiniciar(nascimento = false) {
            this.x     = Math.random() * canvas.width;
            this.y     = nascimento
                           ? Math.random() * canvas.height           // posição aleatória inicial
                           : canvas.height + Math.random() * 20;     // nasce abaixo da tela

            this.vx    = (Math.random() - 0.5) * 0.4;   // deriva horizontal suave
            this.vy    = -(0.15 + Math.random() * 0.55); // sobe lentamente
            this.raio  = 0.4 + Math.random() * 1.8;
            this.vida  = 0;
            this.vidaMax = 180 + Math.random() * 240;    // frames de vida
            this.alpha = 0;
            this.brilho = Math.random() > 0.8;           // 20% são "brilhantes"
            this.pulso  = Math.random() * Math.PI * 2;   // fase do pulso
        }

        atualizar() {
            this.x   += this.vx + Math.sin(this.vida * 0.03 + this.pulso) * 0.3;
            this.y   += this.vy;
            this.vida++;
            this.pulso += 0.04;

            // Fade in / fade out suave
            const progresso = this.vida / this.vidaMax;
            if (progresso < 0.2) {
                this.alpha = progresso / 0.2;           // fade in
            } else if (progresso > 0.75) {
                this.alpha = (1 - progresso) / 0.25;   // fade out
            } else {
                this.alpha = 1;
            }

            // Reinicia quando sai da tela ou morre
            if (this.vida >= this.vidaMax || this.y < -10) {
                this.reiniciar();
            }
        }

        desenhar() {
            const a = Math.max(0, Math.min(1, this.alpha));
            ctx.save();

            if (this.brilho) {
                // Partícula brilhante: glow maior
                ctx.shadowBlur  = 10 + Math.sin(this.pulso) * 5;
                ctx.shadowColor = corOuro(a * 0.8);
            } else {
                ctx.shadowBlur  = 4;
                ctx.shadowColor = corOuro(a * 0.4);
            }

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
            ctx.fillStyle = corOuro(a * (this.brilho ? 0.9 : 0.55));
            ctx.fill();

            ctx.restore();
        }
    }

    // Cria o pool de partículas
    const TOTAL = Math.min(200, Math.floor((canvas.width * canvas.height) / 6000));
    const particulas = Array.from({ length: TOTAL }, () => new Particula());

    /** Loop de animação principal */
    function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particulas.forEach(p => { p.atualizar(); p.desenhar(); });
        requestAnimationFrame(animar);
    }

    animar();
})();


/* ─────────────────────────────────────────────────────────────────
   2. EFEITO DE BRILHO FLUTUANTE NO TÍTULO
   ─────────────────────────────────────────────────────────────────
   Adiciona uma leve oscilação de brilho no gradiente dourado
   do título, simulando o reflexo de uma tocha ao vento.
   ───────────────────────────────────────────────────────────────── */
(function brilhoTitulo() {
    const linhas = document.querySelectorAll('.titulo-linha');
    let angulo = 0;

    function pulsar() {
        angulo += 0.012;
        const intensidade = 0.4 + Math.sin(angulo) * 0.15; // 0.25 – 0.55
        linhas.forEach(el => {
            el.style.filter =
                `drop-shadow(0 0 ${20 + Math.sin(angulo) * 12}px rgba(201,168,76,${intensidade.toFixed(2)}))
                 drop-shadow(0 4px 8px rgba(0,0,0,0.8))`;
        });
        requestAnimationFrame(pulsar);
    }

    // Inicia após as animações de entrada concluírem
    setTimeout(pulsar, 2000);
})();


/* ─────────────────────────────────────────────────────────────────
   3. TRANSIÇÃO DE SAÍDA — botão manual + carregamento automático
   ─────────────────────────────────────────────────────────────────
   - O botão navega imediatamente (com fade).
   - Um timer de ~10 segundos dispara a mesma transição de forma
     automática (3,2s de animações + 7s para leitura), com uma
     barra de progresso dourada visível.
   - Se o usuário clicar no botão antes do timer, o timer é cancelado.
   ───────────────────────────────────────────────────────────────── */
(function transicaoSaida() {
    const btn     = document.getElementById('btn-explorar');
    const overlay = document.getElementById('transicao-saida');

    if (!btn || !overlay) return;

    const DESTINO      = btn.getAttribute('href') || 'index2.html';
    const TEMPO_AUTO   = 10200; // ms: ~3,2s de animações de entrada + 7s de leitura
    const FADE_DURACAO = 1050;  // ms da transição CSS de saída

    let navegado = false; // impede navegação dupla

    /** Dispara o fade e navega */
    function navegar() {
        if (navegado) return;
        navegado = true;
        clearTimeout(timerAuto);
        overlay.classList.add('ativa');
        setTimeout(() => { window.location.href = DESTINO; }, FADE_DURACAO);
    }

    /* ── Barra de progresso dourada ─────────────────────────────── */
    const barra = document.createElement('div');
    barra.id = 'barra-progresso';
    barra.innerHTML = '<div id="barra-fill"></div>';
    document.body.appendChild(barra);

    const fill = document.getElementById('barra-fill');

    // Inicia a animação da barra após as entradas (~3s de animações CSS)
    const ATRASO_BARRA = 3200;
    const DURACAO_BARRA = TEMPO_AUTO - ATRASO_BARRA; // tempo que a barra fica visível

    setTimeout(() => {
        barra.classList.add('visivel');
        // A barra cresce de 0% → 100% em DURACAO_BARRA ms via transição CSS
        requestAnimationFrame(() => {
            fill.style.transition = `width ${DURACAO_BARRA}ms linear`;
            fill.style.width = '100%';
        });
    }, ATRASO_BARRA);

    /* ── Timer automático ────────────────────────────────────────── */
    const timerAuto = setTimeout(navegar, TEMPO_AUTO);

    /* ── Clique manual no botão ──────────────────────────────────── */
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        navegar();
    });
})();


/* ─────────────────────────────────────────────────────────────────
   4. ÁUDIO AMBIENTE OPCIONAL
   ─────────────────────────────────────────────────────────────────
   Browsers modernos bloqueiam autoplay de áudio sem interação.
   Aqui tentamos iniciar após o primeiro clique/toque do usuário.
   Se não houver <source> no <audio>, não faz nada.
   ───────────────────────────────────────────────────────────────── */
(function audioAmbiente() {
    const audio  = document.getElementById('audio-ambiente');
    const nota   = document.getElementById('nota-audio');

    // Só ativa se houver uma fonte de áudio configurada
    if (!audio || audio.querySelectorAll('source').length === 0) return;

    audio.volume = 0.12; // volume discreto (12%)

    function tentarPlay() {
        audio.play()
            .then(() => {
                if (nota) {
                    nota.style.opacity = '1';
                    nota.textContent   = '♪ Música ambiente ativa';
                    // Oculta a nota após 3s
                    setTimeout(() => { nota.style.opacity = '0'; }, 3000);
                }
            })
            .catch(() => {
                // Autoplay bloqueado — silencia sem erros no console
            });

        // Remove os listeners após a primeira tentativa
        document.removeEventListener('click',     tentarPlay);
        document.removeEventListener('touchstart', tentarPlay);
        document.removeEventListener('keydown',   tentarPlay);
    }

    document.addEventListener('click',      tentarPlay, { once: true });
    document.addEventListener('touchstart', tentarPlay, { once: true });
    document.addEventListener('keydown',    tentarPlay, { once: true });
})();


/* ─────────────────────────────────────────────────────────────────
   5. PARALLAX SUAVE AO MOVER O MOUSE
   ─────────────────────────────────────────────────────────────────
   O mapa de fundo e a névoa reagem levemente ao cursor,
   criando profundidade cinematográfica.
   ───────────────────────────────────────────────────────────────── */
(function parallaxMouse() {
    const bgMap = document.querySelector('.bg-map');
    const nevoa = document.querySelector('.nevoa');

    if (!bgMap || !nevoa) return;

    let alvoX = 0, alvoY = 0;
    let atualX = 0, atualY = 0;

    document.addEventListener('mousemove', (e) => {
        // Normaliza entre -1 e 1
        alvoX = (e.clientX / window.innerWidth  - 0.5) * 2;
        alvoY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animar() {
        // Interpolação suave (lerp)
        atualX += (alvoX - atualX) * 0.04;
        atualY += (alvoY - atualY) * 0.04;

        const mx = atualX * 14; // deslocamento máximo em px
        const my = atualY * 10;

        bgMap.style.transform = `translate(${mx * 0.4}px, ${my * 0.4}px) scale(1.04)`;
        nevoa.style.transform = `translate(${mx * 0.8}px, ${my * 0.8}px)`;

        requestAnimationFrame(animar);
    }

    animar();
})();