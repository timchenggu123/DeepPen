const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);
const randomRGB = (alpha) => `rgb(${randomNum()}, ${randomNum()}, ${randomNum()}, ${alpha})`;
var speed_chart;
var accuracy_chart;
var similarity_chart;

function draw_speed_chart(data){
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
        colors.push(randomRGB(0.2));
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
                borderWidth: 1
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

function draw_accuracy_chart(data){
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
        colors.push(randomRGB(0.2));
        border_colors.push(randomRGB(1));
    }
    );
    

    const accuracy_chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: x_labels,
            datasets: [{
                label: 'Original Accuracy',
                data: y_data,
                backgroundColor: colors,
                borderColor: border_colors,
                borderWidth: 1
            },
            {
                label: 'Adversarial Accuracy',
                data: y1_data,
                backgroundColor: colors,
                borderColor: border_colors,
                borderWidth: 1
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

function draw_similarity_chart(data){
    const ctx = document.getElementById('similarityChart').getContext('2d');
    var x_labels = [];
    var y_data = [];
    var colors = [];
    var border_colors = [];
    const keys = Object.keys(data);
    keys.forEach(function(key){
        x_labels.push(key);
        y_data.push(data[key].stats.mean_similarity);
        colors.push(randomRGB(0.2));
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
                borderWidth: 1
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

function clean_chart(){
    if (typeof speed_chart === 'undefined' || typeof accuracy_chart === 'undefined' || typeof similarity_chart === 'undefined') {
        return;
    }
    speed_chart.destroy();
    accuracy_chart.destroy();
    similarity_chart.destroy();
}

function draw_chart(data) {
    clean_chart();
    speed_chart = draw_speed_chart(data);
    accuracy_chart = draw_accuracy_chart(data);
    similarity_chart = draw_similarity_chart(data);
}