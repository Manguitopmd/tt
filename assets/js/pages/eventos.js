console.log("eventos.js cargado");

let filtros = JSON.parse(localStorage.getItem("filtros")) || {
    busqueda: "",
    distrito: "todos",
    categorias: [],
    fecha: "todos",
    fechaInicio: "",
    fechaFin: ""
};

function formatDate(dateStr) {
    try {
        const [year, month, day] = dateStr.split("-");
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    } catch (error) {
        console.error("Error al formatear fecha:", error);
        return "Fecha no disponible";
    }
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.classList.add("hidden");
        console.log("Loader ocultado");
    } else {
        console.warn("Loader no encontrado");
    }
}

function saveFiltros() {
    try {
        localStorage.setItem("filtros", JSON.stringify(filtros));
        console.log("Filtros guardados:", filtros);
    } catch (error) {
        console.error("Error al guardar filtros:", error);
    }
}

function validateCustomDates(start, end) {
    if (!start || !end) return false;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return startDate <= endDate && !isNaN(startDate) && !isNaN(endDate);
}

async function initPage() {
    console.log("initPage iniciado");
    try {
        const eventosGrid = document.getElementById("eventos-grid");
        if (!eventosGrid) throw new Error("Grid de eventos no encontrado");
        console.log("Total de eventos en grid:", eventosGrid.children.length);

        // Ordenar eventos: destacados primero
        sortEventos();

        setupBusqueda();
        setupFiltros();
        renderEventos();

        document.querySelectorAll(".evento-card").forEach(card => {
            card.removeEventListener("click", mostrarDetalles);
            card.addEventListener("click", () => mostrarDetalles(card));
            console.log(`Evento clic asignado a tarjeta: ${card.dataset.title}`);
        });

        console.log("initPage completado");
    } catch (error) {
        console.error("Error en initPage:", error);
        const eventosGrid = document.getElementById("eventos-grid");
        if (eventosGrid) {
            eventosGrid.innerHTML = `<p class="text-red-500 text-center">Error al cargar eventos: ${error.message}</p>`;
        }
    } finally {
        hideLoader();
    }
}

function sortEventos() {
    console.log("sortEventos iniciado");
    try {
        const eventosGrid = document.getElementById("eventos-grid");
        const cards = Array.from(eventosGrid.querySelectorAll(".evento-card"));
        // Ordenar: eventos con data-premium="true" primero
        cards.sort((a, b) => {
            const isPremiumA = a.dataset.premium === "true";
            const isPremiumB = b.dataset.premium === "true";
            return isPremiumB - isPremiumA; // true (1) antes que false (0)
        });
        // Reinsertar tarjetas en el grid
        eventosGrid.innerHTML = "";
        cards.forEach(card => eventosGrid.appendChild(card));
        console.log("Eventos ordenados: destacados primero");
    } catch (error) {
        console.error("Error en sortEventos:", error);
    }
}

function setupBusqueda() {
    console.log("setupBusqueda iniciado");
    try {
        const filtroBusqueda = document.getElementById("filtro-busqueda");
        if (!filtroBusqueda) throw new Error("Elemento de búsqueda no encontrado");

        filtroBusqueda.value = filtros.busqueda;
        filtroBusqueda.addEventListener("input", (e) => {
            filtros.busqueda = e.target.value.toLowerCase();
            saveFiltros();
            renderEventos();
            console.log("Filtro búsqueda cambiado:", filtros.busqueda);
        });
        console.log("Evento input asignado a filtro-busqueda");
    } catch (error) {
        console.error("Error en setupBusqueda:", error);
    }
}

