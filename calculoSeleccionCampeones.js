document.addEventListener('DOMContentLoaded', () => {
    const campoBusqueda = document.getElementById('campeonesJugados');
    const dropdown = document.getElementById('dropdown');
    const campoRival = document.getElementById('campeonRival');
    const dropdownRival = document.getElementById('dropdownRival');
    const posicionRival = document.getElementById('posicionRival');
    const campeonesSeleccionados = document.getElementById('campeonesSeleccionados');
    const calcularTopsisButton = document.getElementById('calcularTopsis');
    const mejorCampeonDiv = document.getElementById('mejorCampeon');
    const resultadoMejorCampeon = document.getElementById('resultadoMejorCampeon');
    const recalcularButton = document.getElementById('recalcularButton');
    const verCampeonButton = document.getElementById('verCampeonButton');

    let campeones = [];
    let seleccionados = [];
    let mejorCampeon = null;

    fetch('datosCampeones.json')
        .then(response => response.json())
        .then(data => {
            campeones = data;
        });

    campoBusqueda.addEventListener('input', () => {
        const textoBusqueda = campoBusqueda.value.toLowerCase();
        dropdown.innerHTML = '';

        campeones.forEach(campeon => {
            if (campeon.nombre.toLowerCase().includes(textoBusqueda)) {
                const item = document.createElement('div');
                item.innerHTML = `<img src="${campeon.imagen}" alt="${campeon.nombre}"><span>${campeon.nombre} - ${campeon.posicion}</span>`;

                item.addEventListener('click', () => {
                    if (seleccionados.length < 5 && !seleccionados.some(s => s.nombre === campeon.nombre && s.posicion === campeon.posicion)) {
                        seleccionados.push({ nombre: campeon.nombre, posicion: campeon.posicion });
                        campoBusqueda.value = '';
                        dropdown.style.display = 'none';
                        mostrarSeleccionados();
                    }
                });

                dropdown.appendChild(item);
            }
        });

        if (dropdown.innerHTML !== '') {
            dropdown.style.display = 'block';
        }
    });

    campoRival.addEventListener('input', () => {
        const textoBusqueda = campoRival.value.toLowerCase();
        dropdownRival.innerHTML = '';

        const nombresUnicos = new Set();
        const resultados = campeones.filter(campeon => {
            if (!nombresUnicos.has(campeon.nombre.toLowerCase()) && campeon.nombre.toLowerCase().includes(textoBusqueda)) {
                nombresUnicos.add(campeon.nombre.toLowerCase());
                return true;
            }
            return false;
        });

        resultados.forEach(campeon => {
            const item = document.createElement('div');
            item.innerHTML = `<img src="${campeon.imagen}" alt="${campeon.nombre}"><span>${campeon.nombre}</span>`;
            item.addEventListener('click', () => {
                campoRival.value = campeon.nombre;
                dropdownRival.style.display = 'none';
                cargarPosicionesDisponibles(campeon.nombre);
            });
            dropdownRival.appendChild(item);
        });

        if (resultados.length > 0) {
            dropdownRival.style.display = 'block';
        } else {
            dropdownRival.style.display = 'none';
        }
    });

    async function cargarPosicionesDisponibles(nombreRival){
        try{
            const posiciones = await obtenerPosicionesDisponibles(nombreRival);
            posiciones.forEach(pos => {
                const option = document.createElement('option');
                option.value = pos;
                option.textContent = pos;
                posicionRival.appendChild(option);
            });
        }catch(error){
            console.error('Error al cargar las posiciones disponibles: ', error);
        }
    }

    async function obtenerPosicionesDisponibles(nombreRival){
        const posiciones = [];
        const posicionesDisponibles = ['Superior', 'Jungla', 'Medio', 'Inferior', 'Apoyo'];

        for(const posicion of posicionesDisponibles){
            const rutaArchivo = `./countersCampeon/counters${nombreRival}-${posicion}.json`;

            try{
                const response = await fetch(rutaArchivo);
                if(response.ok){
                    posiciones.push(posicion);
                }
            }catch(error){
                console.error(`Error al cargar el archivo ${rutaArchivo}: `, error);
            }
        }
        return posiciones;
    }

    document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target) && event.target !== campoBusqueda){
            dropdown.style.display = 'none';
        }
        if(!dropdownRival.contains(event.target) && event.target !== campoBusqueda){
            dropdownRival.style.display = 'none';
        }
    });

    function mostrarSeleccionados() {
        campeonesSeleccionados.innerHTML = '';
        seleccionados.forEach(seleccionado => {
            const campeon = campeones.find(c => c.nombre === seleccionado.nombre && c.posicion === seleccionado.posicion);
            if (campeon) {
                const item = document.createElement('div');
                item.innerHTML = `<img src="${campeon.imagen}" alt="${campeon.nombre}"><span>${campeon.nombre} - ${campeon.posicion}</span>`;
                campeonesSeleccionados.appendChild(item);
            } else {
                console.error(`Campeón no encontrado: ${seleccionado.nombre} - ${seleccionado.posicion}`);
            }
        });
    }

    calcularTopsisButton.addEventListener('click', () => {
        if(campoRival.value.trim() !== '' && posicionRival.value.trim() !== ''){
            if(seleccionados.length <= 5 && seleccionados.length >= 2) {
                calcularTopsisConRival();
            }else{
                alert('Selecciona al menos 2 campeones.');
            }
        }else if (seleccionados.length <= 5 && seleccionados.length >= 2) {
            calcularTopsisSinRival();
        }else {
            alert('Selecciona al menos 2 campeones o completa los campos de rival y posición.');
        }
    });

    function calcularTopsisConRival(){
        const seleccionadosData = seleccionados.map(({ nombre, posicion }) =>
            campeones.find(c => c.nombre === nombre && c.posicion === posicion)
        );
        console.log("Campeones seleccionados:", seleccionadosData);

        const pesos = {
            winRate: 0.6,
            pickRate: 0.2,
            banRate: 0.2
        };

        const sumaCuadrados = {
            winRate: 0,
            pickRate: 0,
            banRate: 0
        };

        const nombreRival = campoRival.value;
        const posicionRival = document.getElementById('posicionRival').value;
        const rutaArchivo = `./countersCampeon/counters${nombreRival}-${posicionRival}.json`;

        fetch(rutaArchivo)
            .then(response => response.json())
            .then(counters => {
                console.log("Counters del rival:", counters);

                const campeonesCounter = seleccionadosData.map(seleccionado => {
                    const counterData = counters.find(counter =>
                        counter.nombre.toLowerCase() === seleccionado.nombre.toLowerCase());

                    if (counterData) {
                        return {
                            nombre: seleccionado.nombre,
                            imagen: seleccionado.imagen,
                            posicion : seleccionado.posicion,
                            winRate: counterData.win,
                            pickRate: seleccionado.pickRate,
                            banRate: seleccionado.banRate
                        };
                    }
                    return null;
                }).filter(Boolean);
                console.log("Campeones que son counters del rival:", campeonesCounter);

                if (campeonesCounter.length > 0) {
                    campeonesCounter.forEach(campeon => {
                        for(let criterio in sumaCuadrados){
                            const valor = convertirPorcentajeANumero(campeon[criterio]);
                            sumaCuadrados[criterio] += Math.pow(valor,2);
                        }
                        console.log(campeon.nombre + "   win rate:" + campeon.winRate + "   pick rate:" + campeon.pickRate + "   ban rate:" + campeon.banRate);
                    });

                    console.log("VALORES NORMALIZADOS");
                    const normalizados = campeonesCounter.map(campeon => {
                        let actual = {};
                        for(let criterio in sumaCuadrados){
                            const valor = convertirPorcentajeANumero(campeon[criterio]);
                            actual[criterio] = valor / Math.sqrt(sumaCuadrados[criterio]);
                            console.log(campeon.nombre + " " + criterio + ": " + actual[criterio]);
                        }

                        actual['nombre'] = campeon.nombre;
                        actual['posicion'] = campeon.posicion;
                        actual['imagen'] = campeon.imagen;

                        return actual;
                    });

                    console.log("VALORES PONDERADOS");
                    const ponderados = normalizados.map(campeon => {
                        let actual = {};
                        for(let criterio in pesos){
                            actual[criterio] = campeon[criterio] * pesos[criterio];
                            console.log(campeon.nombre + " " + criterio + ": " + actual[criterio]);
                        }

                        actual['nombre'] = campeon.nombre;
                        actual['posicion'] = campeon.posicion;
                        actual['imagen'] = campeon.imagen;

                        return actual;
                    });

                    const PIS = {
                        winRate: Math.max(...ponderados.map(c => c.winRate)),
                        pickRate: Math.max(...ponderados.map(c => c.pickRate)),
                        banRate: Math.min(...ponderados.map(c => c.banRate))
                    };

                    const NIS = {
                        winRate: Math.min(...ponderados.map(c => c.winRate)),
                        pickRate: Math.min(...ponderados.map(c => c.pickRate)),
                        banRate: Math.max(...ponderados.map(c => c.banRate))
                    };

                    const distancias = ponderados.map(campeon => {
                        let distanciaPIS = 0;
                        let distanciaNIS = 0;

                        for(let criterio in pesos){
                            distanciaPIS += Math.pow((campeon[criterio]) - PIS[criterio], 2);
                            distanciaNIS += Math.pow((campeon[criterio]) - NIS[criterio], 2);
                        }

                        return {
                            nombre : campeon.nombre,
                            winRate : campeon.winRate,
                            pickRate : campeon.pickRate,
                            banRate : campeon.banRate,
                            imagen : campeon.imagen,
                            posicion : campeon.posicion,
                            PIS : Math.sqrt(distanciaPIS),
                            NIS : Math.sqrt(distanciaNIS)
                        };
                    });

                    mejorCampeon = distancias.reduce((max, campeon) => {
                        const puntuacion = campeon.NIS / (campeon.PIS + campeon.NIS);
                        const puntuacionMaxima = max.NIS / (max.PIS + max.NIS);
                        console.log("Puntuacion " + campeon.nombre + ": " + puntuacion);
                        return puntuacion > puntuacionMaxima ? campeon : max;
                    }, distancias[0]);

                    console.log("Mejor campeón encontrado:", mejorCampeon);

                    resultadoMejorCampeon.innerHTML = `
                    <div>
                        <img src="${mejorCampeon.imagen}" alt="${mejorCampeon.nombre}">
                        <div>
                            <strong>${mejorCampeon.nombre} - ${mejorCampeon.posicion}</strong><br>
                        </div>
                    </div>
                `;
                    mejorCampeonDiv.style.display = 'block';
                } else {
                    alert('No se encontraron campeones en común entre los seleccionados y los counters del rival.');
                }
            })
            .catch(error => {
                console.error('Error al cargar el archivo de countersCampeon:', error);
                alert('Error al cargar los datos de counters del campeón rival.');
            });
    }

    function convertirPorcentajeANumero(porcentaje) {
        return parseFloat(porcentaje.replace('%', ''));
    }

    function calcularTopsisSinRival() {
        const seleccionadosData = seleccionados.map(({ nombre, posicion }) =>
            campeones.find(c => c.nombre === nombre && c.posicion === posicion)
        );

        const pesos = {
            winRate: 0.6,
            pickRate: 0.2,
            banRate: 0.2
        };

        const sumaCuadrados = {
            winRate: 0,
            pickRate: 0,
            banRate: 0
        };

        seleccionadosData.forEach(campeon => {
            for(let criterio in sumaCuadrados){
                const valor = convertirPorcentajeANumero(campeon[criterio]);
                sumaCuadrados[criterio] += Math.pow(valor,2);
            }
            console.log(campeon.nombre + "   win rate:" + campeon.winRate + "   pick rate:" + campeon.pickRate + "   ban rate:" + campeon.banRate);
        });

        console.log("VALORES NORMALIZADOS");
        const normalizados = seleccionadosData.map(campeon => {
            let actual = {};
            for(let criterio in sumaCuadrados){
                const valor = convertirPorcentajeANumero(campeon[criterio]);
                actual[criterio] = valor / Math.sqrt(sumaCuadrados[criterio]);
                console.log(campeon.nombre + " " + criterio + ": " + actual[criterio]);
            }

            actual['nombre'] = campeon.nombre;
            actual['posicion'] = campeon.posicion;
            actual['imagen'] = campeon.imagen;

            return actual;
        });

        console.log("VALORES PONDERADOS");
        const ponderados = normalizados.map(campeon => {
            let actual = {};
            for(let criterio in pesos){
                actual[criterio] = campeon[criterio] * pesos[criterio];
                console.log(campeon.nombre + " " + criterio + ": " + actual[criterio]);
            }

            actual['nombre'] = campeon.nombre;
            actual['posicion'] = campeon.posicion;
            actual['imagen'] = campeon.imagen;

            return actual;
        });

        const PIS = {
            winRate: Math.max(...ponderados.map(c => c.winRate)),
            pickRate: Math.max(...ponderados.map(c => c.pickRate)),
            banRate: Math.min(...ponderados.map(c => c.banRate))
        };

        const NIS = {
            winRate: Math.min(...ponderados.map(c => c.winRate)),
            pickRate: Math.min(...ponderados.map(c => c.pickRate)),
            banRate: Math.max(...ponderados.map(c => c.banRate))
        };

        const distancias = ponderados.map(campeon => {
            let distanciaPIS = 0;
            let distanciaNIS = 0;

            for(let criterio in pesos){
                distanciaPIS += Math.pow((campeon[criterio]) - PIS[criterio], 2);
                distanciaNIS += Math.pow((campeon[criterio]) - NIS[criterio], 2);
            }

            return {
                nombre : campeon.nombre,
                winRate : campeon.winRate,
                pickRate : campeon.pickRate,
                banRate : campeon.banRate,
                imagen : campeon.imagen,
                posicion : campeon.posicion,
                PIS : Math.sqrt(distanciaPIS),
                NIS : Math.sqrt(distanciaNIS)
            };
        });

        mejorCampeon = distancias.reduce((max, campeon) => {
            const puntuacion = campeon.NIS / (campeon.PIS + campeon.NIS);
            const puntuacionMaxima = max.NIS / (max.PIS + max.NIS);
            console.log("Puntuacion " + campeon.nombre + ": " + puntuacion);
            return puntuacion > puntuacionMaxima ? campeon : max;
        }, distancias[0]);

        console.log("Mejor campeón encontrado:", mejorCampeon);

        resultadoMejorCampeon.innerHTML = `
            <div>
                <img src="${mejorCampeon.imagen}" alt="${mejorCampeon.nombre}">
                <div>
                    <strong>${mejorCampeon.nombre} - ${mejorCampeon.posicion}</strong><br>
                </div>
            </div>
        `;
        mejorCampeonDiv.style.display = 'block';
    }

    recalcularButton.addEventListener('click', () => {
        mejorCampeonDiv.style.display = 'none';
        seleccionados = [];
        campeonesSeleccionados.innerHTML = '';
        campoRival.value = "";
        campoRival.innerHTML = '';
        posicionRival.value = "";
    });

    verCampeonButton.addEventListener('click', () => {
        if (mejorCampeon) {
            window.location.href = `campeon.html?nombre=${mejorCampeon.nombre}`;
        }
    });
});
