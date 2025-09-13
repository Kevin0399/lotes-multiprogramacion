class Proceso {
    constructor(operacion, valores, id, tiempoMax) {
        this.operacion = operacion;
        this.valores = valores;
        this.id = id;
        this.tiempoMax = tiempoMax;
        this.status = "ESPERA"; // Estado inicial
        this.resultado = null;
        this.reinsertar = false;
        this.tiempoTranscurrido = 0; // Cantidad de tiempo en la que el proceso ya estuvo en ejecucion
        this.tiempoRestante = tiempoMax;
    }
};

// Objeto que contiene la matriz de lotes y el contador global
class Lotes {
    constructor(matrizLotes) {
        this.matrizLotes = matrizLotes; // Matriz que contiene los lotes
        this.tiempoTotalTranscurrido = 0; // Inicializamos en contador global
        this.numLotes = 0
        this.lotesPendientes = 0;
    }
}

function generarAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const operaciones = ["+", "-", "*", "/", "%", "^"];

// ---------------------- FASE 1 ----------------------
// En esta fase solo se generan y muestran los lotes con sus procesos.
// Todavía no se ejecuta nada.
document.getElementById("formulario").addEventListener("submit", function (e) {
    e.preventDefault(); // Evitar recarga de página
    const salida = document.getElementById("salida");
    salida.innerHTML = ""; // Limpiar resultados anteriores

    let numTrabajos = parseInt(document.getElementById("numTrabajos").value);
    if (isNaN(numTrabajos) || numTrabajos <= 0) {
        alert("Ingrese un número válido mayor que 0");
        return;
    }

    let lotesAux = [];
    let loteActual = [];

    // Generar procesos
    for (let i = 1; i <= numTrabajos; i++) {
        let id = i;
        let tme = generarAleatorio(6000, 20000); // Generamos tiempo aleatorio en milisegundos
        let operacion = null;
        let op1 = generarAleatorio(1, 50);
        let op2 = generarAleatorio(1, 50);

        operacion = operaciones[generarAleatorio(0, operaciones.length - 1)];

        if ((operacion === "/" || operacion === "%") && op2 === 0) {
            op2 = generarAleatorio(1, 50);
        }

        let valores = [op1, op2];

        const proceso = new Proceso(operacion, valores, id, tme);
        loteActual.push(proceso);

        if (loteActual.length === 4 || i === numTrabajos) {
            lotesAux.push(loteActual);
            loteActual = [];
        }
    }

    // Mostrar lotes en la página (vista previa)
    lotesAux.forEach((lote, index) => {
        let contenedorLote = document.createElement("div");
        contenedorLote.classList.add("tablaEsperaDiv");

        let titulo = document.createElement("h2");
        titulo.textContent = `Lote ${index + 1}`;
        contenedorLote.appendChild(titulo);

        let tabla = document.createElement("table");

        let encabezado = document.createElement("tr");
        encabezado.innerHTML = "<th>ID</th><th>TME</th><th>Operación</th>";
        tabla.appendChild(encabezado);

        lote.forEach(p => {
            let fila = document.createElement("tr");
            fila.innerHTML = `<td>${p.id}</td><td>${p.tiempoMax}</td><td>${p.valores[0]} ${p.operacion} ${p.valores[1]}</td>`;
            tabla.appendChild(fila);
        });

        contenedorLote.appendChild(tabla);
        salida.appendChild(contenedorLote);
    });

    // Botón para pasar a la fase de ejecución
    let btnEjecutar = document.createElement('button');
    btnEjecutar.innerText = 'Ejecutar';
    salida.appendChild(btnEjecutar);

    btnEjecutar.addEventListener('click', () => {
        salida.innerHTML = ""; // 🔹 Limpiamos la vista de Fase 1
        document.getElementById("formulario").style.display = "none"; // 🔹 Ocultamos el formulario junto con la vista previa
        let lotes = new Lotes(lotesAux); // Guardamos la matriz de lotes en un nuevo objeto
        console.log({ lotes });
        ejecutarLotes(lotes); // Pasamos los lotes a ejecutar (Fase 2)
    })
});

// ---------------------- FASE 2 ----------------------
// Todo lo que sigue es la fase de ejecución real de procesos.