function setupFiltros() {
    console.log("setupFiltros iniciado");
    try {
        const elements = {
            filtroDistritoBtn: document.getElementById("filtro-distrito"),
            filtroFechaBtn: document.getElementById("filtro-fecha"),
            filtroCategoriaBtn: document.getElementById("filtro-categoria"),
            borrarFiltrosBtn: document.getElementById("borrar-filtros"),
            modalDistrito: document.getElementById("modal-distrito"),
            modalFecha: document.getElementById("modal-fecha"),
            modalCategoria: document.getElementById("modal-categoria"),
            cerrarModalDistrito: document.getElementById("cerrar-modal-distrito"),
            cerrarModalFecha: document.getElementById("cerrar-modal-fecha"),
            cerrarModalCategoria: document.getElementById("cerrar-modal-categoria"),
            aplicarDistrito: document.getElementById("aplicar-distrito"),
            aplicarFecha: document.getElementById("aplicar-fecha"),
            aplicarCategoria: document.getElementById("aplicar-categoria"),
            rangoFecha: document.getElementById("rango-fecha"),
            fechaCustom: document.getElementById("fecha-custom")
        };

        for (const [key, el] of Object.entries(elements)) {
            if (!el) throw new Error(`Elemento ${key} no encontrado`);
        }

        const {
            filtroDistritoBtn, filtroFechaBtn, filtroCategoriaBtn, borrarFiltrosBtn,
            modalDistrito, modalFecha, modalCategoria, cerrarModalDistrito,
            cerrarModalFecha, cerrarModalCategoria, aplicarDistrito, aplicarFecha,
            aplicarCategoria, rangoFecha, fechaCustom
        } = elements;

        const selectedDistritoRadio = document.querySelector(`input[name="distrito"][value="${filtros.distrito}"]`);
        if (selectedDistritoRadio) selectedDistritoRadio.checked = true;

        const selectedFechaRadio = document.querySelector(`input[name="fecha"][value="${filtros.fecha}"]`);
        if (selectedFechaRadio) selectedFechaRadio.checked = true;
        if (filtros.fecha === "custom") {
            rangoFecha.classList.remove("hidden");
            document.getElementById("fecha-inicio").value = filtros.fechaInicio;
            document.getElementById("fecha-fin").value = filtros.fechaFin;
        }

        filtros.categorias.forEach(cat => {
            const checkbox = document.querySelector(`input[name="categoria"][value="${cat}"]`);
            if (checkbox) checkbox.checked = true;
        });

        filtroDistritoBtn.addEventListener("click", () => {
            modalDistrito.classList.remove("hidden");
            modalDistrito.classList.add("show");
            console.log("Modal distrito abierto");
        });

        filtroFechaBtn.addEventListener("click", () => {
            modalFecha.classList.remove("hidden");
            modalFecha.classList.add("show");
            console.log("Modal fecha abierto");
        });

        filtroCategoriaBtn.addEventListener("click", () => {
            modalCategoria.classList.remove("hidden");
            modalCategoria.classList.add("show");
            console.log("Modal categoría abierto");
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
            saveFiltros();
            renderEventos();
            console.log("Filtros reseteados");
        });

        cerrarModalDistrito.addEventListener("click", () => {
            modalDistrito.classList.remove("show");
            modalDistrito.classList.add("hidden");
            console.log("Modal distrito cerrado");
        });

        cerrarModalFecha.addEventListener("click", () => {
            modalFecha.classList.remove("show");
            modalFecha.classList.add("hidden");
            console.log("Modal fecha cerrado");
        });

        cerrarModalCategoria.addEventListener("click", () => {
            modalCategoria.classList.remove("show");
            modalCategoria.classList.add("hidden");
            console.log("Modal categoría cerrado");
        });

        modalDistrito.addEventListener("click", (e) => {
            if (e.target === modalDistrito) {
                modalDistrito.classList.remove("show");
                modalDistrito.classList.add("hidden");
                console.log("Modal distrito cerrado por clic fuera");
            }
        });

        modalFecha.addEventListener("click", (e) => {
            if (e.target === modalFecha) {
                modalFecha.classList.remove("show");
                modalFecha.classList.add("hidden");
                console.log("Modal fecha cerrado por clic fuera");
            }
        });

        modalCategoria.addEventListener("click", (e) => {
            if (e.target === modalCategoria) {
                modalCategoria.classList.remove("show");
                modalCategoria.classList.add("hidden");
                console.log("Modal categoría cerrado por clic fuera");
            }
        });

        aplicarDistrito.addEventListener("click", () => {
            const selectedDistrito = document.querySelector('input[name="distrito"]:checked')?.value || "todos";
            filtros.distrito = selectedDistrito;
            saveFiltros();
            modalDistrito.classList.remove("show");
            modalDistrito.classList.add("hidden");
            renderEventos();
            console.log("Filtro distrito aplicado:", filtros.distrito);
        });

        aplicarFecha.addEventListener("click", () => {
            const selectedFecha = document.querySelector('input[name="fecha"]:checked')?.value || "todos";
            filtros.fecha = selectedFecha;
            if (selectedFecha === "custom") {
                const fechaInicio = document.getElementById("fecha-inicio").value;
                const fechaFin = document.getElementById("fecha-fin").value;
                if (!validateCustomDates(fechaInicio, fechaFin)) {
                    alert("Por favor, seleccione un rango de fechas válido.");
                    return;
                }
                filtros.fechaInicio = fechaInicio;
                filtros.fechaFin = fechaFin;
            } else {
                filtros.fechaInicio = "";
                filtros.fechaFin = "";
            }
            saveFiltros();
            modalFecha.classList.remove("show");
            modalFecha.classList.add("hidden");
            renderEventos();
            console.log("Filtro fecha aplicado:", filtros.fecha, filtros.fechaInicio, filtros.fechaFin);
        });

        aplicarCategoria.addEventListener("click", () => {
            filtros.categorias = Array.from(document.querySelectorAll('input[name="categoria"]:checked')).map(input => input.value);
            saveFiltros();
            modalCategoria.classList.remove("show");
            modalCategoria.classList.add("hidden");
            renderEventos();
            console.log("Filtro categorías aplicado:", filtros.categorias);
        });

        fechaCustom.addEventListener("change", () => {
            rangoFecha.classList.toggle("hidden", !fechaCustom.checked);
            console.log("Rango fecha toggled:", !fechaCustom.checked);
        });

        console.log("setupFiltros completado, eventos asignados");
    } catch (error) {
        console.error("Error en setupFiltros:", error);
        throw error;
    }
}

