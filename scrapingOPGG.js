const puppeteer = require('puppeteer');
const fs = require('fs').promises;

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();
    await page.goto("https://www.op.gg/champions");

    await page.waitForSelector('[class^="css-f65xnu"]');

    const datosCampeones = await page.evaluate(() => {
        const filas = document.querySelectorAll('[class^="css-f65xnu"] tr');
        const campeones = [];

        for(let fila of filas){
            const campeon = {};
            const imagenCampeon = fila.querySelector('td:nth-child(2) a img');
            const nombreCampeon = fila.querySelector('td:nth-child(2) a');
            const posicionCampeon = fila.querySelector('td:nth-child(4) img');
            const winRateCampeon = fila.querySelector('td:nth-child(5)');
            const pickRateCampeon = fila.querySelector('td:nth-child(6)');
            const banRateCampeon = fila.querySelector('td:nth-child(7)');
            const urlCampeon = fila.querySelector('td:nth-child(2) a');

            if(imagenCampeon && nombreCampeon && posicionCampeon && winRateCampeon && pickRateCampeon && banRateCampeon && urlCampeon) {
                campeon.imagen = imagenCampeon.getAttribute('src');
                campeon.nombre = nombreCampeon.innerText;
                campeon.posicion = posicionCampeon.getAttribute('alt');
                campeon.winRate = winRateCampeon.innerText;
                campeon.pickRate = pickRateCampeon.innerText;
                campeon.banRate = banRateCampeon.innerText;
                campeon.url = urlCampeon.getAttribute('href');
                campeon.rol = "";

                campeones.push(campeon);
            }
        }
        return campeones;
    });

    const lineasJSON = JSON.stringify(datosCampeones, null, 2);
    fs.writeFile('datosCampeones.json', lineasJSON);

    const campeones = [];
    let i = 0;

    for(const campeon of datosCampeones){
        campeones[i] = campeon;
        i++;
    }

    for(let i=0; i<campeones.length; i++){
        const url = campeones[i].url.replace('build', 'counters');
        await page.goto(`https://www.op.gg${url}`);

        await page.waitForSelector('[class^=" css-117bph8"]');
        const datosCounter = await page.evaluate(() => {
            const filas = document.querySelectorAll('[class^=" css-117bph8"] tr');
            const campeones = [];

            for(let fila of filas){
                const campeon = {};
                const nombreCampeon = fila.querySelector('td:nth-child(2) div div');
                const winRateCampeon = fila.querySelector('td:nth-child(3) span');

                if(nombreCampeon && winRateCampeon) {
                    campeon.nombre = nombreCampeon.innerText;
                    campeon.win = winRateCampeon.innerText;

                    campeones.push(campeon);
                }
            }
            return campeones;
        });

        console.log("Enfrentamientos de " + campeones[i].nombre + ": ");
        console.log(datosCounter);

        const lineasJSON = JSON.stringify(datosCounter, null, 2);
        const nombreArchivo = `counters${campeones[i].nombre}-${campeones[i].posicion}.json`;
        const direccion = `./countersCampeon/${nombreArchivo}`;
        fs.writeFile(direccion, lineasJSON);


        await page.goto(`https://www.op.gg${campeones[i].url}`)
        await page.waitForSelector('[id="qc-cmp2-container"]');

        await page.evaluate(() => {
            document.querySelector('[id="qc-cmp2-container"]').remove();
        });

        await page.waitForSelector('[class="item_icon item_icon--normal css-ehxviv e1h3twa82"]');

        const elementos = await page.$$('[class="item_icon item_icon--normal css-ehxviv e1h3twa82"]');
        for(const elemento of elementos){
            await elemento.hover();
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        await page.waitForSelector('[class="react-tooltip-lite"]');

        const objetosCampeones = await page.evaluate(() => {
            const contenidoDiv = document.querySelectorAll('[class="react-tooltip-lite"]');
            const objetosSet = new Set();

            contenidoDiv.forEach((contenido, index) => {
                const objeto = {};

                objeto.nombre = contenido.querySelector('[class="item_name"]').innerText;
                const precioOriginal = contenido.querySelector('[class="item_cost"]').innerText;
                objeto.precio = precioOriginal.replace(/\s*\(.*?\)\s*/g, '');

                const imagenElement = document.querySelectorAll('[class="item_icon item_icon--normal css-ehxviv e1h3twa82"] img')[index];
                objeto.imagen = imagenElement ? imagenElement.getAttribute('src') : null;

                const estadisticasElements = contenido.querySelectorAll('[class="css-hxzfzw ef1254g0"] div span');
                const estadisticas = Array.from(estadisticasElements)
                    .map(span => span.innerText.trim())
                    .filter(stat => stat !== '' && !stat.includes('\n') && /^\d/.test(stat));
                objeto.estadisticas = estadisticas;

                const objetoJSON = JSON.stringify(objeto);
                objetosSet.add(objetoJSON);
            });

            return Array.from(objetosSet).map(objetoJSON => JSON.parse(objetoJSON));
        });

        console.log("Build de " + campeones[i].nombre + ": ");

        const archivoObjetos = JSON.stringify(objetosCampeones, null, 2);
        const nombreFichero = `build${campeones[i].nombre}-${campeones[i].posicion}.json`;
        const direccionArchivo = `./buildCampeon/${nombreFichero}`;
        fs.writeFile(direccionArchivo, archivoObjetos);

        console.log(objetosCampeones);

        const nombresCampeonesEspeciales = {
            "aurelionsol" : "aurelion-sol",
            "belveth" : "bel-veth",
            "chogath" : "cho-gath",
            "drmundo" : "dr-mundo",
            "jarvaniv" : "jarvan-iv",
            "ksante" : "k-sante",
            "kaisa" : "kai-sa",
            "khazix" : "kha-zix",
            "kogmaw" : "kog-maw",
            "leesin" : "lee-sin",
            "masteryi" : "master-yi",
            "missfortune" : "miss-fortune",
            "monkeyking" : "wukong",
            "reksai" : "rek-sai",
            "tahmkench" : "tahm-kench",
            "twistedfate" : "twisted-fate",
            "velkoz" : "vel-koz",
            "xinzhao" : "xin-zhao"
        };

        function obtenerURLCampeon(nombreCampeon){
            if(nombresCampeonesEspeciales[nombreCampeon]){
                return nombresCampeonesEspeciales[nombreCampeon];
            }
            return nombreCampeon;
        }

        const nombreModificado = campeones[i].url.split('/')[2];
        const nombreCampeon = obtenerURLCampeon(nombreModificado);

        await page.goto(`https://www.leagueoflegends.com/es-es/champions/${nombreCampeon}`);

        await page.waitForSelector('[class="meta-description"]');

        const rolCampeon = await page.evaluate(() => {
            const rol = document.querySelector('[class="meta-details"]').innerText;
            const rolModificado = rol.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            return rolModificado;
        });

        async function actualizarCampoJSON(archivo, datos) {
            try {
                await fs.writeFile(archivo, JSON.stringify(datos, null, 2));
            } catch (error) {}
        }

        campeones[i].rol = rolCampeon;
        actualizarCampoJSON('datosCampeones.json', campeones);
        console.log(rolCampeon);
    }

    await browser.close();
})();