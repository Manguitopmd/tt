console.log("travel-tv.js cargado");

function initPage() {
    // Cargar la API de YouTube IFrame
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    const apiKey = 'AIzaSyDfZ5ky4kOq1RC73KKA15IDRaboaHRSJmg'; // Reemplaza con tu clave API
    const channelId = 'UC7UqCn62xyklKVN9BY35BCA'; // ID del canal Travel Talara
    const maxResults = 6;
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}`;

    const videoGrid = document.getElementById('video-grid');
    const loader = document.getElementById('loader');
    if (!videoGrid || !loader) {
        console.error('Contenedor #video-grid o #loader no encontrado');
        return;
    }

    // Mostrar loader SVG y mensaje oculto para accesibilidad
    loader.style.display = 'flex';
    videoGrid.innerHTML = '<p class="loading-text">Cargando videos...</p>';

    let activePlayer = null; // Rastrea el reproductor activo

    // Función para pausar el video activo
    function pauseActiveVideo() {
        if (activePlayer && typeof activePlayer.pauseVideo === 'function') {
            activePlayer.pauseVideo();
        }
    }

    // Configurar Intersection Observer para lazy loading
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const videoCard = entry.target;
                const img = videoCard.querySelector('.thumbnail');
                if (img && img.dataset.src) {
                    img.src = img.dataset.src; // Cargar la miniatura
                    img.removeAttribute('data-src');
                    console.log(`Miniatura cargada para video: ${img.alt}`);
                }
                observer.unobserve(videoCard); // Dejar de observar una vez cargado
            }
        });
    }, {
        rootMargin: '100px' // Cargar 100px antes de que sea visible
    });

    fetch(apiUrl)
        .then(response => {
            console.log('Respuesta de la API:', response);
            if (!response.ok) {
                throw new Error(`Error al cargar videos: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos de la API:', data);
            videoGrid.innerHTML = '';
            const videos = data.items || [];

            if (!videos || videos.length === 0) {
                videoGrid.innerHTML = '<p class="text-gray-400 text-center">No se encontraron videos. ¡Sube algunos a nuestro canal!</p>';
                loader.style.display = 'none'; // Ocultar loader
                console.warn('No se encontraron videos en la respuesta de la API');
                return;
            }

            const validVideos = videos.filter(video => video.id && video.id.videoId && video.id.videoId !== '');

            if (validVideos.length === 0) {
                videoGrid.innerHTML = '<p class="text-gray-400 text-center">No se encontraron videos válidos en el canal.</p>';
                loader.style.display = 'none'; // Ocultar loader
                console.warn('No se encontraron videos válidos después de filtrar');
                return;
            }

            validVideos.forEach((video, index) => {
                const videoId = video.id.videoId;
                const title = video.snippet.title || 'Sin título';
                const thumbnail = video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || '';
                const description = video.snippet.description || 'Sin descripción disponible';
                const shortDescription = description.length > 100 ? description.substring(0, 97) + '...' : description;

                console.log(`Procesando video: ${title} (ID: ${videoId})`);

                const videoCard = document.createElement('div');
                videoCard.className = 'video-card';
                videoCard.innerHTML = `
                    <div class="thumbnail-container">
                        <img data-src="${thumbnail}" alt="${title.replace(/"/g, '&quot;')}" class="thumbnail" loading="lazy">
                        <div class="play-icon"></div>
                    </div>
                    <div class="iframe-container">
                        <iframe 
                            id="player-${index}"
                            width="100%" 
                            src="" 
                            data-src="https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=0&autoplay=1&enablejsapi=1" 
                            title="${title.replace(/"/g, '&quot;')}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
                            allowfullscreen
                        ></iframe>
                    </div>
                    <div class="p-4">
                        <h3>${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>
                        <p class="video-description">${shortDescription.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                    </div>
                `;

                // Observar la tarjeta para lazy loading
                observer.observe(videoCard);

                // Evento de clic para cargar y reproducir el video
                videoCard.querySelector('.thumbnail-container').addEventListener('click', () => {
                    if (!videoCard.classList.contains('active')) {
                        // Pausar el video activo
                        pauseActiveVideo();

                        const iframe = videoCard.querySelector('iframe');
                        iframe.src = iframe.dataset.src; // Cargar el src con autoplay

                        // Inicializar el reproductor de YouTube
                        const player = new YT.Player(`player-${index}`, {
                            events: {
                                'onReady': (event) => {
                                    activePlayer = event.target;
                                    event.target.playVideo();
                                },
                                'onStateChange': (event) => {
                                    if (event.data === YT.PlayerState.ENDED) {
                                        // Restablecer la tarjeta al estado base
                                        videoCard.classList.remove('active');
                                        iframe.src = ''; // Detener el video
                                        activePlayer = null;
                                        console.log(`Video terminado: ${title}`);
                                    }
                                }
                            }
                        });

                        videoCard.classList.add('active'); // Mostrar iframe, ocultar miniatura
                        console.log(`Reproduciendo video: ${title}`);
                    }
                });

                videoGrid.appendChild(videoCard);
            });

            // Ocultar loader SVG después de cargar los videos
            loader.style.display = 'none';
        })
        .catch(error => {
            console.error('Error al cargar videos:', error);
            videoGrid.innerHTML = `<p class="text-gray-400 text-center">Error al cargar videos: ${error.message}</p>`;
            loader.style.display = 'none'; // Ocultar loader
        });
}