function renderEventos() {
    console.log("renderEventos iniciado");
    try {
        const grid = document.getElementById("eventos-grid");
        const modal = document.getElementById("evento-modal");
        if (!grid || !modal) throw new Error("Grid o modal no encontrados");

        modal.classList.remove("show");
        modal.classList.add("hidden");
        grid.classList.remove("hidden");

        const cards = document.querySelectorAll(".evento-card");
        console.log("Total de tarjetas encontradas:", cards.length);
        let eventosMostrados = 0;

        cards.forEach(card => {
            const esPremium = card.dataset.premium === "true";
            let mostrar = esPremium; // Eventos premium siempre se muestran

            if (!esPremium) {
                const title = card.dataset.title?.toLowerCase() || "";
                const description = card.dataset.descripcion?.toLowerCase() || "";
                const distrito = card.dataset.distrito?.toLowerCase() || "";
                const categoria = card.dataset.categoria || "";
                const fecha = card.dataset.fecha ? new Date(card.dataset.fecha) : null;

                mostrar = true; // Mostrar eventos normales por defecto

                // Filtro de búsqueda
                if (filtros.busqueda) {
                    const matchesBusqueda = title.includes(filtros.busqueda) ||
                                           description.includes(filtros.busqueda) ||
                                           distrito.includes(filtros.busqueda) ||
                                           categoria.toLowerCase().includes(filtros.busqueda);
                    if (!matchesBusqueda) {
                        mostrar = false;
                        console.log(`Tarjeta "${title}" oculta por búsqueda: ${filtros.busqueda}`);
                    }
                }

                // Filtro de distrito
                if (filtros.distrito !== "todos" && distrito !== filtros.distrito.toLowerCase()) {
                    mostrar = false;
                    console.log(`Tarjeta "${title}" oculta por distrito: ${filtros.distrito}`);
                }

                // Filtro de categorías
                if (filtros.categorias.length > 0 && !filtros.categorias.includes(categoria)) {
                    mostrar = false;
                    console.log(`Tarjeta "${title}" oculta por categoría: ${filtros.categorias}`);
                }

                // Filtro de fecha
                if (filtros.fecha !== "todos" && fecha) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    let startDate, endDate;
                    switch (filtros.fecha) {
                        case "hoy":
                            startDate = today;
                            endDate = new Date(today);
                            endDate.setDate(today.getDate() + 1);
                            break;
                        case "semana":
                            startDate = today;
                            endDate = new Date(today);
                            endDate.setDate(today.getDate() + 7);
                            break;
                        case "mes":
                            startDate = today;
                            endDate = new Date(today);
                            endDate.setMonth(today.getMonth() + 1);
                            break;
                        case "custom":
                            if (!validateCustomDates(filtros.fechaInicio, filtros.fechaFin)) {
                                mostrar = false;
                                console.log(`Tarjeta "${title}" oculta por rango de fechas inválido`);
                                break;
                            }
                            startDate = new Date(filtros.fechaInicio);
                            endDate = new Date(filtros.fechaFin);
                            endDate.setDate(endDate.getDate() + 1);
                            break;
                        default:
                            break;
                    }
                    if (startDate && endDate && !(fecha >= startDate && fecha < endDate)) {
                        mostrar = false;
                        console.log(`Tarjeta "${title}" oculta por fecha: ${filtros.fecha}`);
                    }
                }
            }

            card.style.display = mostrar ? "block" : "none";
            if (mostrar) eventosMostrados++;
        });

        console.log("Eventos mostrados:", eventosMostrados);
        if (eventosMostrados === 0 && cards.length > 0) {
            grid.innerHTML = `<p class="text-gray-400 text-center">No se encontraron eventos.</p>`;
        } else if (cards.length === 0) {
            grid.innerHTML = `<p class="text-gray-400 text-center">No hay eventos disponibles.</p>`;
        } else if (eventosMostrados <= 1 && cards.length > 1) {
            console.warn("Pocos eventos mostrados. Verifica filtros en localStorage:", filtros);
        }

        saveFiltros();
        console.log("renderEventos completado");
    } catch (error) {
        console.error("Error en renderEventos:", error);
        const grid = document.getElementById("eventos-grid");
        if (grid) {
            grid.innerHTML = `<p class="text-red-500 text-center">Error al renderizar eventos: ${error.message}</p>`;
        }
    }
}

