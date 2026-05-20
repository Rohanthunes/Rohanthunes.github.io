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