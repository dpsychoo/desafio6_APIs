async function convertirMoneda() {
    const clp = document.getElementById('clp').value;
    const divisa = document.getElementById('divisa').value;
    const resultElement = document.getElementById('result');
    const errorElement = document.getElementById('error');

    // Limpiar mensajes previos
    resultElement.innerText = '';
    errorElement.innerText = '';

    if (clp === '') {
        alert('Por favor ingrese una cantidad en CLP.');
        return;
    }

    /* 2. Se calcula correctamente el cambio y se muestra en el DOM */
    try {
        // Realizar la conversión de moneda
        const tasaConversion = await obtenerTasaConversion(divisa);
        console.log(`Tasa de conversión obtenida: ${tasaConversion}`);
        const cantidadConvertida = (clp / tasaConversion).toFixed(2);
        resultElement.innerText = `Resultado: $${cantidadConvertida}`;

        // Historial últimos 10 días del valor de la moneda seleccionada
        const historial = await obtenerHistorial(divisa);
        console.log('Historial obtenido:', historial);

        // Renderizar la gráfica con el historial
        renderizarGrafica(historial);
    } catch (error) {
        console.error('Error en la función convertirMoneda:', error.message);
        errorElement.innerText = `Error: ${error.message}`;
    }
}

/* 1. Se obtienen los tipos de cambio desde mindicador.cl */
/* 4. Se usa try catch para ejecutar el método fetch y capturar los posibles errores
mostrando el error en el DOM en caso de que haya problemas */
async function obtenerTasaConversion(divisa) {
    try {
        const response = await fetch('https://mindicador.cl/api/');
        if (!response.ok) {
            throw new Error('Error al obtener la tasa de conversión');
        }
        const data = await response.json();
        console.log('Datos de API obtenidos:', data);
        return data[divisa].valor;
    } catch (error) {
        console.error('Error en la función obtenerTasaConversion:', error.message);
        throw new Error('Error al obtener la tasa de conversión');
    }
}

async function obtenerHistorial(divisa) {
    try {
        const response = await fetch(`https://mindicador.cl/api/${divisa}`);
        if (!response.ok) {
            throw new Error('Error al obtener el historial');
        }
        const data = await response.json();
        console.log('Historial API obtenido:', data);
        const historial = data.serie.slice(0, 10).map(entry => ({
            fecha: entry.fecha.split('T')[0],
            valor: entry.valor
        }));
        return historial;
    } catch (error) {
        console.error('Error en la función obtenerHistorial:', error.message);
        throw new Error('Error al obtener el historial');
    }
}

/* 5. Se Implementa el gráfico pedido */
function renderizarGrafica(historial) {
    const ctx = document.getElementById('chart').getContext('2d');
    const labels = historial.map(entry => entry.fecha);
    const data = historial.map(entry => entry.valor);
    console.log('Datos para graficar:', labels, data);
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Historial últimos 10 días',
                data: data,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor'
                    }
                }
            }
        }
    });
}
