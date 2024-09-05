const botonBusqueda = document.getElementById('botonBusqueda');

botonBusqueda.addEventListener('click', (event) => {
    event.preventDefault();

    const nombreCampeon = campoBusqueda.value;
    window.location.href = `campeon.html?nombre=${nombreCampeon}`;
});

