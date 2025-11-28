// == Dados dos locais ==
const locais = [
    { nome: "Lago do Cabrina", descricao: "O Lago do Cabrinha é um pequeno lago urbano da zona norte, usado para caminhadas e lazer ao ar livre.", lat: -23.269128522844692, lng: -51.1487427778922, img: "https://source.unsplash.com/collection/190727/800x600?lake" },
    { nome: "Sorvete Italiano ZN", descricao: "Parque ecológico com trilhas naturais.", lat: -23.258567511423728, lng:  -51.14835159087403, img: "https://source.unsplash.com/featured/?forest,londrina" },
    { nome: "Centro Cultural", descricao: "Natureza preservada e lindos cenários.", lat: -23.258247188716833, lng: -51.14500494963125, img: "https://source.unsplash.com/featured/?garden" },
    { nome: "Delika", descricao: "A Padaria Delika é uma padaria tradicional da zona norte, conhecida por pães frescos, doces caseiros e atendimento rápido.", lat: -23.259513800830575,  lng: -51.145391187723135, img: "https://source.unsplash.com/featured/?city" }
  ];
  
  const container = document.getElementById("cards-container");
  const selectionStatus = document.getElementById("selectionStatus");
  const confirmBtn = document.getElementById("confirm");
  const overlay = document.getElementById("overlay");
  
  let selecionados = [];
  let distanciaValues = []; // guarda valores atuais para animação
  let distanceAnimators = []; // refs para animadores gsap
  
  // ---------- Render dos cards ----------
  function createCard(loc, index){
    const card = document.createElement("article");
    card.className = "card";
    card.setAttribute("data-index", index);
    card.innerHTML = `
      <div class="media">
        <img src="${loc.img}" alt="${loc.nome}">
      </div>
      <div class="card-content">
        <h3>${loc.nome}</h3>
        <p>${loc.descricao}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <span class="distance-pill" id="distance-${index}">-- km</span>
          <small class="muted">toque para selecionar</small>
        </div>
      </div>
    `;
    // tilt
    VanillaTilt.init(card, {
      max: 10,
      speed: 400,
      glare: true,
      "max-glare": 0.12,
      scale: 1.01
    });
  
    // selection
    card.addEventListener("click", () => {
      card.classList.toggle("selected");
      const idx = Number(card.dataset.index);
      if (selecionados.includes(idx)) selecionados = selecionados.filter(i => i !== idx);
      else selecionados.push(idx);
  
      selectionStatus.textContent = `${selecionados.length} locais selecionados`;
  
      // feedback de micro animação
      gsap.fromTo(card, { scale: 1 }, { scale: 1.035, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
  
      // pulso no botão confirmar
      gsap.fromTo(confirmBtn, { y: 0 }, { y: -6, duration: 0.18, yoyo: true, repeat: 1 });
    });
  
    container.appendChild(card);
  
    // prepara animador de distancia
    distanciaValues[index] = 0;
    distanceAnimators[index] = { value: 0 };
  }
  
  function renderAll(){
    locais.forEach((loc, i) => createCard(loc, i));
    // entrada animada dos cards em onda
    gsap.from(".card", { opacity: 0, y: 20, scale: 0.98, duration: 0.7, stagger: 0.08, ease: "power3.out" });
  }
  renderAll();
  
  // ---------- MAP BACKGROUND (Leaflet) ----------
  const mapBgEl = document.getElementById("map-bg");
  const map = L.map(mapBgEl, { zoomControl: false, attributionControl: false, scrollWheelZoom: false, dragging: false }).setView([-23.31, -51.17], 13);
  
  // tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
  
  // markers glow
  locais.forEach(l => {
    const circle = L.circle([l.lat, l.lng], { radius: 100, color: "#00bfff", weight: 1, fillColor: "#00d4ff", fillOpacity: 0.08 }).addTo(map);
    const pin = L.circleMarker([l.lat, l.lng], { radius: 6, color: "#ffffff", fillColor: "#00d4ff", fillOpacity: 1 }).addTo(map);
  });
  
  // subtle pan animation on map to feel alive
  let mapDir = 1;
  setInterval(() => {
    const c = map.getCenter();
    map.panTo([c.lat + 0.0005 * mapDir, c.lng], { animate: true, duration: 3 });
    mapDir *= -1;
  }, 5000);
  
  // ---------- DISTÂNCIAS: GPS e animação ----------
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI/180;
    const dLon = (lon2 - lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    const d = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return d; // km
  }
  
  function updateDistanceDisplay(index, valueKm) {
    // anima valor de distanceAnimators[index].value -> valueKm
    const animator = distanceAnimators[index];
    if (!animator) return;
    gsap.to(animator, {
      value: Number(valueKm),
      duration: 0.8,
      ease: "power1.out",
      onUpdate: () => {
        const v = Number(animator.value).toFixed(1);
        const el = document.getElementById(`distance-${index}`);
        if (el) el.textContent = `${v} km`;
      }
    });
  }
  
  function handlePosition(lat, lng){
    locais.forEach((loc, i) => {
      const d = haversineDistance(lat, lng, loc.lat, loc.lng);
      updateDistanceDisplay(i, d);
    });
  }
  
  // ask for current position and watch
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(pos => {
      handlePosition(pos.coords.latitude, pos.coords.longitude);
    }, err => {
      // inicial fallback: mostra '--' nas distâncias
      locais.forEach((_,i) => {
        const el = document.getElementById(`distance-${i}`);
        if (el) el.textContent = "Localização negada";
      });
    }, { enableHighAccuracy: true });
  
    // watchPosition para atualizações em tempo real
    navigator.geolocation.watchPosition(pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      handlePosition(lat, lng);
  
      // centraliza sutilmente o mapa de fundo próximo à posição do usuário, mas sem quebrar UX
      map.panTo([lat, lng], { animate: true, duration: 0.6 });
  
    }, err => {
      // silent
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 7000 });
  } else {
    locais.forEach((_,i) => {
      const el = document.getElementById(`distance-${i}`);
      if (el) el.textContent = "Geolocalização não suportada";
    });
  }
  
  // ---------- CONFIRM: animação e envio ----------
  confirmBtn.addEventListener("click", async () => {
    if (selecionados.length === 0) {
      // pulso de aviso
      gsap.fromTo(selectionStatus, { x: 0 }, { x: -8, duration: 0.12, yoyo: true, repeat: 5, ease: "power2.inOut" });
      return;
    }
  
    // overlay in
    overlay.classList.remove("hidden");
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.45 });
  
    // cards fly upward
    gsap.to(".card.selected", { y: -30, opacity: 0.12, scale: 0.96, duration: 0.6, stagger: 0.06 });
    gsap.to(".card:not(.selected)", { y: -10, opacity: 0.06, duration: 0.45, stagger: 0.02 });
  
    // pequeno delay para UX
    await new Promise(r => setTimeout(r, 900));
  
    // salvar selecionados (objetos)
    const dados = selecionados.map(i => locais[i]);
    localStorage.setItem("selecionados", JSON.stringify(dados));
  
    // redireciona para a página de navegação (substitua o caminho se necessário)
    window.location.href = "/src/pages/navegacao.html";
  });

