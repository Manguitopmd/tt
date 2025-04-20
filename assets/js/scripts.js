console.log("scripts.js cargado");

const getElement = (id) => {
    const element = document.getElementById(id);
    if (!element) console.error(`Error: #${id} no encontrado`);
    return element;
};

const handleFetchError = (resource, error) => {
    console.error(`Error al cargar ${resource}:`, error);
    return { ok: false, message: error.message };
};

const getResources = (page) => ({
    html: `pages/${page}.html`,
    css: `assets/css/pages/${page}.css`,
    js: `assets/js/pages/${page}.js`
});

const checkResource = async (url) => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};

const cleanCommonEvents = () => {
    const commonElements = [
        'filtro-busqueda',
        'filtro-distrito',
        'filtro-fecha',
        'filtro-categoria',
        'filtro-tipo',
        'filtro-precio',
        'borrar-filtros',
        'cerrar-modal-distrito',
        'cerrar-modal-fecha',
        'cerrar-modal-categoria',
        'cerrar-modal-tipo',
        'cerrar-modal-precio',
        'cerrar-modal'
    ];
    commonElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Solo clonar si es necesario, evitando interferir con eventos nuevos
            const newEl = el.cloneNode(true);
            el.replaceWith(newEl);
            console.log(`Eventos limpiados para #${id}`);
        }
    });
    // Clonar tarjetas solo si no se espera que la página las maneje
    document.querySelectorAll('.evento-card, .restaurante-card, .acordeon-header').forEach(el => {
        const newEl = el.cloneNode(true);
        el.replaceWith(newEl);
    });
    console.log("Eventos comunes limpiados");
};

const loadResources = async (page, main, loader) => {
    const resources = getResources(page);
    console.log(`Cargando recursos para ${page}:`, resources);

    loader.classList.remove('hidden');
    const minLoaderTime = new Promise(resolve => setTimeout(resolve, 500));
    const maxLoaderTime = new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de carga excedido')), 15000));

    try {
        cleanCommonEvents();
        console.log(`Cargando HTML: ${resources.html}`);
        const htmlResponse = await fetch(resources.html);
        if (!htmlResponse.ok) throw new Error(`Error al cargar ${resources.html}: ${htmlResponse.statusText}`);
        const htmlData = await htmlResponse.text();
        main.innerHTML = htmlData;
        console.log(`HTML cargado para ${page}`);

        document.querySelectorAll('script[data-page-script], link[data-page-style]').forEach(el => el.remove());
        console.log('Scripts y estilos previos limpiados');

        const [cssExists, jsExists] = await Promise.all([
            checkResource(resources.css),
            checkResource(resources.js)
        ]);
        console.log(`CSS existe: ${cssExists}, JS existe: ${jsExists}`);

        if (cssExists) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = resources.css;
            link.setAttribute('data-page-style', page);
            link.onload = () => console.log(`${resources.css} cargado`);
            link.onerror = () => console.error(`Error al cargar ${resources.css}`);
            document.head.appendChild(link);
        } else {
            console.log(`CSS ${resources.css} no existe, omitiendo`);
        }

        let initPagePromise = Promise.resolve();
        if (jsExists) {
            const script = document.createElement('script');
            script.src = resources.js;
            script.setAttribute('data-page-script', page);
            initPagePromise = new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log(`${resources.js} cargado`);
                    if (typeof initPage === 'function') {
                        Promise.resolve(initPage()).then(() => {
                            console.log(`initPage de ${page} ejecutado correctamente`);
                            resolve();
                        }).catch(err => {
                            console.error(`Error en initPage de ${resources.js}:`, err);
                            main.innerHTML = `<p class="text-red-500 text-center">Error al inicializar la página: ${err.message}</p>`;
                            resolve();
                        });
                    } else {
                        console.warn(`initPage no definido en ${resources.js}`);
                        resolve();
                    }
                };
                script.onerror = () => {
                    console.error(`Error al cargar ${resources.js}`);
                    reject(new Error(`Error al cargar ${resources.js}`));
                };
                document.body.appendChild(script);
            });
        } else {
            console.log(`JS ${resources.js} no existe, omitiendo`);
        }

        await Promise.all([initPagePromise, minLoaderTime]);
        loader.classList.add('hidden');
        closeNav();
        window.history.pushState({ page }, "", `?page=${page}`);
        console.log(`Carga de ${page} completada`);
    } catch (error) {
        console.error(`Error en loadResources para ${page}:`, error);
        main.innerHTML = `<p class="text-red-500 text-center">Error al cargar la página: ${error.message}</p>`;
        await Promise.race([minLoaderTime, maxLoaderTime]);
        loader.classList.add('hidden');
    }
};

const toggleSidenav = (open = true) => {
    const sidenav = getElement('mySidenav');
    if (!sidenav) return;
    const width = open ? `${window.innerWidth * 0.8}px` : '0';
    sidenav.style.width = width;
    console.log(`${open ? 'openNav' : 'closeNav'} ejecutado, ancho: ${width}`);
};

const openNav = () => toggleSidenav(true);
const closeNav = () => toggleSidenav(false);

const loadPage = (page) => {
    const main = getElement('main');
    const loader = getElement('loader');
    if (!main || !loader) return;
    console.log(`Iniciando carga de página: ${page}`);
    loadResources(page, main, loader);
};

window.onresize = () => {
    const sidenav = getElement('mySidenav');
    if (sidenav && sidenav.style.width !== '0px' && sidenav.style.width !== '') {
        const width = window.innerWidth * 0.8;
        sidenav.style.width = `${width}px`;
        console.log('resize ejecutado, ancho ajustado:', width);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const loader = getElement('loader');
    const sidenav = getElement('mySidenav');
    if (!loader || !sidenav) return;

    loader.classList.remove('hidden');
    fetch('includes/menu.html')
        .then(response => {
            if (!response.ok) throw new Error(`Error al cargar menu.html: ${response.statusText}`);
            return response.text();
        })
        .then(data => {
            sidenav.innerHTML = data;
            const urlParams = new URLSearchParams(window.location.search);
            const page = urlParams.get('page') || 'home';
            loadPage(page);
        })
        .catch(error => {
            console.error('Error al cargar menú:', error);
            sidenav.innerHTML = `<p class="text-red-500">Error al cargar el menú: ${error.message}</p>`;
            loader.classList.add('hidden');
        });
});