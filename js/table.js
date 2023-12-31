
function createResultsTable(data){
    const container = document.getElementById("table-container");
    let fields = ["Network Name", "Time (sec)", "Mean Original Accuracy", "Mean Adv. Accuracy", "Mean Similarity"];

    while(container.firstChild) container.removeChild(container.firstChild)
    let table = document.createElement("table");
    table.className="ui celled sortable table";
    table.id="results-table"

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
    $('table').tablesort()
}

function createNNConfigsTable(data, tableid){
    const container = document.getElementById(tableid);
    let fields = ["Network Type", "# of Hidden Layers", "# of nodes per layer"];
    while(container.firstChild) container.removeChild(container.firstChild)
    let table = document.createElement("table");
    table.className="ui table";

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

    data.forEach(value=> {
        let row = document.createElement("tr")

        let type = document.createElement("td");
        type.innerText=value[0];

        let layer = document.createElement("td");
        layer.innerText=value[1];

        let node=document.createElement("td");
        node.innerText=value[2];

        let delButton=document.createElement("div");
        delButton.className="ui right floated icon button";
        delButton.onclick=function(){
            tbody.removeChild(row);
        }
        delButton.innerHTML='<i class="x icon"></i>';

        node.append(delButton)
        row.append(type, layer, node);
        tbody.append(row);
    })
    table.append(tbody);
    container.append(table);
}

function updateNNConfigsTable(data, tableid){
    const container = document.getElementById(tableid);
    table=container.firstElementChild;
    tbody=table.children[1];

    let row = document.createElement("tr")

    let type = document.createElement("td");
    type.innerText=data[0];

    let layer = document.createElement("td");
    layer.innerText=data[1];

    let node=document.createElement("td");
    node.innerText=data[2];

    let delButton=document.createElement("div");
    delButton.className="ui right floated icon button";
    delButton.onclick=function(){
        tbody.removeChild(row);
    }
    delButton.innerHTML='<i class="x icon"></i>';

    node.append(delButton);
    row.append(type, layer, node);
    tbody.append(row);
}

function readNNConfigsTableData2Array(tableid){
    const container = document.getElementById(tableid);
    let data =[];
    table=container.firstElementChild;
    body=table.children[1];
    for (let i=0; i < body.children.length; i++){
        const row = body.children[i];
        let rdata=[];
        for (let i=0; i<row.children.length; i++){
            cell=row.children[i]
            rdata.push(cell.innerText)
        }
        data.push(rdata);
    }
    return data;
}

