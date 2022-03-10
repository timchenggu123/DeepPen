const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);
const randomRGB = (alpha) => `rgb(${randomNum()}, ${randomNum()}, ${randomNum()}, ${alpha})`;
var chartLayout;

function localStorageSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (ignorable) {
    }
  }
  
function localStorageGetItem(key) {
try {
    return localStorage.getItem(key);
} catch (ignorable) {
    return null;
}
}
function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}

const introText ="<h2 style='color: #fff;'>\
Welcome to the Charts Tool!<br>\
<br>\
Here, you can create charts with data from projects you have created.<br>\
<br>\
Get started with creating your first dashboard by pressing \"New Chart\"!\
<h2>"
var config = {
    content: [{
        type: 'row',
        isClosable: false,
        content: [{
            type:"component",
            componentName: 'intro',
            componentState: { text: introText }
        }]
    }]
};



function getSpeedChartData(data){
    var x_labels = [];
    var ret = [];
    const keys = Object.keys(data);
    keys.forEach(function(key){
        x_labels.push(key);
        ret.push({
            x:key,
            y:(data[key].stats.time)
        })
    }
    );
    return {
        data:ret,
        x_labels:x_labels
    }
}

function getAccuracyDiffChartData(data){
    var x_labels = [];
    var ret = [];
    const keys = Object.keys(data);
    keys.forEach(function(key){
        x_labels.push(key);
        y = data[key].stats.accuracy
        y1 = data[key].stats.accuracy_adv
        ret.push({
            x:key,
            y:y-y1
        })
    }
    );
    return {
        data:ret,
        x_labels:x_labels
    }
}

function getSimilarityChartData(data){
    var x_labels = [];
    var ret = [];
    const keys = Object.keys(data);
    keys.forEach(function(key){
        x_labels.push(key);
        ret.push({
            x:key,
            y:data[key].stats.mean_similarity
        })
    }
    );
    return {
        data:ret,
        x_labels:x_labels
    }
}

function getProjects(){
    
    return JSON.parse(localStorageGetItem("projects")) || []
}

function getProjectData(project_name){
    return JSON.parse(localStorageGetItem("project_data?"+project_name)) ||{}
}

const chartDatafunctions={
    0: getSpeedChartData,
    1: getAccuracyDiffChartData,
    2: getSimilarityChartData
}

const chartTemplate={
data: {
    labels: [],
    datasets: []
},
options: {
    scales: {
        y: {
            beginAtZero: true,
            
            ticks: {
                // Include a dollar sign in the ticks
                // callback: function(value, index, values) {
                //     return value + 's';
                // }
            },
            // grid: {
            //     color: 'rgba(255, 255, 255, 0.2)'
            // }
        },
    }

}
}

const chartDatasetTemplates={
    0:{
        type: 'bar',
        label: 'Transfered Drop in Accuracy',
        backgroundColor: randomRGB(0.9),
        borderColor: randomRGB(0.2),
        borderWidth: 0
    },
    1:{
        label: 'Original - Adversarial Accuracy',
        fill: true,
        fillColor: randomRGB(0.9),
        borderColor: randomRGB(0.9),
        tension: 0.5
    },
    2:{
        type: 'bar',
        label: 'Transfered Drop in Accuracy',
        backgroundColor: randomRGB(0.9),
        borderColor: randomRGB(0.2),
        borderWidth: 0
    },

}
function newChart(type, projects){
    const func = chartDatafunctions[type];
    const project_data=[];
    console.log(projects);
    for (let i =0; i < projects.length; i+=1){
        project_data.push(func(getProjectData(projects[i][0])));
    }
    let x_labels=[];
    project_data.forEach(data=>{
        x_labels=x_labels.concat(data.x_labels);
    })
    x_labels=arrayUnique(x_labels);
    
    let d_template = chartDatasetTemplates[type]
    let datasets = [];
    for (let i=0; i < project_data.length; i+=1){
        let dataset = d_template;
        dataset.data=project_data[i].data;
        dataset.label=projects[i];
        datasets.push(dataset);
    }
    
    let c_template=chartTemplate;
    c_template.data.datasets=datasets;
    c_template.label=x_labels;
    return c_template;
}

function drawChart(data){
    const element = document.createElement("canvas");
    const ctx = element.getContext('2d');
    const chart = new Chart(ctx, data);
    return element;
}

function createProjectsTable(data, tableid){
    const container = document.getElementById(tableid);
    let fields = ["Project Name", "Project Type"];
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

        let v1 = document.createElement("td");
        v1.innerText=value[0];

        let v2 = document.createElement("td");
        v2.innerText=value[1];


        let delButton=document.createElement("div");
        delButton.className="ui right floated icon button";
        delButton.onclick=function(){
            tbody.removeChild(row);
        }
        delButton.innerHTML='<i class="x icon"></i>';

        v2.append(delButton)
        row.append(v1, v2);
        tbody.append(row);
    })
    table.append(tbody);
    container.append(table);
}

function updateProjectsTable(data, tableid){
    const container = document.getElementById(tableid);
    table=container.firstElementChild;
    tbody=table.children[1];

    let row = document.createElement("tr")

    let v1 = document.createElement("td");
    v1.innerText=data[0];

    let v2 = document.createElement("td");
    v2.innerText=data[1];

    let delButton=document.createElement("div");
    delButton.className="ui right floated icon button";
    delButton.onclick=function(){
        tbody.removeChild(row);
    }
    delButton.innerHTML='<i class="x icon"></i>';

    v2.append(delButton);
    row.append(v1, v2);
    tbody.append(row);
}

function readProjectsTableData2Array(tableid){
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

function addProjectToTable(){
    const data = document.getElementById('select-projects').value
    updateProjectsTable(data.split(","), 'projects-table')
}

function createNewChart(){
    const type = document.getElementById("select-type").value
    const projects = readProjectsTableData2Array("projects-table")
    let config = {
            title:"chart",
            componentName:"chart",
            type:'component',
            componentState: {
                type: type,
                projects:projects
            }

    }
    chartLayout.root.contentItems[ 0 ].addChild(config);
}

function createSelectProjects(){
    const root = document.getElementById("select-projects")
    const projects = getProjects()
    projects.forEach(p=>{
       let op=document.createElement("option")
       op.innerText=p[0];
       op.value=p
       root.append(op);
    })
}

function saveDashboard(){
    return chartLayout.toConfig()
}
$(document).ready(function () {
    $("select.dropdown").dropdown();
    $(".ui.dropdown").dropdown();
    $(".ui.dropdown.ide-links").dropdown({action: "hide", on: "hover"});
    $(".ui.checkbox").checkbox();
    $(".message .close").on("click", function () {
        $(this).closest(".message").transition("fade");
    });

    $('.tabular.menu .item').tab()

    createSelectProjects();
    createProjectsTable([],"projects-table")

    chartLayout = new window.GoldenLayout( config, $('#charts-container') );
    chartLayout.registerComponent( 'chart', function( container, state ){
        const chart_data = newChart(state.type, state.projects)
        const chart = drawChart(chart_data);
        container.getElement().append(chart)
        container.getElement().css('background-color', '#f5f5f5')
    });
    chartLayout.registerComponent( 'intro', function( container, state ){
        container.getElement().html(state.text)
    });

    chartLayout.init();
})