//Elementos HTML de la ejecucion
let contadorLotesPendientes = document.createElement('div'); // Mostramos en DOM el espacio donde se mostraran la cantidad de lotes pendientes
let contadorLoteActual = document.createElement('div'); // Mostramos en DOM el espacio donde se vera el numero de lote actual
let tituloPendientes = document.createElement('h2'); // Título para procesos pendientes
let tablaEspera = document.createElement('table'); // Tabla de procesos pendientes
let encabezadoTablaEspera = document.createElement('tr');
let tablaEsperaDiv = document.createElement('div'); // Contenedor de la tabla de espera
let tituloEjecucion = document.createElement('h2'); // Título para proceso en ejecución
let mostrarEjecucion = document.createElement('div'); // Espacio de informacion sobre el proceso en ejecucion
let tituloTerminados = document.createElement('h2'); // Título para procesos terminados
let tablaTerminados = document.createElement('table'); // Tabla de procesos terminados

let tablaTerminadosDiv = document.createElement('div'); // Contenedor de la tabla de terminados
let contenedorEstados = document.createElement('div'); // Contenedor de los estados que puede tener un proceso
let ejecucionDiv = document.createElement('div'); // Contenedor de la informacion de ejecucion
let contenedorPrincipal = document.createElement('div');
let contadorGlobal = document.createElement('div'); // Contiene el contador global

/**
 * @param {Object[]} matrizLotes Matriz que contiene los lotes de procesos
 */
const ejecutarLotes = async (Lotes) => {
    Lotes.numLotes = Lotes.matrizLotes.length;
    Lotes.lotesPendientes = Lotes.numLotes;

    // 🔹 Inicializar tabla de terminados una sola vez
    tablaTerminados.innerHTML = "";
    let nuevoEncabezado = document.createElement('tr');
    nuevoEncabezado.innerHTML = "<th>ID</th><th>OPERACION</th><th>RESULTADO</th><th>NL</th>";
    tablaTerminados.appendChild(nuevoEncabezado);

    // 🔹 Ejecutar lote por lote
    for (let i = 0; i < Lotes.numLotes; i++) {
        await ejecutarProceso(Lotes);
    }
    // Boton para dar por finalizado el sistema 
    let btnFinalizar = document.createElement('button');
    btnFinalizar.classList.add('btnFinalizar');
    btnFinalizar.textContent = "Finalizar";
    contenedorPrincipal.appendChild(btnFinalizar);
    btnFinalizar.onclick = () => {
        location.reload(); // Recarga la página para reiniciar todo
    }
};


/**
 *
 * @param {Number} numLotes        Almacena el numero de lotes total de la matrix
 * @param {Number} lotesPendientes Almacena la cantidad de lotes pendientes
 * @param {Object<Lotes>} Lotes    Objeto que contiene la matriz de lotes y el contador global
 */
