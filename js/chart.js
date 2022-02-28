const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);
const randomRGB = (alpha) => `rgb(${randomNum()}, ${randomNum()}, ${randomNum()}, ${alpha})`;
var speed_chart;
var accuracy_chart;
var accuracy_diff_chart;
var similarity_chart;

function drawSpeedChart(data){
    const ctx = document.getElementById('speedChart').getContext('2d');
    var x_labels = [];
    var y_data = [];
    var colors = [];
    var border_colors = [];
    const keys = Object.keys(data);
    keys.forEach(function(key){
        x_labels.push(key);
        // console.log(data[key].stats.time)
        y_data=y_data.concat(data[key].stats.time);
        colors.push(randomRGB(0.95));
        border_colors.push(randomRGB(1));
    }
    );

    const speed_chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: x_labels,
            datasets: [{
                label: 'MyAlgo',
                data: y_data,
                backgroundColor: colors,
                borderColor: border_colors,
                borderWidth: 0
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    return speed_chart
}

function drawAccuracyChart(data){
    const ctx = document.getElementById('accuracyChart').getContext('2d');
    var x_labels = [];
    var y_data = [];
    var y1_data =[];
    var colors = [];
    var border_colors = [];
    const keys = Object.keys(data);
    keys.forEach(function(key){
        x_labels.push(key);
        y_data.push(data[key].stats.accuracy);
        y1_data.push(data[key].stats.accuracy_adv);
        // console.log(data[key].stats.accuracy_adv);
    }
    );
    const accuracy_chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: x_labels,
            datasets: [{
                label: 'Original Accuracy',
                data: y_data,
                backgroundColor: randomRGB(0.9),
                borderColor: randomRGB(0.9),
                borderWidth: 1
            },
            {
                label: 'Adversarial Accuracy',
                data: y1_data,
                backgroundColor: randomRGB(0.9),
                borderColor: randomRGB(0.9),
                borderWidth: 0
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    return accuracy_chart
}

function drawAccuracyDiffChart(data){
    const ctx = document.getElementById('accuracyDiffChart').getContext('2d');
    var x_labels = [];
    var y_data = [];
    var y1_data =[];
    const keys = Object.keys(data);
    keys.forEach(function(key){
        x_labels.push(key);
        y = data[key].stats.accuracy
        y1 = data[key].stats.accuracy_adv
        y_data.push(y-y1);
        // console.log(data[key].stats.accuracy_adv);
    }
    );
    const accuracy_chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: x_labels,
            datasets: [{
                label: 'Original - Adversarial Accuracy',
                data: y_data,
                fill: true,
                borderColor: randomRGB(0.9),
                tension: 0.5
            }]
        },
        options: {
            pointDotRadius : 6,
            pointDotStrokeWidth : 2,
            datasetStrokeWidth : 3,
            scaleShowVerticalLines: false,
            scaleGridLineWidth : 2,
            scaleShowGridLines : true,
            scaleGridLineColor : "rgba(225, 255, 255, 0.02)",
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    return accuracy_chart
}

function drawSimilarityChart(data){
    const ctx = document.getElementById('similarityChart').getContext('2d');
    var x_labels = [];
    var y_data = [];
    var colors = [];
    var border_colors = [];
    const keys = Object.keys(data);
    keys.forEach(function(key){
        x_labels.push(key);
        y_data.push(data[key].stats.mean_similarity);
        colors.push(randomRGB(0.9));
        border_colors.push(randomRGB(1));
    }
    );

    const similarity_chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: x_labels,
            datasets: [{
                label: 'MyAlgo',
                data: y_data,
                backgroundColor: colors,
                borderColor: border_colors,
                borderWidth: 0
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    return similarity_chart
}

function cleanChart(){
    if (typeof speed_chart === 'undefined' || typeof accuracy_chart === 'undefined' || typeof similarity_chart === 'undefined') {
        return;
    }
    speed_chart.destroy();
    accuracy_chart.destroy();
    similarity_chart.destroy();
    accuracy_diff_chart.destroy();
}

function drawChart(data) {
    cleanChart();
    speed_chart = drawSpeedChart(data);
    accuracy_chart = drawAccuracyChart(data);
    accuracy_diff_chart = drawAccuracyDiffChart(data);
    similarity_chart = drawSimilarityChart(data);
}