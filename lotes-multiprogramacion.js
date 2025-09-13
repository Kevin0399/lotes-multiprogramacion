//Elementos HTML

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
let encabezadoTablaTerminados = document.createElement('tr');
let tablaTerminadosDiv = document.createElement('div'); // Contenedor de la tabla de terminados
let contenedorEstados = document.createElement('div'); // Contenedor de los estados que puede tener un proceso
let ejecucionDiv = document.createElement('div'); // Contenedor de la informacion de ejecucion
let contenedorPrincipal = document.createElement('div');
let contadorGlobal = document.createElement('div'); // Contiene el contador global 

// Todo esto son asignaciones de elementos HTML al DOM y creaciones de clases para css
contadorLotesPendientes.classList.add('contadorLotesPendientes');
contadorLoteActual.classList.add('contadorLoteActual');

tituloPendientes.textContent = "Procesos Pendientes";

encabezadoTablaEspera.innerHTML = "<th>NOMBRE</th><th>TME</th>";
tablaEspera.appendChild(encabezadoTablaEspera);

tablaEsperaDiv.classList.add('tablaEsperaDiv');
tablaEsperaDiv.appendChild(tituloPendientes);
tablaEsperaDiv.appendChild(tablaEspera);

tituloEjecucion.textContent = "Proceso en Ejecución";

mostrarEjecucion.classList.add('mostrarEjecucion');

tituloTerminados.textContent = "Procesos Terminados";

encabezadoTablaTerminados.innerHTML = "<th>ID</th><th>OPERACION</th><th>RESULTADO</th><th>NL</th>";
tablaTerminados.appendChild(encabezadoTablaTerminados);

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