// Funcion que lleva a cabo la ejecucion de un proceso
const ejecutarProceso = async (Lotes) => {
    // Todo esto son asignaciones de elementos HTML al DOM y creaciones de clases para css
    contadorLotesPendientes.classList.add('contadorLotesPendientes');
    contadorLoteActual.classList.add('contadorLoteActual');

    tituloPendientes.textContent = "Procesos Pendientes";

    encabezadoTablaEspera.innerHTML = "<th>ID</th><th>TME</th><th>TT</th>";
    tablaEspera.appendChild(encabezadoTablaEspera);

    tablaEsperaDiv.classList.add('tablaEsperaDiv');
    tablaEsperaDiv.appendChild(tituloPendientes);
    tablaEsperaDiv.appendChild(tablaEspera);

    tituloEjecucion.textContent = "Proceso en Ejecución";

    mostrarEjecucion.classList.add('mostrarEjecucion');

    tituloTerminados.textContent = "Procesos Terminados";

    let nuevoEncabezado = document.createElement('tr');

    tablaTerminadosDiv.classList.add('tablaTerminadosDiv');
    tablaTerminadosDiv.appendChild(tituloTerminados);
    tablaTerminadosDiv.appendChild(tablaTerminados);

    contenedorEstados.classList.add('contenedorEstados');
    contenedorEstados.appendChild(tablaEsperaDiv);

    ejecucionDiv.appendChild(tituloEjecucion);
    ejecucionDiv.appendChild(mostrarEjecucion);
    contenedorEstados.appendChild(ejecucionDiv);
    contenedorEstados.appendChild(tablaTerminadosDiv);

    contenedorPrincipal.classList.add('contenedorPrincipal');
    document.body.appendChild(contenedorPrincipal);
    contenedorPrincipal.appendChild(contadorLotesPendientes);
    contenedorPrincipal.appendChild(contadorLoteActual);
    contenedorPrincipal.appendChild(contenedorEstados);

    contadorGlobal.classList.add('contadorGlobal');
    contadorGlobal.innerText = "Tiempo total global: 0 segundos";
    contenedorPrincipal.appendChild(contadorGlobal);

    let numLoteActual = Lotes.numLotes - Lotes.lotesPendientes + 1;
    Lotes.lotesPendientes--;

    let loteActual = Lotes.matrizLotes[numLoteActual - 1]; // Guardamos el lote actual
    const ordenProcesos = { ESPERA: 1, ENTSAL: 2 };

    for (let i = 0; i <= loteActual.length; i++) {
        let enEjecucion = loteActual[i];
        if (!enEjecucion) continue; // Evitamos procesos undefined

        enEjecucion.status = "EJECUCION"; // Cambiamos el estado para que ya no sea tomado como pendiente

        contadorLotesPendientes.innerText = `Lotes Pendientes: ${Lotes.lotesPendientes}`;
        contadorLoteActual.innerText = `Lote Actual: ${numLoteActual}`;

        // Obtenemos los procesos que se encuentran en espera y en proceso de entrada salida
        let procesosPendientes = loteActual.filter(proceso => proceso !== enEjecucion && (proceso.status === "ESPERA" || proceso.status === "ENTSAL"));

        // Ordenamos los procesos para que los que esten esperando una operacion de E/S se coloquen al final del lote
        procesosPendientes.sort((a, b) => ordenProcesos[a.status] - ordenProcesos[b.status]);
        console.log({ procesosPendientes });

        // Mostramos en pantalla la tabla de espera
        for (let k = 0; k < procesosPendientes.length; k++) {
            let fila = document.createElement('tr');
            fila.innerHTML = `
    <td>${procesosPendientes[k].id}</td>
    <td>${(procesosPendientes[k].tiempoMax / 1000).toFixed(1)} s</td>
    <td>${(procesosPendientes[k].tiempoTranscurrido / 1000).toFixed(1)} s</td>
`;


            tablaEspera.appendChild(fila);
        }

        // Espera el tiempo del proceso mostrando el cronómetro
        await cronometroAsync(enEjecucion, Lotes); // Pasamos el objeto Lotes como parametro para poder reflejar las modificaciones en tiempoTotalTranscurrido

        mostrarEjecucion.innerHTML = ""; // Limpiamos el espacio de ejecucion en pantalla

        // Limpiamos la tabla de espera en pantalla (excepto encabezado)
        while (tablaEspera.rows.length > 1) {
            tablaEspera.deleteRow(1);
        }

        // Verificar si el proceso salio de ejecucion por una solicitud de entrada/salida
        if (enEjecucion.status === "ENTSAL") {
            if (enEjecucion.reinsertar) {
                enEjecucion.reinsertar = false; // Limpiamos la marca

                //  Eliminar el proceso actual de su posición original
                loteActual.splice(i, 1);

                // ➕ Insertarlo al final
                loteActual.push(enEjecucion);

                //  Reducimos 'i' porque el array se acortó al hacer splice()
                i--;
            } else {
                i--; // Si no hay que reinsertar, solo repetimos la iteración
            }
        }
        else {
            // Al terminar, muestra el resultado con máximo 2 decimales
            enEjecucion.resultado = realizarOperacion(enEjecucion.operacion, enEjecucion.valores, enEjecucion.status); // Mandamos status para verificar si hubo una interrupcion por motivo de error
            enEjecucion.resultado = typeof enEjecucion.resultado === "number" // Formateamos el resultado
                ? enEjecucion.resultado.toFixed(2)
                : enEjecucion.resultado;
            enEjecucion.status = "TERMINADO"; // Marca el proceso como terminado
            enEjecucion.tiempoTranscurrido = 0;

            // Agregamos el proceso terminado a la tabla de terminados
            let filaTerminado = document.createElement('tr');
            filaTerminado.innerHTML = `<td>${enEjecucion.id}</td>
        <td>${enEjecucion.valores[0]} ${enEjecucion.operacion} ${enEjecucion.valores[1]}</td>
                                   <td>${enEjecucion.resultado}</td>
                                   <td>${numLoteActual}</td>`;
            tablaTerminados.appendChild(filaTerminado);
        }
    }
}


