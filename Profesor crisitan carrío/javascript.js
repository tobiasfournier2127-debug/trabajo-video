// Array principal que almacena los equipos, cargados desde localStorage o vacío si no hay nada
let listaEquipos = JSON.parse(localStorage.getItem('equipos')) || [];

// Elementos del DOM
const form = document.getElementById('equiposForm');
const tablaCuerpo = document.getElementById('tablaCuerpo');
const inputBuscar = document.getElementById('inputBuscar');
const filtroEstado = document.getElementById('filtroEstado');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');
const btnExportar = document.getElementById('btnExportar');
const inputImportar = document.getElementById('inputImportar');

// Contadores DOM
const countTotal = document.getElementById('countTotal');
const countOperativo = document.getElementById('countOperativo');
const countReparacion = document.getElementById('countReparacion');
const countDescartado = document.getElementById('countDescartado');

// Evento principal para guardar o actualizar un equipo
form.addEventListener('submit', function(e) {
    e.preventDefault();

    const id = document.getElementById('equipoId').value;
    const tipo = document.getElementById('tipo').value;
    const titular = document.getElementById('titular').value;
    const marca = document.getElementById('marca').value;
    const procesador = document.getElementById('procesador').value;
    const ram = document.getElementById('ram').value;
    const almacenamiento = document.getElementById('almacenamiento').value;
    const estado = document.getElementById('estado').value;

    if (id === "") {
        // Crear nuevo equipo con un ID único basado en el tiempo actual
        const nuevoEquipo = {
            id: Date.now(),
            tipo, titular, marca, procesador, ram, almacenamiento, estado
        };
        listaEquipos.push(nuevoEquipo);
    } else {
        // Actualizar equipo existente
        const index = listaEquipos.findIndex(eq => eq.id == id);
        if (index !== -1) {
            listaEquipos[index] = { id: Number(id), tipo, titular, marca, procesador, ram, almacenamiento, estado };
        }
        limpiarModoEdicion();
    }

    sincronizarYRenderizar();
    form.reset();
});

// Función para guardar en localStorage y actualizar la interfaz
function sincronizarYRenderizar() {
    localStorage.setItem('equipos', JSON.stringify(listaEquipos));
    renderizarTabla();
    actualizarContadores();
}

// Función para renderizar (dibujar) la tabla aplicando búsqueda y filtros
function renderizarTabla() {
    tablaCuerpo.innerHTML = "";
    
    let textoBusqueda = inputBuscar.value.toLowerCase();
    let estadoFiltro = filtroEstado.value;

    let equiposFiltrados = listaEquipos.filter(eq => {
        let coincideTexto = eq.titular.toLowerCase().includes(textoBusqueda) || eq.marca.toLowerCase().includes(textoBusqueda);
        let coincideEstado = (estadoFiltro === "Todos" || eq.estado === estadoFiltro);
        return coincideTexto && coincideEstado;
    });

    equiposFiltrados.forEach(eq => {
        let fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${eq.tipo}</td>
            <td>${eq.titular}</td>
            <td>${eq.marca}</td>
            <td>${eq.procesador}</td>
            <td>${eq.ram}</td>
            <td>${eq.almacenamiento}</td>
            <td>${eq.estado}</td>
            <td>
                <button class="btn-warning-action" onclick="cargarParaEditar(${eq.id})">Editar</button>
                <button class="btn-danger" onclick="eliminarEquipo(${eq.id})">Eliminar</button>
            </td>
        `;
        tablaCuerpo.appendChild(fila);
    });
}

// Función para actualizar los contadores en pantalla
function actualizarContadores() {
    countTotal.innerText = listaEquipos.length;
    countOperativo.innerText = listaEquipos.filter(eq => eq.estado === 'Operativo').length;
    countReparacion.innerText = listaEquipos.filter(eq => eq.estado === 'En reparación').length;
    countDescartado.innerText = listaEquipos.filter(eq => eq.estado === 'Descartado').length;
}

// Eliminar equipo por ID
function eliminarEquipo(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este equipo?")) {
        listaEquipos = listaEquipos.filter(eq => eq.id !== id);
        sincronizarYRenderizar();
    }
}

// Cargar datos al formulario para edición
function cargarParaEditar(id) {
    let eq = listaEquipos.find(item => item.id == id);
    if (eq) {
        document.getElementById('equipoId').value = eq.id;
        document.getElementById('tipo').value = eq.tipo;
        document.getElementById('titular').value = eq.titular;
        document.getElementById('marca').value = eq.marca;
        document.getElementById('procesador').value = eq.procesador;
        document.getElementById('ram').value = eq.ram;
        document.getElementById('almacenamiento').value = eq.almacenamiento;
        document.getElementById('estado').value = eq.estado;

        btnGuardar.innerText = "Actualizar Equipo";
        btnCancelar.style.display = "inline-block";
    }
}

// Cancelar edición
btnCancelar.addEventListener('click', function() {
    form.reset();
    limpiarModoEdicion();
});

function limpiarModoEdicion() {
    document.getElementById('equipoId').value = "";
    btnGuardar.innerText = "Guardar Equipo";
    btnCancelar.style.display = "none";
}

// Eventos para búsqueda y filtros en tiempo real
inputBuscar.addEventListener('input', renderizarTabla);
filtroEstado.addEventListener('change', renderizarTabla);

// Exportar datos a archivo JSON
btnExportar.addEventListener('click', function() {
    let datosJson = JSON.stringify(listaEquipos, null, 2);
    let blob = new Blob([datosJson], { type: 'application/json' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'equipos_informaticos.json';
    a.click();
    URL.revokeObjectURL(url);
});

// Importar datos desde un archivo JSON
inputImportar.addEventListener('change', function(e) {
    let archivo = e.target.files[0];
    if (!archivo) return;

    let lector = new FileReader();
    lector.onload = function(evento) {
        try {
            let datosCargados = JSON.parse(evento.target.result);
            if (Array.isArray(datosCargados)) {
                listaEquipos = datosCargados;
                sincronizarYRenderizar();
                alert("Datos importados correctamente.");
            } else {
                alert("El archivo no tiene el formato correcto.");
            }
        } catch (error) {
            alert("Error al leer el archivo JSON.");
        }
    };
    lector.readAsText(archivo);
});

// Inicializar la tabla y contadores al cargar la página
renderizarTabla();
actualizarContadores();