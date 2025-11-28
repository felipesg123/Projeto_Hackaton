// Pegando locais selecionados
let locais = JSON.parse(localStorage.getItem("selecionados")) || [];

let atual = 0; // índice do ponto atual
let concluídos = [];

const statusBox = document.getElementById("statusBox");
const destinoAtualEl = document.getElementById("destinoAtual");
const distanciaAtualEl = document.getElementById("distanciaAtual");

// Criar mapa
const map = L.map('map').setView([-23.31, -51.17], 14);

// Camada do mapa
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
}).addTo(map);

// Ícone personalizado tipo Uber
const iconDestino = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [40, 40]
});

// Ícone usuário
const iconUser = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/428/428933.png",
    iconSize: [40, 40]
});

// Criar marcadores dos destinos
let markers = locais.map(loc => {
    return L.marker([loc.lat, loc.lng], { icon: iconDestino })
        .addTo(map)
        .bindPopup(`<b>${loc.nome}</b><br>${loc.descricao}`);
});

// ------------------------------
// FUNÇÕES DE DISTÂNCIA
// ------------------------------
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI/180;
    const dLon = (lon2 - lon1) * Math.PI/180;

    const a =
        Math.sin(dLat/2) ** 2 +
        Math.cos(lat1 * Math.PI/180) *
        Math.cos(lat2 * Math.PI/180) *
        Math.sin(dLon/2) ** 2;

    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 1000; // metros
}

// Ordenar locais pela distância do usuário
function ordenarLocais(lat, lng) {
    locais.sort((a, b) => {
        const distA = getDistance(lat, lng, a.lat, a.lng);
        const distB = getDistance(lat, lng, b.lat, b.lng);
        return distA - distB;
    });

    // Atualizar marcadores conforme nova ordem
    markers.forEach(m => map.removeLayer(m));
    markers = locais.map(loc =>
        L.marker([loc.lat, loc.lng], { icon: iconDestino })
            .addTo(map)
            .bindPopup(`<b>${loc.nome}</b><br>${loc.descricao}`)
    );

    // Após ordenar, desenhar rota
}

// ------------------------------
// DESENHAR ROTA ENTRE OS LOCAIS
// ------------------------------
let rotaPolyline = null;

function desenharRota() {
    if (rotaPolyline) map.removeLayer(rotaPolyline);

    const coords = locais.map(l => [l.lat, l.lng]);

    rotaPolyline = L.polyline(coords, {
        color: "blue",
        weight: 6,
        opacity: 0.7
    }).addTo(map);

    map.fitBounds(rotaPolyline.getBounds());
}

// ------------------------------
// DESTINO ATUAL
// ------------------------------
function atualizarDestino() {
    if (atual >= locais.length) {
        destinoAtualEl.textContent = "Todos os locais concluídos! 🎉";
        distanciaAtualEl.textContent = "";
        return;
    }

    destinoAtualEl.textContent = locais[atual].nome;
}
atualizarDestino();

// ------------------------------
// RASTREAMENTO DO USUÁRIO
// ------------------------------
let userMarker = null;
let primeiraLocalizacao = true;

navigator.geolocation.watchPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    // Atualizar posição do usuário
    if (!userMarker) {
        userMarker = L.marker([lat, lng], { icon: iconUser }).addTo(map);
    } else {
        userMarker.setLatLng([lat, lng]);
    }

    map.setView([lat, lng]);

    // Ordena os locais somente na primeira localização
    if (primeiraLocalizacao) {
        ordenarLocais(lat, lng);
        primeiraLocalizacao = false;
    }

    // Distância para o próximo ponto
    const destino = locais[atual];
    const dist = getDistance(lat, lng, destino.lat, destino.lng);

    distanciaAtualEl.textContent = `Distância: ${(dist/1000).toFixed(2)} km`;

    // Se estiver perto, concluir
    if (dist < 80) {
        markers[atual].bindPopup(`<b>${destino.nome}</b><br>✔️ Concluído`).openPopup();
        concluídos.push(destino);
        atual++;
        atualizarDestino();

        // Efeito visual
        gsap.fromTo(statusBox, { scale: 1 }, { scale: 1.08, duration: 0.3, yoyo: true, repeat: 1 });
    }

}, () => {
    alert("Você precisa permitir o GPS para navegar pelos pontos turísticos.");
});
