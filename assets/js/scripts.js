console.log("scripts.js cargado");

function openNav() {
    const sidenav = document.getElementById("mySidenav");
    if (sidenav) {
        const width = window.innerWidth * 0.8;
        sidenav.style.width = `${width}px`;
        console.log("openNav ejecutado, ancho:", width);
    } else {
        console.error("Error: #mySidenav no encontrado");
    }
}

function closeNav() {
    const sidenav = document.getElementById("mySidenav");
    if (sidenav) {
        sidenav.style.width = "0";
        console.log("closeNav ejecutado");
    } else {
        console.error("Error: #mySidenav no encontrado");
    }
}

function getResources(page) {
    return {
        html: `pages/${page}.html`,
        js: `assets/js/pages/${page}.js`,
        css: `assets/css/pages/${page}.css`
    };
}

function loadPage(page) {
    const main = document.getElementById('main');
    const loader = document.getElementById('loader');
    if (!main || !loader) {
        console.error("Error: #main o #loader no encontrado");
        return;
    }

    console.log(`Cargando página: ${page}`);
    loader.style.display = 'flex';
    main.innerHTML = '';

    const resources = getResources(page);
    console.log(`Recursos para ${page}:`, resources);

    // Cargar HTML
    fetch(resources.html)
        .then(response => {
            console.log(`Fetch HTML ${resources.html}:`, response.status, response.statusText);
            if (!response.ok) throw new Error(`Error al cargar ${resources.html}: ${response.status} ${response.statusText}`);
            return response.text();
        })
        .then(data => {
            main.innerHTML = data;
            console.log(`HTML cargado para ${page}`);

            // Limpiar scripts y estilos previos
            document.querySelectorAll('script[data-page-script]').forEach(script => script.remove());
            document.querySelectorAll('link[data-page-style]').forEach(style => style.remove());

            // Cargar CSS (si existe)
            fetch(resources.css, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
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
                })
                .catch(() => console.log(`CSS ${resources.css} no accesible, omitiendo`));

            // Cargar JS (si existe)
            fetch(resources.js, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        const script = document.createElement('script');
                        script.src = resources.js;
                        script.setAttribute('data-page-script', page);
                        script.onload = () => {
                            console.log(`${resources.js} cargado`);
                            if (typeof initPage === 'function') {
                                initPage();
                            } else {
                                console.warn(`initPage no definido en ${resources.js}`);
                            }
                        };
                        script.onerror = () => console.error(`Error al cargar ${resources.js}`);
                        document.body.appendChild(script);
                    } else {
                        console.log(`JS ${resources.js} no existe, omitiendo`);
                    }
                })
                .catch(() => console.log(`JS ${resources.js} no accesible, omitiendo`));

            loader.style.display = 'none';
            closeNav();
            window.history.pushState({ page: page }, "", "?page=" + page);
        })
        .catch(error => {
            console.error(`Error al cargar ${page}:`, error);
            main.innerHTML = `<p class="text-red-500 text-center">Error al cargar la página: ${error.message}</p>`;
            loader.style.display = 'none';
        });
}

window.onresize = () => {
    const sidenav = document.getElementById("mySidenav");
    if (sidenav && sidenav.style.width !== "0px" && sidenav.style.width !== "") {
        const width = window.innerWidth * 0.8;
        sidenav.style.width = `${width}px`;
        console.log("resize ejecutado, ancho ajustado:", width);
    }
};

// Cargar página desde URL
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 'home';
    console.log(`Página solicitada: ${page}`);
    loadPage(page);
});