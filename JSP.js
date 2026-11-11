// ======================================
// CONFIGURACIÓN DE YOUTUBE DATA API
// ======================================

const API_KEY = "AIzaSyDIgsyv3ww7h_Cb8k724W0ZsEBKrln8m2s";

const URL_API = "https://www.googleapis.com/youtube/v3/search";

// Elementos HTML
const buscarMusica = document.getElementById("buscarMusica");
const botonBuscar = document.getElementById("botonBuscar");
const botonCanciones = document.getElementById("buscarCanciones");
const botonAlbumes = document.getElementById("buscarAlbumes");

const listaCanciones = document.getElementById("listaCanciones");
const gridAlbumes = document.getElementById("gridAlbumes");
const reproductorYoutube = document.getElementById("reproductorYoutube");

const mensaje = document.getElementById("mensaje");
const tituloResultados = document.getElementById("tituloResultados");

let tipoBusqueda = "video";

// ======================================
// FUNCIÓN PARA EVITAR INSERTAR HTML
// NO DESEADO EN LOS RESULTADOS
// ======================================

function escaparHTML(texto) {
    return String(texto || "").replace(/[&<>"']/g, caracter => {
        const entidades = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entidades[caracter];
    });
}

// ======================================
// CAMBIAR ENTRE CANCIONES Y ÁLBUMES
// ======================================

botonCanciones.addEventListener("click", () => {
    tipoBusqueda = "video";

    botonCanciones.classList.add("activo");
    botonAlbumes.classList.remove("activo");

    tituloResultados.textContent = "Canciones";

    buscar();
});

botonAlbumes.addEventListener("click", () => {
    tipoBusqueda = "playlist";

    botonAlbumes.classList.add("activo");
    botonCanciones.classList.remove("activo");

    tituloResultados.textContent = "Álbumes y playlists";

    buscar();
});

// ======================================
// BOTÓN DE BÚSQUEDA
// ======================================

botonBuscar.addEventListener("click", buscar);

// Buscar también al presionar ENTER
buscarMusica.addEventListener("keydown", evento => {
    if (evento.key === "Enter") {
        buscar();
    }
});

// ======================================
// FUNCIÓN PRINCIPAL DE BÚSQUEDA
// ======================================

async function buscar() {
    const consulta = buscarMusica.value.trim();

    if (!API_KEY || API_KEY === "PEGA_AQUI_TU_API_KEY") {
        mensaje.textContent = "Primero coloca tu API Key en el archivo script.js.";
        return;
    }

    if (!consulta) {
        mensaje.textContent = "Escribe el nombre de una canción, artista o álbum.";
        buscarMusica.focus();
        return;
    }

    listaCanciones.innerHTML = "";
    gridAlbumes.innerHTML = "";

    reproductorYoutube.innerHTML = `
        <p>Selecciona una canción para reproducirla aquí.</p>
    `;

    mensaje.textContent = "Buscando en YouTube...";

    botonBuscar.disabled = true;
    botonBuscar.textContent = "Buscando...";

    try {
        const parametros = new URLSearchParams({
            part: "snippet",
            q: consulta,
            type: "video",
            videoEmbeddable: "true",
            maxResults: 10,
            key: API_KEY
        });

        const respuesta = await fetch(`${URL_API}?${parametros}`);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            const detalle = datos.error?.message || "No se pudo completar la búsqueda.";
            throw new Error(detalle);
        }

        if (!datos.items || datos.items.length === 0) {
            mensaje.textContent = "No se encontraron resultados. Intenta con otra búsqueda.";
            return;
        }

        mensaje.textContent = `Resultados encontrados para: "${consulta}"`;

        if (tipoBusqueda === "video") {
            mostrarCanciones(datos.items);
        } else {
            mostrarAlbumes(datos.items);
        }

    } catch (error) {
        console.error("Error de YouTube:", error);

        mensaje.textContent =
            "Ocurrió un error al buscar. Revisa tu API Key, la conexión y que YouTube Data API v3 esté habilitada. Detalle: " +
            error.message;

    } finally {
        botonBuscar.disabled = false;
        botonBuscar.textContent = "Buscar";
    }
}

// ======================================
// MOSTRAR CANCIONES
// ======================================

function mostrarCanciones(canciones) {
    listaCanciones.innerHTML = "";

    canciones.forEach(cancion => {
        const idVideo = cancion.id.videoId;
        const titulo = escaparHTML(cancion.snippet.title);
        const artista = escaparHTML(cancion.snippet.channelTitle);

        const portada =
            cancion.snippet.thumbnails.high?.url ||
            cancion.snippet.thumbnails.medium?.url ||
            cancion.snippet.thumbnails.default?.url;

        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";

        tarjeta.innerHTML = `
            <img src="${escaparHTML(portada)}" alt="Portada de ${titulo}">

            <div class="contenido-tarjeta">
                <h3>${titulo}</h3>
                <p>${artista}</p>

                <button class="boton-tarjeta" type="button">
                    ▶ Reproducir
                </button>
            </div>
        `;

        tarjeta.querySelector("button").addEventListener("click", () => {
            reproducirCancion(idVideo, titulo, artista);
        });

        listaCanciones.appendChild(tarjeta);
    });
}

// ======================================
// REPRODUCIR VIDEO DE YOUTUBE
// ======================================

function reproducirCancion(idVideo, titulo, artista) {
    reproductorYoutube.innerHTML = `
        <h3>${titulo}</h3>
        <p>${artista}</p>

        <iframe
            src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(idVideo)}?autoplay=1"
            title="Reproductor de YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
        </iframe>
    `;

    document.getElementById("seccionReproductor").scrollIntoView({
        behavior: "smooth"
    });
}

// ======================================
// MOSTRAR ÁLBUMES Y PLAYLISTS
// ======================================

function mostrarAlbumes(albumes) {
    gridAlbumes.innerHTML = "";

    albumes.forEach(album => {
        const idPlaylist = album.id.playlistId;
        const titulo = escaparHTML(album.snippet.title);
        const artista = escaparHTML(album.snippet.channelTitle);

        const portada =
            album.snippet.thumbnails.high?.url ||
            album.snippet.thumbnails.medium?.url ||
            album.snippet.thumbnails.default?.url;

        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";

        tarjeta.innerHTML = `
            <img src="${escaparHTML(portada)}" alt="Portada de ${titulo}">

            <div class="contenido-tarjeta">
                <h3>${titulo}</h3>
                <p>${artista}</p>

                <button class="boton-tarjeta" type="button">
                    Ver playlist
                </button>
            </div>
        `;

        tarjeta.querySelector("button").addEventListener("click", () => {
        const idLista = idPlaylist; 

reproductorYoutube.innerHTML = `
    <iframe
        width="100%"
        height="315"
        src="https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(idLista)}&autoplay=1"
        title="Reproductor de Music Vibes"
        frameborder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen>
    </iframe>
`;

reproductorYoutube.scrollIntoView({ behavior: "smooth" });
        });

        gridAlbumes.appendChild(tarjeta);
    });
}