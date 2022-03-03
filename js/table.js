function createResultsTable(data) {
  const container = document.getElementById('table-container');
  let fields = [
    'Network Name',
    'Time (sec)',
    'Mean Original Accuracy',
    'Mean Adv. Accuracy',
    'Mean Similarity',
  ];

  while (container.firstChild) container.removeChild(container.firstChild);
  let table = document.createElement('table');
  table.className = 'ui celled sortable table';
  table.id = 'results-table';

  let thead = document.createElement('thead');
  let tr = document.createElement('tr');
  fields.forEach((field) => {
    let th = document.createElement('th');
    th.innerText = field;
    tr.append(th);
  });
  thead.append(tr);
  table.append(thead);
  let tbody = document.createElement('tbody');

  keys = Object.keys(data);
  keys.forEach((key) => {
    let name = document.createElement('td');
    name.innerText = key;

    let time = document.createElement('td');
    time.innerText = data[key].stats.time;

    let accuracy = document.createElement('td');
    accuracy.innerText = data[key].stats.accuracy;

    let accuracy_adv = document.createElement('td');
    accuracy_adv.innerText = data[key].stats.accuracy_adv;

    let similarity = document.createElement('td');
    similarity.innerText = data[key].stats.mean_similarity;

    let row = document.createElement('tr');
    row.append(name, time, accuracy, accuracy_adv, similarity);
    tbody.append(row);
  });
  table.append(tbody);
  container.append(table);
  $('table').tablesort();
}

function createNNConfigsTable(data) {
  const container = document.getElementById('nn-configs-table');
  let fields = ['Network Type', '# of Hidden Layers', '# of nodes per layer'];
  while (container.firstChild) container.removeChild(container.firstChild);
  let table = document.createElement('table');
  table.className = 'ui table';

  let thead = document.createElement('thead');
  let tr = document.createElement('tr');
  fields.forEach((field) => {
    let th = document.createElement('th');
    th.innerText = field;
    tr.append(th);
  });
  thead.append(tr);
  table.append(thead);
  let tbody = document.createElement('tbody');

  data.forEach((value) => {
    let row = document.createElement('tr');

    let type = document.createElement('td');
    type.innerText = value[0];

    let layer = document.createElement('td');
    layer.innerText = value[1];

    let node = document.createElement('td');
    node.innerText = value[2];

    let delButton = document.createElement('div');
    delButton.className = 'ui right floated icon button';
    delButton.onclick = function () {
      tbody.removeChild(row);
    };
    delButton.innerHTML = '<i class="x icon"></i>';

    node.append(delButton);
    row.append(type, layer, node);
    tbody.append(row);
  });
  table.append(tbody);
  container.append(table);
}

function updateNNConfigsTable(data) {
  const container = document.getElementById('nn-configs-table');
  table = container.firstElementChild;
  tbody = table.children[1];

  let row = document.createElement('tr');

  let type = document.createElement('td');
  type.innerText = data[0];

  let layer = document.createElement('td');
  layer.innerText = data[1];

  let node = document.createElement('td');
  node.innerText = data[2];

  let delButton = document.createElement('div');
  delButton.className = 'ui right floated icon button';
  delButton.onclick = function () {
    tbody.removeChild(row);
  };
  delButton.innerHTML = '<i class="x icon"></i>';

  node.append(delButton);
  row.append(type, layer, node);
  tbody.append(row);
}

function readNNConfigsTableData2Array() {
  const container = document.getElementById('nn-configs-table');
  let data = [];
  table = container.firstElementChild;
  body = table.children[1];
  for (let i = 0; i < body.children.length; i++) {
    const row = body.children[i];
    let rdata = [];
    for (let i = 0; i < row.children.length; i++) {
      cell = row.children[i];
      rdata.push(cell.innerText);
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
    var row = [],
      cols = rows[i].querySelectorAll('td, th');
    for (var j = 0; j < cols.length; j++) {
      // Clean innertext to remove multiple spaces and jumpline (break csv)
      var data = cols[j].innerText
        .replace(/(\r\n|\n|\r)/gm, '')
        .replace(/(\s\s)/gm, ' ');
      // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
      data = data.replace(/"/g, '""');
      // Push escaped string
      row.push('"' + data + '"');
    }
    csv.push(row.join(separator));
  }
  var csv_string = csv.join('\n');
  // Download it
  var filename =
    'export_' + table_id + '_' + new Date().toLocaleDateString() + '.csv';
  var link = document.createElement('a');
  link.style.display = 'none';
  link.setAttribute('target', '_blank');
  link.setAttribute(
    'href',
    'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string)
  );
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