// Variables globales para control de teclas
let teclaPresionada = "c"; // Por defecto, sin pausa
let enPausa = false; // Bandera para controlar la pausa

// Detectamos cuando se presiona una tecla
document.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    teclaPresionada = key;

    if (key === "p") {
        enPausa = true; // Activamos pausa
    } else if (key === "c") {
        enPausa = false; // Reanudamos ejecución
    }
});

/**
 *
 * @param {Objeto<Proceso>} proceso Recibe el proceso en ejecucion
 * @param {Objeto<Lotes>} Lotes Objeto que contiene el tiempo global total
 * @returns
 */
// Cronómetro asíncrono que espera el tiempo del proceso, ahora con escucha local de teclas
const cronometroAsync = async (proceso, Lotes) => {
    let tiempoTranscurrido = proceso.tiempoTranscurrido || 0;
    const intervalo = 100; // Actualiza cada 100 ms
    let enPausa = false; // Control local de pausa
    let teclaPresionada = "c"; // Inicialmente en "continuar"

    // Handler local para keyup, solo para este proceso
    const keyupHandler = (event) => {
        const key = event.key.toLowerCase();
        teclaPresionada = key;

        if (key === "p") {
            enPausa = true; // Pausar ejecución
        } else if (key === "c") {
            enPausa = false; // Continuar ejecución
        }
    };

    // Añadimos listener local para detectar teclas
    document.addEventListener("keyup", keyupHandler);

    return new Promise((resolve) => {
        const timer = setInterval(() => {
            if (enPausa) return; // No avanza el tiempo si está en pausa

            tiempoTranscurrido += intervalo;
            proceso.tiempoTranscurrido = tiempoTranscurrido;
            proceso.tiempoRestante = proceso.tiempoMax - tiempoTranscurrido;
            Lotes.tiempoTotalTranscurrido += intervalo;

            mostrarEjecucion.innerHTML = `
                <table class="infoProceso">
                    <tr><th colspan="2">Información del Proceso</th></tr>
                    <tr><td><b>ID:</b></td><td>${proceso.id}</td></tr>
                    <tr><td><b>TME:</b></td><td>${(proceso.tiempoMax / 1000).toFixed(1)} s (${proceso.tiempoMax} ms)</td></tr>
                    <tr><td><b>Operación:</b></td><td>${proceso.valores[0]} ${proceso.operacion} ${proceso.valores[1]}</td></tr>
                    <tr><td><b>Tiempo transcurrido:</b></td><td>${(tiempoTranscurrido / 1000).toFixed(1)} s (${tiempoTranscurrido} ms)</td></tr>
                    <tr><td><b>Tiempo restante:</b></td><td>${((proceso.tiempoMax - tiempoTranscurrido) / 1000).toFixed(1)} s (${Math.max(proceso.tiempoRestante, 0)} ms)</td></tr>
                </table>
            `;
            console.log("ejecucion");

            contadorGlobal.innerText = `Tiempo total global: ${(Lotes.tiempoTotalTranscurrido / 1000).toFixed(1)} s (${Lotes.tiempoTotalTranscurrido} ms)`;

            if (teclaPresionada == "w") {
                proceso.status = "ERROR";
                clearInterval(timer);
                document.removeEventListener("keyup", keyupHandler); // Quitamos listener para este proceso
                resolve();
            }

            if (teclaPresionada == "e") {
                proceso.status = "ENTSAL";
                proceso.reinsertar = true;
                clearInterval(timer);
                document.removeEventListener("keyup", keyupHandler);
                resolve();
            }

            if (tiempoTranscurrido >= proceso.tiempoMax) {
                clearInterval(timer);
                document.removeEventListener("keyup", keyupHandler);
                resolve();
            }
        }, intervalo);
    });
};

/**
 * @param {string} operacion - Tipo de operacion a realizar
 * @param {Array} valores - Valores para la operacion
*/
const realizarOperacion = (operacion, valores, status) => {

    if (status === "ERROR") {
        return status;
    }
    else {
        switch (operacion) {
            case '+': return valores[0] + valores[1];
            case '-': return valores[0] - valores[1];
            case '*': return valores[0] * valores[1];
            case '/': return valores[0] / valores[1];
            case '%': return valores[0] % valores[1];
            case '^': return Math.pow(valores[0], valores[1]);
            default: return "Operación no válida";
        }
    }
};