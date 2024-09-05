fetch('datosCampeones.json')
    .then(response => response.json())
    .then(data => {
        const contenedor = document.getElementById('contenedor-json');
        let posicion = 1;
        data.forEach(campeon => {
           const fila = contenedor.insertRow();
           const campos = ['ranking', 'imagen', 'nombre', 'posicion', 'winRate', 'pickRate', 'banRate'];

           campos.forEach(campo => {
               const celda = fila.insertCell();
               if(campo === 'imagen'){
                   const foto = document.createElement('img');
                   foto.src = campeon[campo];
                   foto.alt = campeon['nombre'];
                   celda.appendChild(foto);
               }else if(campo === 'ranking'){
                   celda.innerText = posicion.toString();
                   posicion = posicion + 1;
               }else{
                   celda.textContent = campeon[campo];
               }
           });
        });
    })
    .catch(error => console.error('Error al cargar el archivo JSON: ', error));

