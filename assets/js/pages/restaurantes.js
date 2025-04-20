console.log("restaurantes.js cargado");

let filtros = JSON.parse(localStorage.getItem("filtros_restaurantes")) || {
    busqueda: "",
    tipo: "todos"
};

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
        localStorage.setItem("filtros_restaurantes", JSON.stringify(filtros));
        console.log("Filtros guardados:", filtros);
    } catch (error) {
        console.error("Error al guardar filtros:", error);
    }
}

async function initPage() {
    console.log("initPage iniciado");
    try {
        const restaurantesLista = document.getElementById("restaurantes-lista");
        if (!restaurantesLista) throw new Error("Lista de restaurantes no encontrada");
        console.log("Total de restaurantes:", restaurantesLista.children.length);

        setupBusqueda();
        setupFiltros();
        setupAcordeones();
        renderRestaurantes();

        console.log("initPage completado");
    } catch (error) {
        console.error("Error en initPage:", error);
        const restaurantesLista = document.getElementById("restaurantes-lista");
        if (restaurantesLista) {
            restaurantesLista.innerHTML = `<p class="text-red-500 text-center">Error al cargar restaurantes: ${error.message}</p>`;
        }
    } finally {
        hideLoader();
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
            renderRestaurantes();
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
            filtroTipoBtn: document.getElementById("filtro-tipo"),
            borrarFiltrosBtn: document.getElementById("borrar-filtros"),
            modalTipo: document.getElementById("modal-tipo"),
            cerrarModalTipo: document.getElementById("cerrar-modal-tipo")
        };

        for (const [key, el] of Object.entries(elements)) {
            if (!el) throw new Error(`Elemento ${key} no encontrado`);
        }

        const {
            filtroTipoBtn, borrarFiltrosBtn,
            modalTipo, cerrarModalTipo
        } = elements;

        // Configurar valores iniciales de los filtros
        const selectedTipoRadio = document.querySelector(`input[name="tipo"][value="${filtros.tipo}"]`);
        if (selectedTipoRadio) selectedTipoRadio.checked = true;

        // Eventos de los botones de filtro
        filtroTipoBtn.addEventListener("click", () => {
            modalTipo.classList.remove("hidden");
            modalTipo.classList.add("show");
            console.log("Modal tipo abierto");
        });

        borrarFiltrosBtn.addEventListener("click", () => {
            filtros = {
                busqueda: "",
                tipo: "todos"
            };
            document.getElementById("filtro-busqueda").value = "";
            const defaultTipoRadio = document.querySelector('input[name="tipo"][value="todos"]');
            if (defaultTipoRadio) defaultTipoRadio.checked = true;
            saveFiltros();
            renderRestaurantes();
            console.log("Filtros reseteados completamente:", filtros);
        });

        // Cerrar modal
        cerrarModalTipo.addEventListener("click", () => {
            modalTipo.classList.remove("show");
            modalTipo.classList.add("hidden");
            const selectedTipo = document.querySelector('input[name="tipo"]:checked')?.value || "todos";
            filtros.tipo = selectedTipo;
            saveFiltros();
            renderRestaurantes();
            console.log("Modal tipo cerrado, filtro aplicado:", filtros.tipo);
        });

        modalTipo.addEventListener("click", (e) => {
            if (e.target === modalTipo) {
                modalTipo.classList.remove("show");
                modalTipo.classList.add("hidden");
                const selectedTipo = document.querySelector('input[name="tipo"]:checked')?.value || "todos";
                filtros.tipo = selectedTipo;
                saveFiltros();
                renderRestaurantes();
                console.log("Modal tipo cerrado por clic fuera, filtro aplicado:", filtros.tipo);
            }
        });

        console.log("setupFiltros completado, eventos asignados");
    } catch (error) {
        console.error("Error en setupFiltros:", error);
        throw error;
    }
}

