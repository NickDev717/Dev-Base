const cardContainer = document.getElementById("cardContainer");
const campoBusca = document.getElementById("campoBusca");
const botaoBusca = document.getElementById("botaoBusca");

let dados = [];
let debounceTimer;

async function carregarDados() {
    mostrarEstado("loading", "Carregando catálogo");
    try {
        const resposta = await fetch("data.json");
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        dados = await resposta.json();
        renderizarCards(dados);
    } catch (error) {
        console.error("Erro ao buscar data.json:", error);
        mostrarEstado("error", "Falha ao carregar dados. Verifique o console.");
    }
}

function renderizarCards(lista) {
    if (lista.length === 0) {
        mostrarEstado("empty", "Nenhum resultado encontrado. Tente outro termo.");
        return;
    }

    cardContainer.innerHTML = lista.map(item => `
        <article class="card">
            <h2>${escaparHTML(item.nome)}</h2>
            <p class="card-desc">${escaparHTML(item.descricao)}</p>
            <div class="card-meta">
                <span class="card-year">📅 ${escaparHTML(item.data_criacao)}</span>
                <div class="tags">
                    ${item.tags.map(tag => `<span class="tag">${escaparHTML(tag)}</span>`).join('')}
                </div>
            </div>
            <a href="${escaparHTML(item.link)}" target="_blank" rel="noopener noreferrer" class="card-link">
                Saiba mais
            </a>
        </article>
    `).join('');
}

function mostrarEstado(tipo, mensagem) {
    cardContainer.className = "card-container";
    cardContainer.innerHTML = `<div class="state-message ${tipo}">${mensagem} ${tipo === 'loading' ? '<span class="loading-spinner"></span>' : ''}</div>`;
}

function escaparHTML(str) {
    const div = document.createElement('div');
    div.textContent = str.trim();
    return div.innerHTML;
}

function filtrarDados() {
    const termo = campoBusca.value.toLowerCase().trim();
    if (!termo) {
        renderizarCards(dados);
        return;
    }

    const filtrados = dados.filter(item =>
        item.nome.toLowerCase().includes(termo) ||
        item.descricao.toLowerCase().includes(termo) ||
        item.tags.some(tag => tag.toLowerCase().includes(termo))
    );

    renderizarCards(filtrados);
}

// Event Listeners
botaoBusca.addEventListener("click", filtrarDados);

campoBusca.addEventListener("keypress", (e) => {
    if (e.key === "Enter") filtrarDados();
});

campoBusca.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (campoBusca.value.trim() === "") {
            renderizarCards(dados);
        } else {
            filtrarDados();
        }
    }, 300);
});

// Init
document.addEventListener("DOMContentLoaded", carregarDados);