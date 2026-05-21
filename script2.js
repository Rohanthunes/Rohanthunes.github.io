// ── Mapa de países: id da section → classe CSS + nome do badge ─────
const PAISES = {
    'alemanha':   { classe: 'pais-alemanha',   nome: '🇩🇪 Alemanha' },
    'franca':     { classe: 'pais-franca',     nome: '🇫🇷 França' },
    'reino-unido':{ classe: 'pais-reino-unido',nome: '🇬🇧 Reino Unido' },
    'italia':     { classe: 'pais-italia',     nome: '🇮🇹 Itália' },
    'espanha':    { classe: 'pais-espanha',    nome: '🇪🇸 Espanha' },
    'russia':     { classe: 'pais-russia',     nome: '🇷🇺 Rússia' },
    'portugal':   { classe: 'pais-portugal',   nome: '🇵🇹 Portugal' },
};

// ── Elementos ─────────────────────────────────────────────────────
const body       = document.body;
const badge      = document.getElementById('badge-pais');
const btnTopo    = document.getElementById('btn-topo');
const sections   = document.querySelectorAll('.section');
const navLinks   = document.querySelectorAll('nav a');

let paisAtual = null;
let ticking   = false;

// ── Troca de tema do país ─────────────────────────────────────────
function aplicarPais(id) {
    if (paisAtual === id) return;
    paisAtual = id;

    // Remove todas as classes de país
    Object.values(PAISES).forEach(p => body.classList.remove(p.classe));

    const pais = PAISES[id];
    if (pais) {
        body.classList.add(pais.classe);
        badge.textContent = pais.nome;
        badge.classList.add('visivel');
    } else {
        // Europa geral: sem classe de país, esconde badge
        badge.classList.remove('visivel');
    }
}

// ── Scroll: detecta seção ativa ───────────────────────────────────
function atualizarTudo() {
    const scrollY = window.scrollY;
    let secaoAtiva = '';

    sections.forEach(section => {
        if (scrollY >= section.offsetTop - 200) {
            secaoAtiva = section.id;
        }
    });

    // Background dinâmico por país
    aplicarPais(secaoAtiva);

    // Highlight do nav
    navLinks.forEach(link => {
        const href = link.getAttribute('href').replace('#', '');
        if (href === secaoAtiva) {
            link.classList.add('ativo');
        } else {
            link.classList.remove('ativo');
            link.style.background = '';
            link.style.color = '';
        }
    });

    // Botão voltar ao topo
    if (scrollY > 400) {
        btnTopo.classList.add('visivel');
    } else {
        btnTopo.classList.remove('visivel');
    }
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
            atualizarTudo();
            ticking = false;
        });
    }
});

// ── Menu hamburger (mobile) ───────────────────────────────────────
(function menuHamburger() {
    const btn   = document.getElementById('nav-hamburger');
    const lista = document.getElementById('nav-lista');
    if (!btn || !lista) return;

    btn.addEventListener('click', () => {
        const aberto = lista.classList.toggle('aberta');
        btn.classList.toggle('aberto', aberto);
        btn.setAttribute('aria-expanded', aberto);
        btn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });

    // Fecha ao clicar em qualquer link
    lista.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            lista.classList.remove('aberta');
            btn.classList.remove('aberto');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Abrir menu');
        });
    });

    // Fecha ao clicar fora do nav
    document.addEventListener('click', (e) => {
        if (!e.target.closest('nav')) {
            lista.classList.remove('aberta');
            btn.classList.remove('aberto');
            btn.setAttribute('aria-expanded', 'false');
        }
    });
})();

// ── Smooth scroll ─────────────────────────────────────────────────
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ── IntersectionObserver: timeline + histórias + listas de conteúdo
const observerTimeline = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('show');
    });
}, { threshold: 0.08 });

document.querySelectorAll('.timeline-item, .item-historia, .item-conteudo').forEach(item => {
    observerTimeline.observe(item);
});

// ── Contadores animados ───────────────────────────────────────────

/**
 * Envolve cada .contador em um wrapper com barra de progresso e label,
 * sem alterar o HTML original.
 */
