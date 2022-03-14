var apiUrl = "http://127.0.0.1:6969";

async function createDashboardsTable(){

    let dashboards = await getDashboards();

    const container = document.getElementById("dashboards-table-container");

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
    
    tr.append(th1);
    tr.append(th2);
    // tr.append(th3);
    tr.append(th4);
    tr.append(th5);
    tr.append(th6);

    th1.innerHTML = "No."
    th2.innerHTML = "Name";
    th3.innerHTML = "Type";
    th4.innerHTML = "Created At";
    th5.innerHTML = "Updated At";
    th6.innerHTML = "";

    thead.append(tr);
    table.append(thead);

    let tbody = document.createElement("tbody");
    tbody.style.overflow="scroll";
    let num = 1;

    dashboards.forEach((dashboard) => {
        let row = document.createElement("tr");

        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        let td3 = document.createElement('td');
        let td4 = document.createElement('td');
        let td5 = document.createElement('td');
        let td6 = document.createElement('td');
    
        let link = document.createElement('a');
        link.innerHTML = dashboard.name;
        link.setAttribute('href', `charts.html?dashboardId=${dashboard._id.$oid}`);

        let delAnchor = document.createElement('a');
        delAnchor.setAttribute('onclick', `deleteDashboard("${dashboard._id.$oid}")`);
        delAnchor.setAttribute('style', 'cursor: pointer;');
        let del = document.createElement('i');
        del.setAttribute('class', `icon trash`);
        delAnchor.appendChild(del);

        td1.innerHTML = num.toString();
        td2.appendChild(link);
        // td3.innerHTML = project.type;
        td4.innerHTML = dashboard.created_at.$date;
        td5.innerHTML = dashboard.updated_at.$date;
        td6.appendChild(delAnchor);

        row.appendChild(td1);
        row.appendChild(td2);
        // row.appendChild(td3);
        row.appendChild(td4);
        row.appendChild(td5);
        row.appendChild(td6);
    
        tbody.append(row);
        num += 1;
    });
    
    table.append(tbody);
    container.append(table);
    $('table').tablesort()
}

async function getDashboards(){
    return $.ajax({
        url:  apiUrl + `/dashboards`,
        type: "GET",
        async: true,
        headers: { 'Authorization': getCookie('token') },
        success: function (data, textStatus, jqXHR) {
            console.log(data);
            return data;
        },
        error: handleRunError
    });
}

async function deleteDashboard(dashboardId){
    if (confirm('Are you sure you want to delete this dashboard?')){
        return $.ajax({
            url:  apiUrl + `/dashboards/` + dashboardId,
            type: "DELETE",
            async: true,
            headers: { 'Authorization': getCookie('token') },
            success: function (data, textStatus, jqXHR) {
                location.reload();
                return data;
            },
        });
    }
}