document.addEventListener("DOMContentLoaded", () => {

    const touristPoints = [
        {
            nome: "Parque Daisaku Ikeda",
            descricao: "Perfeito para caminhadas, natureza e contemplação.",
            imagem: "https://source.unsplash.com/featured/?park",
            lat: -23.2514,
            lng: -51.1983
        },
        {
            nome: "Museu Padre Carlos Weiss",
            descricao: "Exposição histórica e cultural da região norte.",
            imagem: "https://source.unsplash.com/featured/?museum",
            lat: -23.24805,
            lng: -51.19593
        },
        {
            nome: "Lago Norte",
            descricao: "Ambiente familiar para descanso e lazer.",
            imagem: "https://source.unsplash.com/featured/?lake",
            lat: -23.237,
            lng: -51.193
        },
        {
            nome: "Aeroporto José Richa",
            descricao: "Veja pousos e decolagens de pertinho!",
            imagem: "https://source.unsplash.com/featured/?airplane",
            lat: -23.3336,
            lng: -51.1300
        }
    ];

    const list = document.getElementById("locais-list");
    const roadmap = document.getElementById("roadmap");
    const hoverModal = document.getElementById("hoverModal");

    let trilha = [];
    let selectedPoint = null;

    // Modal adicionar
    const modal = document.getElementById("modal");
    const modalDuration = document.getElementById("modalDuration");
    const modalDate = document.getElementById("modalDate");
    const modalTime = document.getElementById("modalTime");
    const dateWarning = document.getElementById("dateWarning");

    let hoverMap = null;
    let hoverMarker = null;

    /* =========================================================
       FUNÇÕES DE DISTÂNCIA E VALIDAÇÃO POR GPS
    ========================================================= */

    function distanceInMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    function validarPresencaGPS(item, callback) {
        if (!navigator.geolocation) {
            alert("Seu dispositivo não suporta geolocalização.");
            callback(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const userLat = pos.coords.latitude;
                const userLng = pos.coords.longitude;

                const distancia = distanceInMeters(userLat, userLng, item.lat, item.lng);

                console.log("Distância até o ponto:", distancia);

                if (distancia <= 50) {
                    callback(true);
                } else {
                    alert(
                        `Você precisa estar no local para concluir este ponto.\n` +
                        `Distância atual: ${Math.round(distancia)} metros`
                    );
                    callback(false);
                }
            },
            () => {
                alert("Não foi possível obter sua localização.");
                callback(false);
            }
        );
    }


    /* =========================================================
       LOCALSTORAGE
    ========================================================= */

    function loadTrilha() {
        const saved = localStorage.getItem("trilhaUser");
        return saved ? JSON.parse(saved) : [];
    }

    function saveTrilha() {
        localStorage.setItem("trilhaUser", JSON.stringify(trilha));
    }

    function saveVoucher() {
        const voucher = {
            code: "VCH-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
            date: new Date().toLocaleDateString()
        };
        localStorage.setItem("voucherUser", JSON.stringify(voucher));
        alert("🎉 Parabéns! Você concluiu sua trilha e recebeu um voucher!");
    }

    trilha = loadTrilha();


    document.getElementById("modalCancel").onclick = () => modal.style.display = "none";

    document.getElementById("modalConfirm").onclick = () => {
        if (!modalDuration.value || !modalDate.value || !modalTime.value) {
            alert("Preencha tudo!");
            return;
        }

        trilha.push({
            nome: selectedPoint.nome,
            duracao: modalDuration.value,
            data: modalDate.value,
            hora: modalTime.value,
            lat: selectedPoint.lat,
            lng: selectedPoint.lng,
            visitado: false,
            dateTime: new Date(`${modalDate.value}T${modalTime.value}`)
        });

        trilha.sort((a, b) => a.dateTime - b.dateTime);

        saveTrilha();
        renderTimeline();

        modal.style.display = "none";
    };


    /* =========================================================
       RENDERIZAR LISTA DE PONTOS
    ========================================================= */

    function renderPoints() {
        list.innerHTML = "";

        touristPoints.forEach(point => {
            const card = document.createElement("div");
            card.className = "local-card";
            card.innerHTML = `<h3>${point.nome}</h3>`;

            card.addEventListener("mousemove", (e) => {
                hoverModal.style.opacity = "1";
                hoverModal.style.left = e.pageX + 15 + "px";
                hoverModal.style.top = e.pageY + 15 + "px";

                document.getElementById("hoverImg").src = point.imagem;
                document.getElementById("hoverTitle").textContent = point.nome;
                document.getElementById("hoverDesc").textContent = point.descricao;

                initHoverMap(point.lat, point.lng);
            });

            card.addEventListener("mouseleave", () => {
                hoverModal.style.opacity = "0";
            });

            card.onclick = () => openAddModal(point);
            list.appendChild(card);
        });
    }


    /* =========================================================
       MAPA DO HOVER
    ========================================================= */

    function initHoverMap(lat, lng) {
        if (!hoverMap) {
            hoverMap = L.map("hoverMap", {
                zoomControl: false,
                attributionControl: false
            }).setView([lat, lng], 15);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
                .addTo(hoverMap);

            hoverMarker = L.marker([lat, lng]).addTo(hoverMap);
        } else {
            hoverMap.setView([lat, lng], 15);
            hoverMarker.setLatLng([lat, lng]);
        }
    }


    /* =========================================================
       MODAL
    ========================================================= */

    function openAddModal(point) {
        selectedPoint = point;

        if (trilha.length > 0) {
            modalDate.value = trilha[0].data;
            modalDate.disabled = true;
            dateWarning.textContent = `A trilha começa no dia ${trilha[0].data}`;
        } else {
            modalDate.disabled = false;
            dateWarning.textContent = "";
        }

        modalDuration.value = "";
        modalTime.value = "";

        modal.style.display = "flex";
    }


    /* =========================================================
       TIMELINE COM CHECKLIST + GPS
    ========================================================= */

    function renderTimeline() {
        roadmap.innerHTML = "";

        trilha.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "timeline-item";

            div.innerHTML = `
                <strong>${item.hora}</strong> – <b>${item.nome}</b>
                <br><small>Duração: ${item.duracao} min</small>
                <br>
                <label class="checkwrap">
                    <input type="checkbox" ${item.visitado ? "checked" : ""} data-id="${index}">
                    Concluído
                </label>
            `;

            const checkbox = div.querySelector("input");

            checkbox.addEventListener("change", (e) => {
                const i = e.target.dataset.id;

                if (checkbox.checked) {
                    validarPresencaGPS(trilha[i], (ok) => {
                        if (ok) {
                            trilha[i].visitado = true;
                            saveTrilha();

                            if (trilha.every(t => t.visitado)) {
                                saveVoucher();
                            }
                        } else {
                            checkbox.checked = false;
                        }
                    });
                } else {
                    trilha[i].visitado = false;
                    saveTrilha();
                }
            });

            roadmap.appendChild(div);
        });
    }


    /* =========================================================
       START
    ========================================================= */
    renderPoints();
    renderTimeline();

});


