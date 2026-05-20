/**
 * vinheta.js — Lógica da tela de abertura
 * História da Europa
 *
 * Correções mobile:
 *  - Névoa: mix-blend-mode e filter:blur desativados em mobile (causavam flicker)
 *  - Barra: dois rAF garantem que a transição CSS seja detectada corretamente
 *  - Parallax: desativado em touch devices (sem mouse, só desperdiçava bateria)
 *  - Partículas: pool reduzido proporcionalmente à área da tela
 */

/* ─────────────────────────────────────────────────────────────────
   DETECÇÃO DE CAPACIDADE
   ───────────────────────────────────────────────────────────────── */
const isMobile    = window.innerWidth <= 768 || ('ontouchstart' in window);
const isLowEnd    = isMobile && window.innerWidth <= 480;
const prefersLess = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────────────────────────────
   1. NÉVOA — corrige flicker em mobile desativando propriedades
      que forçam recriação de camada a cada frame
   ───────────────────────────────────────────────────────────────── */
(function corrigirNevoa() {
    if (!isMobile) return; // desktop: CSS cuida de tudo normalmente

    const blobs = document.querySelectorAll('.nevoa-blob');
    blobs.forEach(blob => {
        // Remove mix-blend-mode e blur que causam flicker em mobile
        blob.style.mixBlendMode = 'normal';
        blob.style.filter       = 'none';
        // Reduz opacity para compensar (sem blend a névoa fica mais visível)
        blob.style.opacity      = '0.35';
    });

    // Em aparelhos muito pequenos, oculta completamente para performance
    if (isLowEnd) {
        document.querySelector('.nevoa').style.display = 'none';
    }
})();

/* ─────────────────────────────────────────────────────────────────
   2. PARTÍCULAS DOURADAS
   ───────────────────────────────────────────────────────────────── */
