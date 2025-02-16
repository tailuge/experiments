let lossChart = null;

// Initialize Chart.js Loss Graph
function initializeLossChart() {
    const ctx = document.getElementById("lossChart").getContext("2d");
    lossChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Training Loss",
                    data: [],
                    borderColor: "rgba(0,122,204,1)",
                    fill: false
                },
            ],
        },
        options: {
            scales: {
                x: {
                    title: { display: true, text: "Epoch" },
                },
                y: {
                    title: { display: true, text: "Loss" },
                },
            },
        },
    });
}

// Update Loss Chart
function updateLossChart(epoch, loss) {
    lossChart.data.labels.push(epoch);
    lossChart.data.datasets[0].data.push(loss);
    lossChart.update();
}

function logWithTime(message) {
    const now = new Date();
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const milliseconds = now.getMilliseconds().toString().padStart(3, "0");
    console.log(`[${seconds}.${milliseconds}] ${message}`);
  }

// Initialize the loss graph when the page loads
window.onload = function () {
    initializeLossChart();
};
