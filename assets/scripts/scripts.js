document.addEventListener("DOMContentLoaded", () => {

    // Dados
    const touristPoints = [
        { nome: "Parque Daisaku Ikeda", interesse: "natureza", descricao: "Parque amplo ideal para caminhadas e lazer." },
        { nome: "Museu Padre Carlos Weiss - Unidade Norte", interesse: "cultura", descricao: "Exposições sobre a história de Londrina." },
        { nome: "Lago Norte", interesse: "família", descricao: "Lago ideal para descanso e caminhada." },
        { nome: "Aeroporto José Richa (Visitação)", interesse: "aventura", descricao: "Espaço para assistir pousos e decolagens." }
    ];

    const pointsList = document.getElementById("pointsList");
    const filter = document.getElementById("interestFilter");
    const roadmap = document.getElementById("roadmap");

    let trilha = [];
    let selectedPoint = null;

    // Modal
    const modal = document.getElementById("modal");
    const modalDuration = document.getElementById("modalDuration");
    const modalDate = document.getElementById("modalDate");
    const modalTime = document.getElementById("modalTime");
    const modalCancel = document.getElementById("modalCancel");
    const modalConfirm = document.getElementById("modalConfirm");

    function openModal(pointName) {
        selectedPoint = pointName;
        modal.style.display = "flex";
    }

    function closeModal() {
        modal.style.display = "none";
        modalDuration.value = "";
        modalDate.value = "";
        modalTime.value = "";
    }

    modalCancel.onclick = closeModal;

    modalConfirm.onclick = () => {
        if (!modalDuration.value || !modalDate.value || !modalTime.value) {
            alert("Preencha todos os campos!");
            return;
        }

        trilha.push({
            nome: selectedPoint,
            duracao: modalDuration.value,
            data: modalDate.value,
            hora: modalTime.value,
            dateTime: new Date(`${modalDate.value}T${modalTime.value}`)
        });

        trilha.sort((a, b) => a.dateTime - b.dateTime);

        renderRoadmap();
        closeModal();
    };

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
                    <button class="btn-add">Adicionar à trilha</button>
                `;

                div.querySelector(".btn-add").onclick = () => openModal(p.nome);

                pointsList.appendChild(div);
            });
    }

    filter.addEventListener("change", renderPoints);

    // Renderizar timeline
    function renderRoadmap() {
        roadmap.innerHTML = "";

        trilha.forEach(item => {
            const div = document.createElement("div");
            div.className = "timeline-item";
            div.innerHTML = `
                <strong>${item.hora}</strong> – <b>${item.nome}</b><br>
                <small>Duração: ${item.duracao} min</small>
            `;
            roadmap.appendChild(div);
        });
    }

    renderPoints();
});
