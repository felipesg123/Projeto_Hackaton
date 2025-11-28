// Atualize o seu expandir.js com este código
document.addEventListener("DOMContentLoaded", () => {
    const hitboxNorte = document.getElementById("hitboxNorte");
    const leftPanel = document.getElementById("leftPanel");
    const previewImage = document.getElementById("previewImage");
    const mapContainer = document.querySelector('.map-container');
    const menuToggle = document.getElementById('menuToggle');
    const closePanel = document.getElementById('closePanel');

    let panelOpen = false;
    let isMobile = window.innerWidth <= 768;

    // Função para abrir o painel
    function openPanel() {
        panelOpen = true;
        previewImage.src = "../public/images/norte.png";

        if (isMobile) {
            // No mobile, usa height e bottom sheet
            leftPanel.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            // No desktop, usa width normal
            gsap.to(leftPanel, {
                width: "45vw",
                duration: 0.6,
                ease: "power3.out"
            });

            gsap.to(mapContainer, {
                x: "10%",
                scale: 0.95,
                duration: 0.6,
                ease: "power3.out"
            });
        }

        gsap.fromTo(previewImage,
            { 
                opacity: 0, 
                x: -50,
                boxShadow: "none",
                border: "none",
                outline: "none"
            },
            { 
                opacity: 1, 
                x: 0, 
                duration: 0.6, 
                ease: "power3.out", 
                delay: 0.2,
                boxShadow: "none",
                border: "none",
                outline: "none"
            }
        );
    }

    // Função para fechar o painel
    function closePanelFunc() {
        if (!panelOpen) return;

        panelOpen = false;

        if (isMobile) {
            leftPanel.classList.remove('active');
            document.body.style.overflow = 'auto';
        } else {
            gsap.to(leftPanel, {
                width: "0vw",
                duration: 0.4,
                ease: "power3.inOut"
            });

            gsap.to(mapContainer, {
                x: "0%",
                scale: 1,
                duration: 0.4,
                ease: "power3.inOut"
            });
        }
    }

    // Event Listeners
    hitboxNorte.addEventListener("click", (event) => {
        event.stopPropagation();
        openPanel();
    });

    // Menu toggle para mobile (se quiser usar para outras funcionalidades)
    menuToggle.addEventListener('click', () => {
        // Aqui você pode adicionar funcionalidade para o menu hamburger
        console.log('Menu toggle clicked');
    });

    closePanel.addEventListener('click', closePanelFunc);

    // Fechar ao clicar fora (apenas no desktop)
    if (!isMobile) {
        document.addEventListener("click", closePanelFunc);
    }

    leftPanel.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    // Atualizar verificação de mobile quando a janela for redimensionada
    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= 768;
        
        // Se mudar para desktop e o painel estiver aberto, ajusta
        if (!isMobile && panelOpen) {
            leftPanel.classList.remove('active');
            document.body.style.overflow = 'auto';
            // Força o modo desktop
            gsap.to(leftPanel, {
                width: "45vw",
                duration: 0.3
            });
        }
    });
});