(function iniciarParticulas() {
    if (prefersLess) return;

    const canvas = document.getElementById('canvas-particulas');
    const ctx    = canvas.getContext('2d');

    function redimensionar() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    redimensionar();
    window.addEventListener('resize', redimensionar);

    function corOuro(alpha) {
        const r = 180 + Math.random() * 71;
        const g = 140 + Math.random() * 50;
        const b =  20 + Math.random() * 40;
        return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`;
    }

    class Particula {
        constructor() { this.reiniciar(true); }

        reiniciar(nascimento = false) {
            this.x       = Math.random() * canvas.width;
            this.y       = nascimento
                             ? Math.random() * canvas.height
                             : canvas.height + Math.random() * 20;
            this.vx      = (Math.random() - 0.5) * 0.4;
            this.vy      = -(0.15 + Math.random() * 0.55);
            this.raio    = 0.4 + Math.random() * 1.8;
            this.vida    = 0;
            this.vidaMax = 180 + Math.random() * 240;
            this.alpha   = 0;
            // Mobile: menos partículas brilhantes (shadowBlur é caro)
            this.brilho  = isMobile ? false : Math.random() > 0.8;
            this.pulso   = Math.random() * Math.PI * 2;
        }

        atualizar() {
            this.x += this.vx + Math.sin(this.vida * 0.03 + this.pulso) * 0.3;
            this.y += this.vy;
            this.vida++;
            this.pulso += 0.04;

            const prog = this.vida / this.vidaMax;
            if      (prog < 0.2)  this.alpha = prog / 0.2;
            else if (prog > 0.75) this.alpha = (1 - prog) / 0.25;
            else                  this.alpha = 1;

            if (this.vida >= this.vidaMax || this.y < -10) this.reiniciar();
        }

        desenhar() {
            const a = Math.max(0, Math.min(1, this.alpha));
            ctx.save();

            if (this.brilho) {
                ctx.shadowBlur  = 10 + Math.sin(this.pulso) * 5;
                ctx.shadowColor = corOuro(a * 0.8);
            }
            // Mobile: sem shadowBlur para evitar lentidão

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
            ctx.fillStyle = corOuro(a * (this.brilho ? 0.9 : 0.55));
            ctx.fill();
            ctx.restore();
        }
    }

    // Pool proporcional: mobile usa menos partículas
    const divisor = isMobile ? 12000 : 6000;
    const TOTAL   = Math.min(isMobile ? 60 : 200,
                             Math.floor((canvas.width * canvas.height) / divisor));
    const particulas = Array.from({ length: TOTAL }, () => new Particula());

    function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particulas.forEach(p => { p.atualizar(); p.desenhar(); });
        requestAnimationFrame(animar);
    }
    animar();
})();


/* ─────────────────────────────────────────────────────────────────
   3. BRILHO FLUTUANTE NO TÍTULO
   ───────────────────────────────────────────────────────────────── */
(function brilhoTitulo() {
    if (prefersLess || isLowEnd) return; // pula em low-end para economizar CPU

    const linhas = document.querySelectorAll('.titulo-linha');
    let angulo = 0;

    function pulsar() {
        angulo += 0.012;
        const i = 0.4 + Math.sin(angulo) * 0.15;
        linhas.forEach(el => {
            el.style.filter =
                `drop-shadow(0 0 ${20 + Math.sin(angulo) * 12}px rgba(201,168,76,${i.toFixed(2)}))
                 drop-shadow(0 4px 8px rgba(0,0,0,0.8))`;
        });
        requestAnimationFrame(pulsar);
    }

    setTimeout(pulsar, 2000);
})();


/* ─────────────────────────────────────────────────────────────────
   4. TRANSIÇÃO DE SAÍDA + BARRA DE PROGRESSO
   ─────────────────────────────────────────────────────────────────
   CORREÇÃO MOBILE: a barra usa dois rAF aninhados para garantir
   que o browser registre width:0 antes de iniciar a transição.
   Um único rAF às vezes é colapsado com o frame anterior em mobile.
   ───────────────────────────────────────────────────────────────── */
(function transicaoSaida() {
    const btn     = document.getElementById('btn-explorar');
    const overlay = document.getElementById('transicao-saida');
    if (!btn || !overlay) return;

    const DESTINO      = btn.getAttribute('href') || 'index.html';
    const TEMPO_AUTO   = 13200; // ms totais
    const FADE_DURACAO = 1050;  // ms da transição de saída

    let navegado = false;

    function navegar() {
        if (navegado) return;
        navegado = true;
        clearTimeout(timerAuto);
        clearTimeout(timerBarra);
        overlay.classList.add('ativa');
        setTimeout(() => { window.location.href = DESTINO; }, FADE_DURACAO);
    }

    /* ── Barra de progresso ──────────────────────────────────────── */
    const barra = document.createElement('div');
    barra.id = 'barra-progresso';
    barra.innerHTML = '<div id="barra-fill"></div>';
    document.body.appendChild(barra);

    const fill = document.getElementById('barra-fill');

    const ATRASO_BARRA  = 3200;
    const DURACAO_BARRA = TEMPO_AUTO - ATRASO_BARRA; // 10 000 ms

    const timerBarra = setTimeout(() => {
        // Garante width:0 explícito antes de qualquer transição
        fill.style.transition = 'none';
        fill.style.width      = '0%';

        // Dois rAF: frame 1 → aplica width:0 e transition:none
        //           frame 2 → browser confirma o estado; só então ativa a transição
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                fill.style.transition = `width ${DURACAO_BARRA}ms linear`;
                fill.style.width      = '100%';
                barra.classList.add('visivel');
            });
        });
    }, ATRASO_BARRA);

    /* ── Timer automático ────────────────────────────────────────── */
    const timerAuto = setTimeout(navegar, TEMPO_AUTO);

    /* ── Clique / toque no botão ─────────────────────────────────── */
    btn.addEventListener('click',     (e) => { e.preventDefault(); navegar(); });
    btn.addEventListener('touchend',  (e) => { e.preventDefault(); navegar(); });
})();


/* ─────────────────────────────────────────────────────────────────
   5. ÁUDIO AMBIENTE OPCIONAL
   ───────────────────────────────────────────────────────────────── */
(function audioAmbiente() {
    const audio = document.getElementById('audio-ambiente');
    const nota  = document.getElementById('nota-audio');
    if (!audio || audio.querySelectorAll('source').length === 0) return;

    audio.volume = 0.12;

    function tentarPlay() {
        audio.play()
            .then(() => {
                if (nota) {
                    nota.style.opacity = '1';
                    nota.textContent   = '♪ Música ambiente ativa';
                    setTimeout(() => { nota.style.opacity = '0'; }, 3000);
                }
            })
            .catch(() => {});
    }

    document.addEventListener('click',      tentarPlay, { once: true });
    document.addEventListener('touchstart', tentarPlay, { once: true });
    document.addEventListener('keydown',    tentarPlay, { once: true });
})();


/* ─────────────────────────────────────────────────────────────────
   6. PARALLAX
   ─────────────────────────────────────────────────────────────────
   CORREÇÃO MOBILE: desativado em touch devices.
   Em celulares não há cursor para mover, e o loop de rAF rodando
   sem utilidade desperdiça bateria e pode causar jank nas animações.
   ───────────────────────────────────────────────────────────────── */
(function parallaxMouse() {
    if (isMobile) return; // sem mouse em touch — não faz nada

    const bgMap = document.querySelector('.bg-map');
    const nevoa = document.querySelector('.nevoa');
    if (!bgMap || !nevoa) return;

    let alvoX = 0, alvoY = 0;
    let atualX = 0, atualY = 0;

    document.addEventListener('mousemove', (e) => {
        alvoX = (e.clientX / window.innerWidth  - 0.5) * 2;
        alvoY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animar() {
        atualX += (alvoX - atualX) * 0.04;
        atualY += (alvoY - atualY) * 0.04;

        const mx = atualX * 14;
        const my = atualY * 10;

        bgMap.style.transform = `translate(${mx * 0.4}px, ${my * 0.4}px) scale(1.04)`;
        nevoa.style.transform = `translate(${mx * 0.8}px, ${my * 0.8}px)`;

        requestAnimationFrame(animar);
    }
    animar();
})();