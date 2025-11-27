// Pontos turísticos da Zona Norte de Londrina
const touristPoints = [
    {
        nome: "Parque Daisaku Ikeda",
        interesse: "natureza",
        descricao: "Um dos maiores parques da Zona Norte, ideal para caminhadas, fotos e piqueniques.",
    },
    {
        nome: "Museu Histórico Padre Carlos Weiss (Unidade Norte)",
        interesse: "cultura",
        descricao: "Espaço cultural com exposições sobre a formação da região norte de Londrina.",
    },
    {
        nome: "Lago Norte",
        interesse: "família",
        descricao: "Um ponto agradável para caminhadas e descanso, muito visitado pela comunidade.",
    },
    {
        nome: "Aeroporto José Richa (Visitação)",
        interesse: "aventura",
        descricao: "Possui áreas abertas ao público com vista para pousos e decolagens.",
    }
];

const pointsList = document.getElementById("pointsList");
const roadmap = document.getElementById("roadmap");
const filter = document.getElementById("interestFilter");

let trilha = [];

// Renderizar pontos turísticos
function renderPoints() {
    pointsList.innerHTML = "";

    const filtro = filter.value;

    touristPoints
        .filter(p => filtro === "todos" || p.interesse === filtro)
        .forEach(p => {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
                <h3>${p.nome}</h3>
                <small>Interesse: ${p.interesse}</small>
                <p>${p.descricao}</p>
                <button onclick="addToRoadmap('${p.nome}')">Adicionar à trilha</button>
            `;
            pointsList.appendChild(div);
        });
}

filter.addEventListener("change", renderPoints);

// Função para adicionar etapa à trilha
function addToRoadmap(nome) {
    trilha.push(nome);
    renderRoadmap();
}

// Renderizar trilha
function renderRoadmap() {
    roadmap.innerHTML = "";

    trilha.forEach((etapa, index) => {
        const div = document.createElement("div");
        div.className = "roadmap-step";
        div.textContent = `Etapa ${index + 1}: ${etapa}`;
        roadmap.appendChild(div);
    });
}

// Inicializa
renderPoints();
renderRoadmap();
