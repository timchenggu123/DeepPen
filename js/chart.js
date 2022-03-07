
const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);
const randomRGB = (alpha) => `rgb(${randomNum()}, ${randomNum()}, ${randomNum()}, ${alpha})`;
var speed_chart;
var accuracy_chart;
var accuracy_diff_chart;
var similarity_chart;
var transferability_charts;

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
                    beginAtZero: true,
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return value + 's';
                        }
                    }
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
                    min:0,
                    max:1,
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return 100*value + '%';
                        }
                    }
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
                fillColor: randomRGB(0.9),
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
                    min:0,
                    max:1,
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return 100*value + '%';
                        }
                    }
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
                    min:0,
                    max:1,
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return 100*value + '%';
                        }
                    }
                }
            }
        }
    });
    return similarity_chart
}

const annotation = {
    annotations: {
      line1: {
        type: 'line',
        yMin: 0.25,
        yMax: 0.25,
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        borderDash: [5],
      }
    }
  };

function drawTransferabilityChart(canvas, data, adv, original){
    const ctx = canvas.getContext('2d');
    var x_labels = [];
    var y_data=[];

    const keys = Object.keys(data);
    keys.forEach(function(key){
        x_labels.push(key);
        y_data.push(data[key].accuracy-data[key].accuracy_adv);
    });
    const trans_chart = new Chart(ctx, {
        data: {
            labels: x_labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Transfered Drop in Accuracy',
                    data: y_data,
                    backgroundColor: randomRGB(0.9),
                    borderColor: randomRGB(0.2),
                    borderWidth: 0
                }]
        },
        options: {
            scales: {
                y: {
                    display: true,
                    stacked: true,
                    min: 0, // minimum value
                    max: 1 // maximum value
                }
            },
            plugins:{
                annotation: {
                    annotations: {
                      original_box: {
                        type: 'box',
                        yMin: 0,
                        yMax: original-adv,
                        backgroundColor: randomRGB(0.20),
                      },
                      original_line:{
                        type: 'line',
                        yMin: original-adv,
                        yMax: original-adv,
                        border_colors: randomRGB(0.9),
                        borderWidth: 2,
                        enabled: true,
                        label:{
                            enabled:true,
                            content:"Original Drop in Accuracy",
                            backgroundColor:randomRGB(0.7),
                        }
                      }
                    }
                }
            }
        }
    });
    return trans_chart
}

function drawTransferabilityCharts(data){
    console.log("Hello!")
    const trans_menu = document.getElementById('transfer-menu');
    const transfer_tabs = document.getElementById("transfer-charts");
    let charts = []
    keys = Object.keys(data);
    let first = true;
    keys.forEach(key=>{
        //create menu
        let a = document.createElement("a");
        a.className=first?"active item":"item";
        a.setAttribute("data-tab", key + "-trans-chart");
        a.innerText=key;
        
        const chart_id =key + "-trans-chart"
        let tab = document.createElement("div");
        tab.className=first?"ui active tab":"ui tab";
        first=false
        tab.setAttribute("data-tab", chart_id);

        let trans_data=data[key].trans_res;
        let canvas = document.createElement("canvas");
        canvas.className="chart";
        canvas.id=chart_id
        tab.append(canvas)
        trans_menu.append(a);
        transfer_tabs.append(tab);
        
        const adv=data[key].stats.accuracy_adv;
        const original=data[key].stats.accuracy;
        transfer_chart=drawTransferabilityChart(canvas, trans_data, adv, original);
        charts.push(transfer_chart);
    });
    return charts;
}

function cleanChart(){
    if (typeof speed_chart === 'undefined' || typeof accuracy_chart === 'undefined' || typeof similarity_chart === 'undefined') {
        return;
    }
    speed_chart.destroy();
    accuracy_chart.destroy();
    similarity_chart.destroy();
    accuracy_diff_chart.destroy();
    transferability_charts.forEach(chart=>{console.log(chart);chart.destroy();})
    const trans_menu = document.getElementById('transfer-menu');
    const transfer_tabs = document.getElementById("transfer-charts");
    while(trans_menu.firstChild) trans_menu.removeChild(trans_menu.firstChild)
    while(transfer_tabs.firstChild) transfer_tabs.removeChild(transfer_tabs.firstChild)

}



function drawChart(data) {
    cleanChart();
    speed_chart = drawSpeedChart(data);
    accuracy_chart = drawAccuracyChart(data);
    accuracy_diff_chart = drawAccuracyDiffChart(data);
    similarity_chart = drawSimilarityChart(data);
    transferability_charts = drawTransferabilityCharts(data);
    $('.tabular.menu .item').tab()
}