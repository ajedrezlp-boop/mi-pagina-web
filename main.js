// Simple script to handle smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
// Variables globales
let eloChart;
let modal;

// Inicialización del gráfico (Chart.js)
function initializeChart() {
    const ctx = document.getElementById('eloChart').getContext('2d');
    eloChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Se llenarán con los índices del historial
            datasets: [{
                label: 'Evolución de ELO',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                tension: 0.4, // Suaviza las curvas
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `ELO: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Partidas'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'ELO'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}

// Función para actualizar el gráfico
function updateChart(playerName, eloHistory) {
    eloChart.data.labels = Array.from({ length: eloHistory.length }, (_, i) => i + 1); // Índices de las partidas
    eloChart.data.datasets[0].data = eloHistory;
    eloChart.data.datasets[0].label = `Evolución de ELO - ${playerName}`;
    eloChart.update();
}

// Función para cargar los datos de variación de ELO del reporte resumido
async function loadEloVariations() {
    try {
        const response = await fetch('reporte_resumido.json');
        const data = await response.json();
        return data.variaciones_totales || {};
    } catch (error) {
        console.error('Error loading ELO variations:', error);
        return {};
    }
}

// Función para cargar datos de ranking con funcionalidad de clic y variaciones de ELO
async function loadTableDataFromFile(fileName, mode = 'standard') {
    try {
        // Cargar las variaciones de ELO primero
        const variations = await loadEloVariations();
        
        // Luego cargar los datos de los jugadores
        const response = await fetch(fileName);
        const data = await response.json();
        
        const tableBody = document.getElementById('rankingTable');
        tableBody.innerHTML = ''; // Limpiar tabla

        // Ordenar jugadores por el último ELO del historial
        data.sort((a, b) => {
            const lastEloA = mode === 'blitz' ? a.historial_elo_blitz.at(-1) || 0 : a.historial_elo.at(-1) || 0;
            const lastEloB = mode === 'blitz' ? b.historial_elo_blitz.at(-1) || 0 : b.historial_elo.at(-1) || 0;
            return lastEloB - lastEloA;
        });

        data.forEach((player, index) => {
            const elo = mode === 'blitz' ? player.historial_elo_blitz.at(-1) : player.historial_elo.at(-1);
            if (elo !== undefined) {
                // Obtener la variación de ELO para este jugador
                const variation = variations[player.nombre] || 0;
                
                // Formatear la variación para mostrarla
                const variationFormatted = variation.toFixed(2);
                const variationClass = variation > 0 ? 'text-success' : variation < 0 ? 'text-danger' : 'text-secondary';
                const variationPrefix = variation > 0 ? '+' : '';
                
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${player.nombre}</td>
                    <td>${elo}</td>
                    <td class="${variationClass}">${variationPrefix}${variationFormatted}</td>`;
                tableBody.appendChild(newRow);

                // Evento click para cada fila
                newRow.addEventListener('click', () => {
                    const eloHistory = mode === 'blitz' ? player.historial_elo_blitz : player.historial_elo;
                    updateChart(player.nombre, eloHistory);

                    // Mostrar el modal
                    showModal();
                });
            }
        });
    } catch (error) {
        console.error('Error loading the ranking data:', error);
    }
}

// Funciones para el modal (sin Bootstrap)
function showModal() {
    modal.classList.add('show');
}

function hideModal() {
    modal.classList.remove('show');
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el modal
    modal = document.getElementById('eloModal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    closeModalBtn.addEventListener('click', hideModal);
    
    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });
    
    // Inicializar el gráfico y cargar datos
    initializeChart();
    loadTableDataFromFile('jugadores_actualizados.json', 'standard');

    // Asignar eventos a los botones
    const btnStandard = document.getElementById('btnStandard');
    const btnBlitz = document.getElementById('btnBlitz');

    btnStandard.addEventListener('click', (e) => {
        e.preventDefault();
        loadTableDataFromFile('jugadores_actualizados.json', 'standard');
        btnStandard.classList.add('active');
        btnBlitz.classList.remove('active');
    });

    btnBlitz.addEventListener('click', (e) => {
        e.preventDefault();
        loadTableDataFromFile('jugadores_actualizados.json', 'blitz');
        btnBlitz.classList.add('active');
        btnStandard.classList.remove('active');
    });
});


        // Modal functions
        function showSchedule() {
            document.getElementById('scheduleModal').classList.add('show');
        }

        function showPrizes() {
            document.getElementById('prizesModal').classList.add('show');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('show');
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const scheduleModal = document.getElementById('scheduleModal');
            const prizesModal = document.getElementById('prizesModal');
            
            if (event.target === scheduleModal) {
                scheduleModal.classList.remove('show');
            }
            if (event.target === prizesModal) {
                prizesModal.classList.remove('show');
            }
        }

        // Placeholder functions for existing buttons
        function showRegistration() {
            alert('Función de inscripción - Por implementar');
        }

        function showRules() {
            alert('Bases del torneo - Por implementar');
        }

        function showPlayers() {
            alert('Jugadores inscriptos - Por implementar');
        }

        // Close modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                document.querySelectorAll('.modal.show').forEach(modal => {
                    modal.classList.remove('show');
                });
            }
        });