function download_table_as_csv(table_id, separator = ',') {
    // Select rows from table_id
    var rows = document.querySelectorAll('table#' + table_id + ' tr');
    // Construct csv
    var csv = [];
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll('td, th');
        for (var j = 0; j < cols.length; j++) {
            // Clean innertext to remove multiple spaces and jumpline (break csv)
            var data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
            // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
            data = data.replace(/"/g, '""');
            // Push escaped string
            row.push('"' + data + '"');
        }
        csv.push(row.join(separator));
    }
    var csv_string = csv.join('\n');
    // Download it
    var filename = 'export_' + table_id + '_' + new Date().toLocaleDateString() + '.csv';
    var link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function drawAdvSample(data, sample_graph){
    let canvas =new OffscreenCanvas(28,28);
    let ctx = canvas.getContext("2d");
    canvas.width=28;
    canvas.height=28;
    // canvas.style.width=280;
    // canvas.style.height=280;

    let imgData = ctx.createImageData(28,28);
    let pixels = imgData.data;
    for (var i = 0; i < 28*28; i += 1) {
        let lightness = data[i]*255;
        pixels[i*4] = lightness;
        pixels[i*4 + 1] = lightness;
        pixels[i*4 + 2] = lightness;
        pixels[i*4 + 3] = 255;
    }
    ctx.putImageData(imgData,0,0);

    ctx = sample_graph.getContext("2d");
    // ctx.scale(10,10)
    ctx.drawImage(canvas, 0, 0);
}

function createAdvTable(data){
    const test_data = data.data
    const results_data = data.results
    const container = document.getElementById("adv-table-container");
    let fields = ["id", "Clean"];
    let keys=Object.keys(results_data);
    keys.forEach(key=>{
        fields.push(key);
    })

    while(container.firstChild) container.removeChild(container.firstChild)
    let table = document.createElement("table");
    table.className="ui sortable celled table";
    table.id="adv-table"

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
    tbody.style.overflow="scroll";

    for (let i =0; i < test_data.indicies.length; i +=1){
        let row = document.createElement("tr");

        let id = document.createElement("td");
        id.innerText=parseInt(test_data.indicies[i]);

        let td = document.createElement("td");
        let canvas = document.createElement("canvas");

        let wrapper = document.createElement("h4");
        wrapper.className="ui image header"

        let text = document.createElement("div");
        text.innerHTML="label=" + test_data.y[i];
        text.className="content";
        text.style.marginLeft="10px";

        canvas.width=28;
        canvas.height=28;
        canvas.className="zoomable";
        drawAdvSample(test_data.x[i],canvas);;
        wrapper.append(canvas,text)
        td.append(wrapper);

        row.append(id, td);

        for(let j=2; j < fields.length; j+=1){
            let td = document.createElement("td");

            let wrapper = document.createElement("h4");
            wrapper.className="ui image header"

            let text = document.createElement("div");
            y_pred=results_data[fields[j]].results.y_pred_ind_adv[i];
            text.innerHTML="y_pred=" + y_pred;
            text.style.marginLeft="10px";
            if (y_pred === test_data.y[i]){
                td.style.backgroundColor="#ef5350";
            }else{
                td.style.backgroundColor="#a5d6a7";
            }
            text.className="content";

            let canvas = document.createElement("canvas");
            canvas.width=28;
            canvas.height=28;
            canvas.className="zoomable"
            drawAdvSample(results_data[fields[j]].adv[i],canvas);
            wrapper.append(canvas, text)

            td.append(wrapper);
            row.append(td);
        }
        tbody.append(row);
    }
    table.append(tbody);
    container.append(table);
    $('table').tablesort()
}

async function createProjectsTable(){

    let projects = await getProjects();

    const container = document.getElementById("projects-table-container");

    let table = document.createElement("table");
    table.className="ui sortable celled table";
    table.id="projects-table"

    let thead = document.createElement("thead");
    let tr = document.createElement("tr");

    let th1 = document.createElement("th");
    let th2 = document.createElement("th");
    let th3 = document.createElement("th");
    let th4 = document.createElement("th");
    let th5 = document.createElement("th");
    let th6 = document.createElement("th");
    let th7 = document.createElement("th");
    th7.setAttribute("class", "dashboardcheck");
    th7.setAttribute("style", "display: none;");
    
    tr.append(th1);
    tr.append(th2);
    tr.append(th3);
    tr.append(th4);
    tr.append(th5);
    tr.append(th6);
    tr.append(th7);

    th1.innerHTML = "No."
    th2.innerHTML = "Name";
    th3.innerHTML = "Type";
    th4.innerHTML = "Created At";
    th5.innerHTML = "Updated At";
    th6.innerHTML = "";
    th7.innerHTML = "Action";

    thead.append(tr);
    table.append(thead);

    let tbody = document.createElement("tbody");
    tbody.style.overflow="scroll";
    let num = 1;

    projects.forEach((project) => {
        let row = document.createElement("tr");

        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        let td3 = document.createElement('td');
        let td4 = document.createElement('td');
        let td5 = document.createElement('td');
        let td6 = document.createElement('td');
        let td7 = document.createElement('td');
    
        let link = document.createElement('a');
        link.innerHTML = project.name;
        link.setAttribute('href', `ide.html?projectId=${project._id.$oid}`);

        let delAnchor = document.createElement('a');
        delAnchor.setAttribute('onclick', `deleteProject("${project._id.$oid}")`);
        delAnchor.setAttribute('style', 'cursor: pointer;');

        let del = document.createElement('i');
        del.setAttribute('class', `icon trash`);
        delAnchor.appendChild(del);
        
        let checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("class", "dashboardcheck");
        checkbox.setAttribute("project_id", `${project._id.$oid}`);
        checkbox.setAttribute("project_name", `${project.name}`);
        checkbox.setAttribute("style", "display: none;");

        td1.innerHTML = num.toString();
        td2.appendChild(link);
        td3.innerHTML = project.type;
        td4.innerHTML = project.created_at.$date;
        td5.innerHTML = project.updated_at.$date;
        td6.appendChild(delAnchor);
        td7.appendChild(checkbox);

        row.appendChild(td1);
        row.appendChild(td2);
        row.appendChild(td3);
        row.appendChild(td4);
        row.appendChild(td5);
        row.appendChild(td6);
        row.appendChild(td7);
    
        tbody.append(row);
        num += 1;
    });
    
    table.append(tbody);
    container.append(table);
    $('table').tablesort()
}

function createCharts(){
    let checkedProjects = document.querySelectorAll(".dashboardcheck");
    let redirect = false;
    let redirect_url = `${window.origin}/charts.html?default_charts=true&project_id=`;

    checkedProjects.forEach(ele => {
        if (ele.checked){
            redirect_url += `${ele.attributes.project_id.value}-${ele.attributes.project_name.value},`
        }
        redirect = true;
    });
    
    if (redirect){
        window.open(redirect_url, "_self");
    }
}

function showCreateCharts(){
    let projects = document.querySelectorAll(".dashboardcheck");
    projects.forEach(ele => {
        ele.setAttribute("style", "display:block;");
    });
    document.getElementById("toggle-btn-charts").setAttribute("style", "display:none;");
    document.getElementById("save-btn-charts").setAttribute("style", "display:block;");
}