function setupAcordeones() {
    console.log("setupAcordeones iniciado");
    try {
        const acordeones = document.querySelectorAll(".acordeon");
        acordeones.forEach(acordeon => {
            const header = acordeon.querySelector(".acordeon-header");
            const contenido = acordeon.querySelector(".acordeon-contenido");
            const flecha = acordeon.querySelector(".acordeon-flecha");

            header.addEventListener("click", () => {
                const isActive = contenido.classList.contains("active");

                // Cerrar todos los acordeones
                document.querySelectorAll(".acordeon-contenido.active").forEach(otherContenido => {
                    otherContenido.classList.remove("active");
                    otherContenido.style.maxHeight = null;
                    const otherFlecha = otherContenido.parentElement.querySelector(".acordeon-flecha");
                    if (otherFlecha) otherFlecha.classList.remove("active");
                });

                // Abrir o cerrar el acordeón actual
                if (!isActive) {
                    contenido.classList.add("active");
                    contenido.style.maxHeight = contenido.scrollHeight + "px";
                    flecha.classList.add("active");
                    console.log(`Acordeón abierto: ${acordeon.dataset.title}`);
                } else {
                    contenido.classList.remove("active");
                    contenido.style.maxHeight = null;
                    flecha.classList.remove("active");
                    console.log(`Acordeón cerrado: ${acordeon.dataset.title}`);
                }
            });
        });
        console.log("Eventos de acordeones asignados");
    } catch (error) {
        console.error("Error en setupAcordeones:", error);
    }
}

function renderRestaurantes() {
    console.log("renderRestaurantes iniciado");
    try {
        const lista = document.getElementById("restaurantes-lista");
        if (!lista) throw new Error("Lista de restaurantes no encontrada");

        const acordeones = document.querySelectorAll(".acordeon");
        console.log("Total de acordeones encontrados:", acordeones.length);
        let restaurantesMostrados = 0;

        acordeones.forEach(acordeon => {
            const title = acordeon.dataset.title?.toLowerCase() || "";
            const descripcionBreve = acordeon.dataset.descripcionBreve?.toLowerCase() || "";
            const descripcion = acordeon.dataset.descripcion?.toLowerCase() || "";
            const tipo = acordeon.dataset.tipo || "";
            const platos = acordeon.dataset.platos?.toLowerCase() || "";

            let mostrar = true;

            // Filtro de búsqueda
            if (filtros.busqueda) {
                const matchesBusqueda = title.includes(filtros.busqueda) ||
                                       descripcionBreve.includes(filtros.busqueda) ||
                                       descripcion.includes(filtros.busqueda) ||
                                       tipo.toLowerCase().includes(filtros.busqueda) ||
                                       platos.includes(filtros.busqueda);
                if (!matchesBusqueda) {
                    mostrar = false;
                    console.log(`Restaurante "${title}" oculto por búsqueda: ${filtros.busqueda}`);
                }
            }

            // Filtro de tipo
            if (filtros.tipo !== "todos" && tipo !== filtros.tipo) {
                mostrar = false;
                console.log(`Restaurante "${title}" oculto por tipo: ${filtros.tipo}`);
            }

            acordeon.style.display = mostrar ? "block" : "none";
            if (mostrar) restaurantesMostrados++;
        });

        console.log("Restaurantes mostrados:", restaurantesMostrados);
        if (restaurantesMostrados === 0 && acordeones.length > 0) {
            lista.innerHTML = `<p class="text-gray-400 text-center">No se encontraron restaurantes.</p>`;
        } else if (acordeones.length === 0) {
            lista.innerHTML = `<p class="text-gray-400 text-center">No hay restaurantes disponibles.</p>`;
        } else if (restaurantesMostrados <= 1 && acordeones.length > 1) {
            console.warn("Pocos restaurantes mostrados. Verifica filtros en localStorage:", filtros);
        }

        saveFiltros();
        console.log("renderRestaurantes completado");
    } catch (error) {
        console.error("Error en renderRestaurantes:", error);
        const lista = document.getElementById("restaurantes-lista");
        if (lista) {
            lista.innerHTML = `<p class="text-red-500 text-center">Error al renderizar restaurantes: ${error.message}</p>`;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado, inicializando restaurantes");
    initPage();
});