function prepararContadores() {
    document.querySelectorAll('.contador').forEach(el => {
        if (el.closest('.contador-wrapper')) return; // já processado

        const wrapper = document.createElement('span');
        wrapper.className = 'contador-wrapper';

        const barra = document.createElement('span');
        barra.className = 'contador-barra';
        barra.innerHTML = '<span class="contador-barra-fill"></span>';

        const label = document.createElement('span');
        label.className = 'contador-label';
        label.textContent = 'concluído';

        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);
        wrapper.appendChild(barra);
        wrapper.appendChild(label);
    });
}

/**
 * Dispara partículas coloridas ao redor do wrapper ao finalizar.
 * As cores são lidas das CSS variables do tema ativo.
 */
function dispararParticulas(wrapper) {
    const estilo  = getComputedStyle(document.body);
    const corA    = estilo.getPropertyValue('--card-a').trim()  || '#667eea';
    const corB    = estilo.getPropertyValue('--card-b').trim()  || '#764ba2';
    const corBord = estilo.getPropertyValue('--border').trim()  || '#667eea';
    const cores   = [corA, corB, corBord, '#ffffff'];
    const TOTAL   = 14;

    for (let i = 0; i < TOTAL; i++) {
        const p       = document.createElement('span');
        p.className   = 'contador-particula';
        const angulo  = (360 / TOTAL) * i + (Math.random() - 0.5) * 20;
        const dist    = 28 + Math.random() * 32;
        const rad     = angulo * (Math.PI / 180);
        const tx      = Math.round(Math.cos(rad) * dist);
        const ty      = Math.round(Math.sin(rad) * dist);
        const dur     = (0.5 + Math.random() * 0.4).toFixed(2);
        const cor     = cores[Math.floor(Math.random() * cores.length)];
        const tam     = (3 + Math.random() * 4).toFixed(1);

        p.style.cssText = `
            --tx:${tx}px; --ty:${ty}px; --dur:${dur}s;
            background:${cor}; width:${tam}px; height:${tam}px;
            top:50%; left:50%;
            margin-top:-${tam/2}px; margin-left:-${tam/2}px;
            box-shadow:0 0 4px ${cor};
        `;
        wrapper.appendChild(p);
        setTimeout(() => p.remove(), parseFloat(dur) * 1000 + 100);
    }
}

/**
 * Anima o número com easing ease-out cubic, fases visuais
 * (contando → quase → finalizado) e partículas ao terminar.
 */
function animarNumero(el, final, duracao = 2000, casasDecimais = 0) {
    const wrapper   = el.closest('.contador-wrapper');
    const barraFill = wrapper ? wrapper.querySelector('.contador-barra-fill') : null;
    const inicio    = performance.now();

    el.classList.add('contando');
    el.classList.remove('quase', 'finalizado');

    function tick(agora) {
        const progresso  = Math.min((agora - inicio) / duracao, 1);
        const eased      = 1 - Math.pow(1 - progresso, 3); // ease-out cubic
        const valorAtual = eased * final;

        el.innerText = valorAtual.toLocaleString('pt-BR', {
            minimumFractionDigits: casasDecimais,
            maximumFractionDigits: casasDecimais
        });

        if (barraFill) barraFill.style.width = `${(progresso * 100).toFixed(1)}%`;

        // Fase "quase lá" — acima de 80%
        if (progresso >= 0.80 && !el.classList.contains('quase')) {
            el.classList.remove('contando');
            el.classList.add('quase');
        }

        if (progresso < 1) {
            requestAnimationFrame(tick);
        } else {
            // Finalizado
            el.innerText = final.toLocaleString('pt-BR', {
                minimumFractionDigits: casasDecimais,
                maximumFractionDigits: casasDecimais
            });
            if (barraFill) barraFill.style.width = '100%';

            el.classList.remove('contando', 'quase');
            el.classList.add('finalizado');
            if (wrapper) {
                wrapper.classList.add('finalizado');
                dispararParticulas(wrapper);
            }

            setTimeout(() => {
                el.classList.remove('finalizado');
                if (wrapper) wrapper.classList.remove('finalizado');
            }, 2000);
        }
    }

    requestAnimationFrame(tick);
}

prepararContadores();

