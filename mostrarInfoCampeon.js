document.addEventListener('DOMContentLoaded', function() {
    const nombreCampeon = obtenerURL('nombre');
    const selectPosicion = document.getElementById('selectPosicion');
    const nombreCampeonElement = document.getElementById('nombreCampeon');
    nombreCampeonElement.textContent = nombreCampeon;

    obtenerPosicionesDisponibles(nombreCampeon)
        .then(posiciones => {
            selectPosicion.innerHTML = '';

            posiciones.forEach(posicion => {
                const option = document.createElement('option');
                option.value = posicion;
                option.textContent = posicion.charAt(0).toUpperCase() + posicion.slice(1);
                selectPosicion.appendChild(option);
            });

            const posicionInicial = selectPosicion.value;
            const posicionCampeonElement = document.getElementById('posicionCampeon');
            posicionCampeonElement.textContent = posicionInicial.toLowerCase();
            cargarInformacionCampeon(nombreCampeon, posicionInicial);
            cargarBuildCampeon(nombreCampeon, posicionInicial);
            cargarRolCampeon(nombreCampeon, posicionInicial);

            selectPosicion.addEventListener('change', function() {
                const posicionSeleccionada = selectPosicion.value;
                posicionCampeonElement.textContent = posicionSeleccionada.toLowerCase();
                cargarInformacionCampeon(nombreCampeon, posicionSeleccionada);
                cargarBuildCampeon(nombreCampeon, posicionSeleccionada);
                cargarRolCampeon(nombreCampeon, posicionSeleccionada);
            });

        })
        .catch(error => console.error('Error al obtener las posiciones disponibles', error));
});

async function obtenerPosicionesDisponibles(nombreCampeon){
    const preArchivo = `counters${nombreCampeon}-`;
    const posiciones = [];
    const posicionesDisponibles = ['Superior', 'Jungla', 'Medio', 'Inferior', 'Apoyo'];

    for(const posicion of posicionesDisponibles){
        const rutaArchivo = `./countersCampeon/${preArchivo}${posicion}.json`;

        try{
            const response = await fetch(rutaArchivo);
            if(response.ok){
                posiciones.push(posicion);
            }
        }catch (error){
            console.error(`Error al cargar el archivo ${rutaArchivo}`, error);
        }
    }
    return posiciones;
}

function cargarInformacionCampeon(nombreCampeon, posicion) {
    const rutaArchivo = `./countersCampeon/counters${nombreCampeon}-${posicion}.json`;

    fetch(rutaArchivo)
        .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById('detallesCampeon');
            contenedor.innerHTML = '';

            data.forEach(campeon => {
                const fila = contenedor.insertRow();
                const campos = ['nombre', 'win'];

                campos.forEach(campo => {
                    const celda = fila.insertCell();
                    if(campo === 'win'){
                        const span = document.createElement('span');
                        span.textContent = campeon[campo];
                        if(parseFloat(campeon[campo]) > 50){
                            span.classList.add('positivo');
                        }else{
                            span.classList.add('negativo');
                        }
                        celda.appendChild(span);
                    }else {
                        celda.textContent = campeon[campo];
                    }
                });

            });
        })
        .catch(error => console.error('Error al cargar el archivo JSON.', error));
}

function cargarBuildCampeon(nombreCampeon, posicion) {
    const rutaArchivo = `./buildCampeon/build${nombreCampeon}-${posicion}.json`;

    fetch(rutaArchivo)
        .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById('buildCampeon');
            contenedor.innerHTML = '';

            data.forEach(campeon => {
                const fila = contenedor.insertRow();
                const campos = ['imagen', 'nombre', 'precio', 'estadisticas'];

                campos.forEach(campo => {
                    const celda = fila.insertCell();
                    if(campo === 'imagen') {
                        const foto = document.createElement('img');
                        foto.src = campeon[campo];
                        foto.alt = campeon['nombre'];
                        celda.appendChild(foto);
                    }else if(campo === 'estadisticas') {
                        const lista = document.createElement('ul');
                        campeon[campo].forEach(est => {
                            const item = document.createElement('li');
                            item.textContent = est;
                            lista.appendChild(item);
                        });
                        celda.appendChild(lista);
                    }else{
                        celda.textContent = campeon[campo];
                    }
                });
            });
        })
        .catch(error => console.error('Error al cargar el archivo JSON.', error));
}

function cargarRolCampeon(nombreCampeon) {
    fetch('datosCampeones.json')
        .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById('rolCampeon');
            const campeon = data.find(c => c.nombre.toLowerCase() === nombreCampeon.toLowerCase());

            if(campeon) {
                contenedor.textContent = `Rol: ${campeon.rol}`;
            }
        })
        .catch(error => console.error('Error al cargar el archivo JSON.', error));
}

function obtenerURL(nombre) {
    const URL = new URLSearchParams(window.location.search);
    return URL.get(nombre);
}