class Proceso {
    constructor(nombre, operacion, valores, id, tiempoMax) {
        this.nombre = nombre;
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


/**
 * @param {Object[]} matrizLotes Matriz que contiene los lotes de procesos
 */
const ejecutarLotes = async (Lotes) => {

    Lotes.numLotes = Lotes.matrizLotes.length; // Determinamos la cantidad de lotes
    Lotes.lotesPendientes = Lotes.numLotes; // Inicializamos el contador de lotes pendientes
    // Realizamos una iteracion por cada lote
    for (let i = 0; i < Lotes.numLotes; i++) {
        console.log(Lotes.lotesPendientes);
        await ejecutarProceso(Lotes);
    }
}

/**
 * 
 * @param {Number} numLotes        Almacena el numero de lotes total de la matrix
 * @param {Number} lotesPendientes Almacena la cantidad de lotes pendientes
 * @param {Object<Lotes>} Lotes    Objeto que contiene la matriz de lotes y el contador global     
 */
// Funcion que lleva a cabo la ejecucion de un proceso
const ejecutarProceso = async (Lotes) => {
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
            fila.innerHTML = `<td>${procesosPendientes[k].nombre}</td><td>${((procesosPendientes[k].tiempoRestante) / 1000).toFixed(1)} s </td>`;
            tablaEspera.appendChild(fila);
        }
        // Determinamos el simbolo de la operacion
        let simbolo = determinarOperacion(enEjecucion.operacion);

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
        <td>${enEjecucion.valores[0]} ${simbolo} ${enEjecucion.valores[1]}</td>
                                   <td>${enEjecucion.resultado}</td>
                                   <td>${numLoteActual}</td>`;
            tablaTerminados.appendChild(filaTerminado);
        }
    }
}

/**
 * 
 * @param {Objeto<Proceso>} proceso Recibe el proceso en ejecucion
 * @returns 
 */
// Cronómetro asíncrono que espera el tiempo del proceso
const cronometroAsync = async (proceso, Lotes) => {
    let tiempoTranscurrido = proceso.tiempoTranscurrido || 0;
    const intervalo = 100; // Actualiza cada 100 ms
    // proceso.tiempoRestante = proceso.tiempoMax - tiempoTranscurrido;
    let teclaPresionada = "c";

    // Detetectar cuando se presione una tecla
    document.addEventListener("keyup", (event) => {
        teclaPresionada = event.key.toLowerCase();
    });


    console.log({ teclaPresionada });

    return new Promise((resolve) => {
        const timer = setInterval(() => {
            tiempoTranscurrido += intervalo; // Tiempo de la ejecucion actual
            proceso.tiempoTranscurrido = tiempoTranscurrido; // Contador de la ejecucion global del proceso
            Lotes.tiempoTotalTranscurrido += intervalo; //  Actualizamos el tiempo global
            proceso.tiempoRestante = proceso.tiempoMax - proceso.tiempoTranscurrido;

            let simbolo = determinarOperacion(proceso.operacion);
            // Creamos una tabla para mostrar la informacion del proceso en ejecucion
            mostrarEjecucion.innerHTML = `
                <table class="infoProceso">
                    <tr><th colspan="2">Información del Proceso</th></tr>
                    <tr><td><b>ID:</b></td><td>${proceso.id}</td></tr>
                    <tr><td><b>TME:</b></td><td>${(proceso.tiempoMax / 1000).toFixed(1)} s (${proceso.tiempoMax} ms </td></tr>
                    <tr><td><b>Operación:</b></td><td>${proceso.valores[0]} ${simbolo} ${proceso.valores[1]}</td></tr>
                    <tr><td><b>Tiempo transcurrido:</b></td><td>${(tiempoTranscurrido / 1000).toFixed(1)} s (${tiempoTranscurrido} ms)</td></tr>
                    <tr><td><b>Tiempo restante:</b></td><td>${((proceso.tiempoMax - tiempoTranscurrido) / 1000).toFixed(1)} s (${Math.max(proceso.tiempoRestante, 0)} ms)</td></tr>
                </table>
            `;
            // Actualizamos el contador global
            contadorGlobal.innerText = `Tiempo total global: ${(Lotes.tiempoTotalTranscurrido / 1000).toFixed(1)} s (${Lotes.tiempoTotalTranscurrido}ms)`;

            // Si se presiona "w" (error en el proceso)
            if (teclaPresionada == "w") {
                console.log(teclaPresionada);
                tiempoTranscurrido = proceso.tiempoMax + 100; // Finalizamos la ejecucion del proceso
                proceso.status = "ERROR";
            }

            // Si se presiona "e"(Entrada/Salida)
            if (teclaPresionada == "e") {
                console.log(teclaPresionada);
                proceso.status = "ENTSAL";
                proceso.reinsertar = true; // ⚠️ Nueva marca para reenviarlo al final
                tiempoTranscurrido = proceso.tiempoMax + 100;
            }

            if (tiempoTranscurrido >= proceso.tiempoMax) {
                clearInterval(timer);
                resolve();
            }
        }, intervalo);
    });
};

/**
 * 
 * @param {String} operacion - Tipo de operacion a realizar
 */
// Solo determina el simbolo de la operacion
const determinarOperacion = (operacion) => {
    switch (operacion) {
        case 'suma': return '+';
        case 'resta': return '-';
        case 'multiplicacion': return '*';
        case 'division': return '/';
        case 'residuo': return '%';
        case 'potencia': return '^';
        default: return '?';
    }
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
            case 'suma': return valores[0] + valores[1];
            case 'resta': return valores[0] - valores[1];
            case 'multiplicacion': return valores[0] * valores[1];
            case 'division': return valores[0] / valores[1];
            case 'residuo': return valores[0] % valores[1];
            case 'potencia': return Math.pow(valores[0], valores[1]);
            default: return "Operación no válida";
        }
    }
};


// FUNCION PRUEBA - GENERACION DE LOTES
/**
 * Crea una matriz de 3 filas y 4 columnas llena de objetos Proceso.
 * @returns {Proceso[][]} Matriz 3x4 de instancias de Proceso
 */
function crearMatrizProcesos() {
    const filas = 3;
    const columnas = 4;
    const matriz = [];
    let idCounter = 1;

    for (let i = 0; i < filas; i++) {
        const fila = [];
        for (let j = 0; j < columnas; j++) {
            const nombre = `Proceso_${i}_${j}`;
            const operacion = "suma"; // o puedes alternar entre operaciones
            const valores = [
                Math.floor(Math.random() * 100),
                Math.floor(Math.random() * 100)
            ];
            const id = idCounter++;
            const tiempoMax = Math.floor(Math.random() * 5000) + 1000; // entre 1s y 6s

            const proceso = new Proceso(nombre, operacion, valores, id, tiempoMax);
            fila.push(proceso);
        }
        matriz.push(fila);
    }

    return matriz;
}

let matriz = crearMatrizProcesos();
let lotes = new Lotes(matriz); // Guardamos la matriz de lotes en el obejeto
ejecutarLotes(lotes);
