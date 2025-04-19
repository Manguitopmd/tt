console.log("eventos.js iniciado");

let eventosData = [];
let filtros = JSON.parse(localStorage.getItem("filtros")) || {
    busqueda: "",
    distrito: "todos",
    categorias: [],
    fecha: "todos",
    fechaInicio: "",
    fechaFin: ""
};

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function initPage() {
    console.log("initPage ejecutado");
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "flex";
    fetch("assets/data/eventos.json")
        .then(response => {
            console.log(`Fetch response: ${response.status} ${response.statusText}`);
            if (!response.ok) throw new Error(`Error al cargar eventos.json: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log("Datos cargados:", data);
            eventosData = data;
            setupBusqueda();
            setupFiltros();
            renderEventos();
            if (loader) loader.style.display = "none";
        })
        .catch(error => {
            console.error("Error al cargar eventos:", error);
            document.getElementById("eventos-grid").innerHTML = `<p class="text-red-500 text-center">Error al cargar eventos: ${error.message}</p>`;
            if (loader) loader.style.display = "none";
        });
}

function setupBusqueda() {
    const filtroBusqueda = document.getElementById("filtro-busqueda");
    if (!filtroBusqueda) {
        console.error("Elemento de búsqueda no encontrado");
        return;
    }
    filtroBusqueda.value = filtros.busqueda;
    filtroBusqueda.addEventListener("input", (e) => {
        filtros.busqueda = e.target.value.toLowerCase();
        renderEventos();
        console.log("Filtro búsqueda cambiado:", filtros.busqueda);
    });
}

function setupFiltros() {
    const filtroDistritoBtn = document.getElementById("filtro-distrito");
    const filtroFechaBtn = document.getElementById("filtro-fecha");
    const filtroCategoriaBtn = document.getElementById("filtro-categoria");
    const borrarFiltrosBtn = document.getElementById("borrar-filtros");
    const modalDistrito = document.getElementById("modal-distrito");
    const modalFecha = document.getElementById("modal-fecha");
    const modalCategoria = document.getElementById("modal-categoria");
    const cerrarModalDistrito = document.getElementById("cerrar-modal-distrito");
    const cerrarModalFecha = document.getElementById("cerrar-modal-fecha");
    const cerrarModalCategoria = document.getElementById("cerrar-modal-categoria");
    const aplicarDistrito = document.getElementById("aplicar-distrito");
    const aplicarFecha = document.getElementById("aplicar-fecha");
    const aplicarCategoria = document.getElementById("aplicar-categoria");
    const rangoFecha = document.getElementById("rango-fecha");
    const fechaCustom = document.getElementById("fecha-custom");

    if (!filtroDistritoBtn || !filtroFechaBtn || !filtroCategoriaBtn || !borrarFiltrosBtn || !modalDistrito || !modalFecha || !modalCategoria || !cerrarModalDistrito || !cerrarModalFecha || !cerrarModalCategoria || !aplicarDistrito || !aplicarFecha || !aplicarCategoria || !rangoFecha || !fechaCustom) {
        console.error("Elementos de filtros no encontrados");
        return;
    }

    // Inicializar distrito
    const selectedDistritoRadio = document.querySelector(`input[name="distrito"][value="${filtros.distrito}"]`);
    if (selectedDistritoRadio) selectedDistritoRadio.checked = true;

    // Inicializar fecha
    const selectedFechaRadio = document.querySelector(`input[name="fecha"][value="${filtros.fecha}"]`);
    if (selectedFechaRadio) selectedFechaRadio.checked = true;
    if (filtros.fecha === "custom") {
        rangoFecha.classList.remove("hidden");
        document.getElementById("fecha-inicio").value = filtros.fechaInicio;
        document.getElementById("fecha-fin").value = filtros.fechaFin;
    }

    // Inicializar categorías
    filtros.categorias.forEach(cat => {
        const checkbox = document.querySelector(`input[name="categoria"][value="${cat}"]`);
        if (checkbox) checkbox.checked = true;
    });

    filtroDistritoBtn.addEventListener("click", () => {
        modalDistrito.classList.remove("hidden");
        modalDistrito.classList.add("show");
    });

    filtroFechaBtn.addEventListener("click", () => {
        modalFecha.classList.remove("hidden");
        modalFecha.classList.add("show");
    });

    filtroCategoriaBtn.addEventListener("click", () => {
        modalCategoria.classList.remove("hidden");
        modalCategoria.classList.add("show");
    });

    borrarFiltrosBtn.addEventListener("click", () => {
        filtros = {
            busqueda: "",
            distrito: "todos",
            categorias: [],
            fecha: "todos",
            fechaInicio: "",
            fechaFin: ""
        };
        document.getElementById("filtro-busqueda").value = "";
        document.querySelector('input[name="distrito"][value="todos"]').checked = true;
        document.querySelectorAll('input[name="categoria"]').forEach(checkbox => checkbox.checked = false);
        document.querySelector('input[name="fecha"][value="todos"]').checked = true;
        document.getElementById("fecha-inicio").value = "";
        document.getElementById("fecha-fin").value = "";
        rangoFecha.classList.add("hidden");
        renderEventos();
        localStorage.setItem("filtros", JSON.stringify(filtros));
        console.log("Filtros reseteados");
    });

    cerrarModalDistrito.addEventListener("click", () => {
        modalDistrito.classList.remove("show");
        modalDistrito.classList.add("hidden");
    });

    cerrarModalFecha.addEventListener("click", () => {
        modalFecha.classList.remove("show");
        modalFecha.classList.add("hidden");
    });

    cerrarModalCategoria.addEventListener("click", () => {
        modalCategoria.classList.remove("show");
        modalCategoria.classList.add("hidden");
    });

    modalCategoria.addEventListener("click", (e) => {
        if (e.target === modalCategoria) {
            modalCategoria.classList.remove("show");
            modalCategoria.classList.add("hidden");
        }
    });

    aplicarDistrito.addEventListener("click", () => {
        const selectedDistrito = document.querySelector('input[name="distrito"]:checked')?.value || "todos";
        filtros.distrito = selectedDistrito;
        modalDistrito.classList.remove("show");
        modalDistrito.classList.add("hidden");
        renderEventos();
        console.log("Filtro distrito aplicado:", filtros.distrito);
    });

    aplicarFecha.addEventListener("click", () => {
        const selectedFecha = document.querySelector('input[name="fecha"]:checked')?.value || "todos";
        filtros.fecha = selectedFecha;
        if (selectedFecha === "custom") {
            filtros.fechaInicio = document.getElementById("fecha-inicio").value;
            filtros.fechaFin = document.getElementById("fecha-fin").value;
        } else {
            filtros.fechaInicio = "";
            filtros.fechaFin = "";
        }
        modalFecha.classList.remove("show");
        modalFecha.classList.add("hidden");
        renderEventos();
        console.log("Filtro fecha aplicado:", filtros.fecha, filtros.fechaInicio, filtros.fechaFin);
    });

    aplicarCategoria.addEventListener("click", () => {
        filtros.categorias = Array.from(document.querySelectorAll('input[name="categoria"]:checked')).map(input => input.value);
        modalCategoria.classList.remove("show");
        modalCategoria.classList.add("hidden");
        renderEventos();
        localStorage.setItem("filtros", JSON.stringify(filtros));
        console.log("Filtro categorías aplicado:", filtros.categorias);
    });

    // Filtros dinámicos para categorías
    document.querySelectorAll('input[name="categoria"]').forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            filtros.categorias = Array.from(document.querySelectorAll('input[name="categoria"]:checked')).map(input => input.value);
            renderEventos();
            localStorage.setItem("filtros", JSON.stringify(filtros));
            console.log("Filtro categoría cambiado:", filtros.categorias);
        });
    });

    fechaCustom.addEventListener("change", () => {
        rangoFecha.classList.toggle("hidden", !fechaCustom.checked);
    });
}

function renderEventos() {
    const grid = document.getElementById("eventos-grid");
    const modal = document.getElementById("evento-modal");
    const loader = document.getElementById("loader");
    if (!grid || !modal || !loader) {
        console.error("Grid, modal o loader no encontrados");
        return;
    }

    modal.classList.remove("show");
    modal.classList.add("hidden");
    grid.classList.remove("hidden");
    loader.style.display = "flex";
    grid.innerHTML = "";

    let eventosFiltrados = [...eventosData];
    let eventosDestacados = [];
    let eventosNormales = [];

    // Separar eventos destacados y normales
    eventosFiltrados.forEach(evento => {
        if (evento.featured) {
            eventosDestacados.push(evento);
        } else {
            eventosNormales.push(evento);
        }
    });

    // Filtrar destacados (más permisivos: basta con que coincidan con un criterio)
    eventosDestacados = eventosDestacados.filter(evento => {
        let matches = false;
        if (filtros.busqueda && (
            evento.title?.toLowerCase().includes(filtros.busqueda) ||
            evento.description?.toLowerCase().includes(filtros.busqueda) ||
            evento.district?.toLowerCase().includes(filtros.busqueda) ||
            evento.type?.toLowerCase().includes(filtros.busqueda)
        )) matches = true;
        if (filtros.distrito !== "todos" && evento.district.toLowerCase() === filtros.distrito.toLowerCase()) matches = true;
        if (filtros.categorias.length > 0 && filtros.categorias.includes(evento.type)) matches = true;
        if (filtros.fecha !== "todos") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let startDate, endDate;
            if (filtros.fecha === "hoy") {
                startDate = today;
                endDate = new Date(today);
                endDate.setDate(today.getDate() + 1);
            } else if (filtros.fecha === "semana") {
                startDate = today;
                endDate = new Date(today);
                endDate.setDate(today.getDate() + 7);
            } else if (filtros.fecha === "mes") {
                startDate = today;
                endDate = new Date(today);
                endDate.setMonth(today.getMonth() + 1);
            } else if (filtros.fecha === "custom") {
                startDate = new Date(filtros.fechaInicio);
                endDate = new Date(filtros.fechaFin);
                endDate.setDate(endDate.getDate() + 1);
            }
            const eventDate = new Date(evento.date);
            if (eventDate >= startDate && eventDate < endDate) matches = true;
        }
        if (filtros.busqueda === "" && filtros.distrito === "todos" && filtros.categorias.length === 0 && filtros.fecha === "todos") matches = true;
        return matches;
    });

    // Filtrar normales (estrictos: deben coincidir con todos los criterios)
    if (filtros.busqueda) {
        eventosNormales = eventosNormales.filter(evento =>
            (evento.title?.toLowerCase().includes(filtros.busqueda) ||
             evento.description?.toLowerCase().includes(filtros.busqueda) ||
             evento.district?.toLowerCase().includes(filtros.busqueda) ||
             evento.type?.toLowerCase().includes(filtros.busqueda))
        );
    }

    if (filtros.distrito !== "todos") {
        eventosNormales = eventosNormales.filter(evento => evento.district.toLowerCase() === filtros.distrito.toLowerCase());
    }

    if (filtros.categorias.length > 0) {
        eventosNormales = eventosNormales.filter(evento => filtros.categorias.includes(evento.type));
    }

    if (filtros.fecha !== "todos") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let startDate, endDate;
        if (filtros.fecha === "hoy") {
            startDate = today;
            endDate = new Date(today);
            endDate.setDate(today.getDate() + 1);
        } else if (filtros.fecha === "semana") {
            startDate = today;
            endDate = new Date(today);
            endDate.setDate(today.getDate() + 7);
        } else if (filtros.fecha === "mes") {
            startDate = today;
            endDate = new Date(today);
            endDate.setMonth(today.getMonth() + 1);
        } else if (filtros.fecha === "custom") {
            startDate = new Date(filtros.fechaInicio);
            endDate = new Date(filtros.fechaFin);
            endDate.setDate(endDate.getDate() + 1);
        }
        eventosNormales = eventosNormales.filter(evento => {
            const eventDate = new Date(evento.date);
            return eventDate >= startDate && eventDate < endDate;
        });
    }

    // Combinar destacados y normales
    eventosFiltrados = [...eventosDestacados, ...eventosNormales];

    // Ordenar normales por fecha ascendente
    eventosNormales.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log("Renderizando eventos:", eventosFiltrados.length);

    eventosFiltrados.forEach(evento => {
        // Convertir distrito a formato de clase (minúsculas, sin acentos ni espacios)
        const distritoClase = evento.district
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "");
        const card = document.createElement("div");
        card.className = `evento-card ${evento.type.toLowerCase()} ${evento.featured ? 'featured' : ''}`;
        card.innerHTML = `
            <div class="ribbon-distrito ribbon-${distritoClase}">${evento.district}</div>
            <h3>${evento.title || "Sin título"}</h3>
            <p class="fecha">${evento.date ? formatDate(evento.date) : "Fecha no disponible"}</p>
            <p class="descripcion-breve">${evento.description || "Sin descripción"}</p>
        `;
        card.addEventListener("click", () => mostrarDetalles(evento));
        grid.appendChild(card);
    });

    if (eventosFiltrados.length === 0) {
        grid.innerHTML = `<p class="text-gray-400 text-center">No se encontraron eventos.</p>`;
    }

    loader.style.display = "none";
    localStorage.setItem("filtros", JSON.stringify(filtros));
}

function mostrarDetalles(evento) {
    const grid = document.getElementById("eventos-grid");
    const modal = document.getElementById("evento-modal");
    const modalBody = document.getElementById("modal-body");
    const cerrarModal = document.getElementById("cerrar-modal");
    if (!grid || !modal || !modalBody || !cerrarModal) {
        console.error("Grid, modal o elementos no encontrados");
        return;
    }

    grid.classList.add("hidden");
    modal.classList.remove("hidden");
    modal.classList.add("show");

    // Extraer videoId de la URL de YouTube
    let videoEmbed = "";
    if (evento.video) {
        const videoIdMatch = evento.video.match(/(?:v=)([^&]+)/) || evento.video.match(/(?:embed\/)([^?]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        if (videoId) {
            videoEmbed = `<iframe id="youtube-iframe" src="https://www.youtube.com/embed/${videoId}?enablejsapi=1" title="Video de ${evento.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
    }

    modalBody.innerHTML = `
        <h2>${evento.title || "Sin título"}</h2>
        <p class="fecha">${evento.date ? formatDate(evento.date) : "Fecha no disponible"}</p>
        ${evento.image ? `<img src="${evento.image}" alt="${evento.title}">` : ""}
        ${videoEmbed}
        <p>${evento.description || "Sin descripción"}</p>
        <div class="botones">
            ${evento.whatsapp ? `<a href="${evento.whatsapp}" target="_blank" class="btn-whatsapp" aria-label="Contactar por WhatsApp"><i class="fab fa-whatsapp"></i></a>` : ""}
            ${evento.maps ? `<a href="${evento.maps}" target="_blank" class="btn-maps" aria-label="Ver ubicación en Maps"><i class="fas fa-map-marked-alt"></i></a>` : ""}
            ${evento.tickets && evento.id === 1 ? `<a href="${evento.tickets}" target="_blank" class="btn-comprar" aria-label="Comprar servicio"><i class="fas fa-shopping-cart"></i></a>` : ""}
            ${evento.tickets && evento.id !== 1 ? `<a href="${evento.tickets}" target="_blank" class="btn-entradas" aria-label="Comprar entradas"><i class="fas fa-ticket-alt"></i></a>` : ""}
        </div>
        <a href="#" class="volver text-cyan-500 hover:text-cyan-400 text-center block">Volver</a>
    `;

    cerrarModal.addEventListener("click", cerrar, { once: true });
    const volverBtn = modalBody.querySelector(".volver");
    if (volverBtn) {
        volverBtn.addEventListener("click", cerrar, { once: true });
    }

    function cerrar() {
        // Pausar video de YouTube si existe
        const iframe = document.getElementById("youtube-iframe");
        if (iframe) {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
        modal.classList.remove("show");
        modal.classList.add("hidden");
        grid.classList.remove("hidden");
        modalBody.innerHTML = ""; // Limpiar contenido
        console.log("Modal cerrado");
    }

    console.log("Mostrando detalles:", evento.title);
}

document.addEventListener("DOMContentLoaded", initPage);