const observerNumeros = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const valor = Number(el.getAttribute('data-valor'));
        const tempo = Number(el.getAttribute('data-duracao')) || 2000;
        const casas = Number(el.getAttribute('data-casas'))   || 0;
        if (isNaN(valor) || valor === 0) return;
        animarNumero(el, valor, tempo, casas);
        observerNumeros.unobserve(el);
    });
}, { threshold: 0.3 });

document.querySelectorAll('.contador').forEach(num => observerNumeros.observe(num));

// ── Botão voltar ao topo ──────────────────────────────────────────
btnTopo.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Rodar uma vez no carregamento
atualizarTudo();

// ══════════════════════════════════════════════════════════════════
// LINHA DO TEMPO HORIZONTAL — scroll por botões + drag + barra
// ══════════════════════════════════════════════════════════════════
(function timelineGlobal() {
    const track = document.getElementById('tg-track');
    const btnL  = document.getElementById('tg-left');
    const btnR  = document.getElementById('tg-right');
    const fill  = document.getElementById('tg-barra-fill');
    if (!track) return;

    const PASSO = 280;

    btnL && btnL.addEventListener('click', () => track.scrollBy({ left: -PASSO, behavior: 'smooth' }));
    btnR && btnR.addEventListener('click', () => track.scrollBy({ left:  PASSO, behavior: 'smooth' }));

    // Barra de progresso
    function atualizarBarra() {
        if (!fill) return;
        const max = track.scrollWidth - track.clientWidth;
        const pct = max > 0 ? (track.scrollLeft / max) * 70 + 30 : 30;
        fill.style.width = pct + '%';
    }
    track.addEventListener('scroll', atualizarBarra, { passive: true });
    atualizarBarra();

    // Drag-to-scroll
    let arrastando = false, inicioX = 0, scrollInicio = 0, moveu = false;
    track.addEventListener('mousedown', e => {
        arrastando = true; moveu = false;
        inicioX = e.pageX - track.offsetLeft;
        scrollInicio = track.scrollLeft;
        track.style.cursor = 'grabbing';
    });
    document.addEventListener('mouseup', () => {
        arrastando = false;
        track.style.cursor = 'grab';
    });
    track.addEventListener('mousemove', e => {
        if (!arrastando) return;
        e.preventDefault();
        moveu = true;
        const x = e.pageX - track.offsetLeft;
        track.scrollLeft = scrollInicio - (x - inicioX);
    });

    // ── Tooltip via position:fixed posicionado pelo JS ─────────────
    // Cada .tg-item tem seu próprio .tg-tooltip no HTML;
    // ao hover, calcula posição no viewport e exibe acima ou abaixo do ponto.
    document.querySelectorAll('.tg-item').forEach(item => {
        const tip = item.querySelector('.tg-tooltip');
        if (!tip) return;

        item.addEventListener('mouseenter', (e) => {
            if (moveu) return; // não abre tooltip durante drag
            const rect = item.getBoundingClientRect();
            const tw   = 210; // largura do tooltip (igual ao CSS)
            const th   = tip.offsetHeight || 120;

            // Posição horizontal: centralizado no item, ajustado para não sair da tela
            let left = rect.left + rect.width / 2 - tw / 2;
            left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));

            // Posição vertical: acima do ponto por padrão
            let top = rect.top - th - 14;
            // Se sair pelo topo, abre abaixo
            if (top < 8) top = rect.bottom + 10;

            tip.style.left = left + 'px';
            tip.style.top  = top  + 'px';
            tip.classList.add('visivel');
        });

        item.addEventListener('mouseleave', () => {
            tip.classList.remove('visivel');
        });

        // Reseta flag de drag no mouseenter
        item.addEventListener('mouseenter', () => { moveu = false; });
    });
})();

