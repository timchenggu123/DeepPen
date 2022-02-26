const ctx = document.getElementById('myChart').getContext('2d');

function draw_chart(data) {
    var x_labels = [];
    var y_data = [];
    const keys = Object.keys(data);
    keys.forEach(function(key){
        x_labels.push(key);
        // console.log(data[key].stats.time)
        y_data =y_data.concat(data[key].stats.time);
    }
    );
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            // labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            labels: x_labels,
            datasets: [{
                label: '# of Votes',
                // data: [12, 19, 3, 5, 2, 3],
                data: y_data,
                backgroundColor: [
                    // 'rgba(255, 99, 132, 0.2)',
                    // 'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    // 'rgba(255, 99, 132, 1)',
                    // 'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
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
}