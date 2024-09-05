const campoBusqueda = document.getElementById('campoBusqueda');
const sugerencias = document.getElementById('sugerencias');
let campeones;

async function cargarNombresCampeones() {
    try {
        const response = await fetch('datosCampeones.json');
        if (!response.ok) {
            throw new Error('Error al cargar los datos del archivo datosCampeones.json');
        }
        const datos = await response.json();

        return datos.filter((campeon, indice, i) =>
            indice === i.findIndex((camp) => camp.nombre === campeon.nombre)
        );

    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

cargarNombresCampeones().then(nombres => {
   campeones = nombres;
});

function mostrarSugerencias(input){
    sugerencias.innerHTML = '';
    const resultados = campeones.filter(campeon => campeon.nombre.toLowerCase().includes(input.toLowerCase()));

    resultados.forEach(campeon => {
        const sugerencia = document.createElement('div');
        sugerencia.classList.add('sugerencia');

        const imagen = document.createElement('img');
        imagen.classList.add('imagenCampeon');
        imagen.src = campeon.imagen;
        imagen.alt = campeon.nombre;

        const nombreCampeon = document.createElement('span');
        nombreCampeon.textContent = campeon.nombre;

        sugerencia.appendChild(imagen);
        sugerencia.appendChild(nombreCampeon);

        sugerencia.addEventListener('click', () => {
            campoBusqueda.value = campeon.nombre;
            sugerencias.innerHTML = '';
        });
        sugerencias.appendChild(sugerencia);
    });
}

campoBusqueda.addEventListener('input', () => {
    let busquedaMayuscula = campoBusqueda.value;
    if(busquedaMayuscula.length === 1){
        busquedaMayuscula = busquedaMayuscula.charAt(0).toUpperCase() + busquedaMayuscula.slice(1);
    }
    campoBusqueda.value = busquedaMayuscula;

    const busqueda = campoBusqueda.value.trim();
    if(busqueda.length === 0){
        sugerencias.innerHTML = '';
    }else{
        mostrarSugerencias(busqueda);
    }
});

document.addEventListener('click', (event) => {
    if(!sugerencias.contains(event.target) && event.target !== campoBusqueda){
        sugerencias.innerHTML = '';
    }
});