function mostrarDetalles(card) {
    console.log("mostrarDetalles iniciado para:", card.dataset.title);
    try {
        const grid = document.getElementById("eventos-grid");
        const modal = document.getElementById("evento-modal");
        const modalBody = document.getElementById("modal-body");
        const cerrarModal = document.getElementById("cerrar-modal");
        if (!grid || !modal || !modalBody || !cerrarModal) {
            throw new Error("Grid, modal o elementos no encontrados");
        }

        const title = card.dataset.title || card.querySelector("h3")?.textContent || "Sin título";
        const fecha = card.dataset.fecha;
        const descripcion = card.dataset.descripcion || card.querySelector(".descripcion-breve")?.textContent || "Sin descripción";
        const image = card.dataset.image;
        const video = card.dataset.video;
        const whatsapp = card.dataset.whatsapp;
        const maps = card.dataset.maps;
        const tickets = card.dataset.tickets;
        const comprar = card.dataset.comprar;

        grid.classList.add("hidden");
        modal.classList.remove("hidden");
        modal.classList.add("show");

        let videoEmbed = "";
        if (video) {
            const videoIdMatch = video.match(/(?:v=)([^&]+)/) || video.match(/(?:embed\/)([^?]+)/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;
            if (videoId) {
                videoEmbed = `<iframe id="youtube-iframe" src="https://www.youtube.com/embed/${videoId}?enablejsapi=1" title="Video de ${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-64"></iframe>`;
            }
        }

        modalBody.innerHTML = `
            <h2 class="text-2xl font-semibold text-white mb-4">${title}</h2>
            <p class="fecha text-gray-300 mb-4">${fecha ? formatDate(fecha) : "Fecha no disponible"}</p>
            ${image ? `<img src="${image}" alt="${title}" class="modal-image w-full h-48 object-cover rounded-md mb-4">` : ""}
            ${videoEmbed}
            <p class="text-gray-200 mb-4">${descripcion}</p>
            <div class="botones flex gap-4 justify-center flex-wrap">
                ${whatsapp ? `<a href="${whatsapp}" target="_blank" class="btn-whatsapp bg-green-500 text-white p-2 rounded-md" aria-label="Contactar por WhatsApp"><i class="fab fa-whatsapp"></i></a>` : ""}
                ${maps ? `<a href="${maps}" target="_blank" class="btn-maps bg-blue-500 text-white p-2 rounded-md" aria-label="Ver ubicación en Maps"><i class="fas fa-map-marked-alt"></i></a>` : ""}
                ${tickets ? `<a href="${tickets}" target="_blank" class="btn-tickets bg-yellow-500 text-white p-2 rounded-md" aria-label="Comprar entradas"><i class="fas fa-ticket-alt"></i></a>` : ""}
                ${comprar ? `<a href="${comprar}" target="_blank" class="btn-comprar bg-orange-500 text-white p-2 rounded-md" aria-label="Comprar producto"><i class="fas fa-shopping-cart"></i></a>` : ""}
            </div>
        `;

        cerrarModal.addEventListener("click", () => {
            modal.classList.remove("show");
            modal.classList.add("hidden");
            grid.classList.remove("hidden");
            const iframe = document.getElementById("youtube-iframe");
            if (iframe) {
                iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            }
            console.log("Modal cerrado");
        }, { once: true });

        console.log("mostrarDetalles completado");
    } catch (error) {
        console.error("Error en mostrarDetalles:", error);
        const modalBody = document.getElementById("modal-body");
        if (modalBody) {
            modalBody.innerHTML = `<p class="text-red-500 text-center">Error al cargar detalles: ${error.message}</p>`;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado, inicializando eventos");
    initPage();
});