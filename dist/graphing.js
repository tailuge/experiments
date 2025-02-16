let lossChart;

function initChart(canvasElement) {
    const ctx = canvasElement.getContext('2d');
    lossChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 100}, (_, i) => i + 1),
            datasets: [{
                label: 'Loss',
                data: Array(100).fill(null),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            animation: false,
            scales: {
                y: {
                    type: 'logarithmic',
                    min: 0.25,
                    max: 5,
                    title: {
                        display: true,
                        text: 'Loss'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Epoch'
                    }
                }
            }
        }
    });
}

function updateChart(losses) {
    const recentLosses = losses.slice(-100);
    lossChart.data.datasets[0].data = recentLosses;
    lossChart.update('none'); // Disable animation on update
}