// ══════════════════════════════════════════════════════════════════
// MAPA SVG INTERATIVO — hover tooltip + click navega
// ══════════════════════════════════════════════════════════════════
(function mapaInterativo() {
    const tooltip = document.getElementById('mapa-tooltip');
    const paises  = document.querySelectorAll('.map-pais');
    if (!tooltip || !paises.length) return;

    paises.forEach(el => {
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');

        // Hover / focus: mostra tooltip
        function mostrar(e) {
            tooltip.textContent = el.getAttribute('data-nome');
            tooltip.classList.add('visivel');
        }
        function mover(e) {
            const rect = tooltip.closest('.mapa-wrapper').getBoundingClientRect();
            const svg  = el.closest('svg').getBoundingClientRect();
            // Posiciona relativo ao wrapper
            const px = e.clientX - rect.left + 10;
            const py = e.clientY - rect.top  - 36;
            tooltip.style.left = px + 'px';
            tooltip.style.top  = py + 'px';
        }
        function ocultar() { tooltip.classList.remove('visivel'); }

        el.addEventListener('mouseenter', mostrar);
        el.addEventListener('mousemove',  mover);
        el.addEventListener('mouseleave', ocultar);
        el.addEventListener('focus',      mostrar);
        el.addEventListener('blur',       ocultar);

        // Click / Enter → navegar para a seção
        function navegar() {
            const href = el.getAttribute('data-href');
            const alvo = document.querySelector(href);
            if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        el.addEventListener('click', navegar);
        el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') navegar(); });
    });
})();

// ══════════════════════════════════════════════════════════════════
// QUIZ — responder, feedback, resultado e reiniciar
// ══════════════════════════════════════════════════════════════════

/** Chamada pelo onclick de cada botão de opção */
function quizResponder(btn) {
    const pergunta = btn.closest('.quiz-pergunta');
    const bloco    = btn.closest('.quiz-bloco');
    if (!bloco || !pergunta) return;

    // Bloqueia todas as opções desta pergunta
    pergunta.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);

    const correto   = btn.getAttribute('data-correto') === 'true';
    const feedback  = pergunta.querySelector('.quiz-feedback');

    btn.classList.add(correto ? 'certo' : 'errado');

    // Destaca a resposta certa se errou
    if (!correto) {
        pergunta.querySelectorAll('.quiz-opt').forEach(b => {
            if (b.getAttribute('data-correto') === 'true') b.classList.add('certo');
        });
    }

    feedback.textContent = correto ? '✅ Correto!' : '❌ Incorreto!';
    feedback.style.color = correto ? '#27ae60' : '#e74c3c';

    // Atualiza contadores no bloco
    const respondidas = parseInt(bloco.dataset.respondidas) + 1;
    const acertos     = parseInt(bloco.dataset.acertos) + (correto ? 1 : 0);
    bloco.dataset.respondidas = respondidas;
    bloco.dataset.acertos     = acertos;

    // Resultado final quando todas foram respondidas
    const total = parseInt(bloco.dataset.total);
    if (respondidas >= total) {
        const pais = bloco.dataset.pais;
        const res  = document.getElementById('qr-' + pais);
        const btn2 = bloco.querySelector('.quiz-reiniciar');
        if (!res) return;

        res.classList.add('show');
        if (acertos === total) {
            res.className = 'quiz-resultado show nota-otima';
            res.textContent = `🏆 Excelente! ${acertos}/${total} — Você domina este tema!`;
        } else if (acertos >= Math.ceil(total / 2)) {
            res.className = 'quiz-resultado show nota-boa';
            res.textContent = `👍 Bom trabalho! ${acertos}/${total} — Quase lá!`;
        } else {
            res.className = 'quiz-resultado show nota-ruim';
            res.textContent = `📚 ${acertos}/${total} — Vale a pena rever o conteúdo!`;
        }
        if (btn2) btn2.style.display = 'block';
    }
}

/** Reinicia um quiz específico */
function quizReiniciar(paisId) {
    const bloco = document.getElementById('quiz-' + paisId);
    if (!bloco) return;

    bloco.dataset.respondidas = 0;
    bloco.dataset.acertos     = 0;

    bloco.querySelectorAll('.quiz-opt').forEach(b => {
        b.disabled = false;
        b.classList.remove('certo', 'errado');
    });
    bloco.querySelectorAll('.quiz-feedback').forEach(f => {
        f.textContent = '';
    });

    const res  = document.getElementById('qr-' + paisId);
    const btn2 = bloco.querySelector('.quiz-reiniciar');
    if (res)  { res.className = 'quiz-resultado'; res.textContent = ''; }
    if (btn2) btn2.style.display = 'none';
}