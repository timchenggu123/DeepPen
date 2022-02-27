const container = document.getElementById("table-container");
let fields = ["Network Name", "Time (sec)", "Mean Original Accuracy", "Mean Adv. Accuracy", "Mean Similarity"];

function createTable(data){
    while(container.firstChild) container.removeChild(container.firstChild)
    let table = document.createElement("table");
    table.className="ui celled table";

    let thead = document.createElement("thead");
    let tr = document.createElement("tr");
    fields.forEach(field => {
        let th = document.createElement("th");
        th.innerText=field;
        tr.append(th);
    })
    thead.append(tr);
    table.append(thead);
    let tbody = document.createElement("tbody");

    keys = Object.keys(data);
    keys.forEach(key => {
        let name = document.createElement("td");
        name.innerText=key;

        let time = document.createElement("td");
        time.innerText=data[key].stats.time;

        let accuracy=document.createElement("td");
        accuracy.innerText=data[key].stats.accuracy;

        let accuracy_adv=document.createElement("td")
        accuracy_adv.innerText=data[key].stats.accuracy_adv;

        let similarity=document.createElement("td")
        similarity.innerText=data[key].stats.mean_similarity;

        let row = document.createElement("tr")
        row.append(name, time, accuracy, accuracy_adv, similarity);
        tbody.append(row);
    })
    table.append(tbody);
    container.append(table);
}