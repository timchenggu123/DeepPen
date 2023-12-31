var defaultUrl = localStorageGetItem("api-url") || "http://127.0.0.1:2358";
var apiUrl = "http://127.0.0.1:6969";
var wait = localStorageGetItem("wait") || false;
var check_timeout = 300;

var blinkStatusLine = ((localStorageGetItem("blink") || "true") === "true");
var editorMode = localStorageGetItem("editorMode") || "normal";
var redirectStderrToStdout = ((localStorageGetItem("redirectStderrToStdout") || "false") === "true");
var editorModeObject = null;

var fontSize = 14;

var MonacoVim;
var MonacoEmacs;

var layout;

var sourceEditor;
// var stdinEditor;
var stdoutEditor;
var stderrEditor;
// var compileOutputEditor;
var sandboxMessageEditor;

var isEditorDirty = false;
var currentLanguageId;

var $selectLanguage;
var $compilerOptions;
var $commandLineArguments;
var $insertTemplateBtn;
var $runBtn;
var $navigationMessage;
var $updates;
var $statusLine;

var timeStart;
var timeEnd;

var messagesData;

var additional_files;
var submission_results;

var projectID;

var layoutConfig = {
    settings: {
        showPopoutIcon: false,
        reorderEnabled: true
    },
    dimensions: {
        borderWidth: 3,
        headerHeight: 22
    },
    content: [{
        type: "row",
        content: [{
            type: "component",
            componentName: "source",
            title: "SOURCE",
            isClosable: false,
            componentState: {
                readOnly: false
            },
            width: 60
        }, {
            type: "column",
            content: [{
                type: "stack",
                content: [
                    {
                        type: "component",
                        componentName: "stdout",
                        title: "STDOUT",
                        isClosable: false,
                        componentState: {
                            readOnly: true
                        }
                    }
                ]
            }, {
                type: "stack",
                content: [{
                        type: "component",
                        componentName: "stderr",
                        title: "STDERR",
                        isClosable: false,
                        componentState: {
                            readOnly: true
                        }
                    },
                    // {
                    //     type: "component",
                    //     componentName: "compile output",
                    //     title: "COMPILE OUTPUT",
                    //     isClosable: false,
                    //     componentState: {
                    //         readOnly: true
                    //     }
                    // },
                     {
                        type: "component",
                        componentName: "sandbox message",
                        title: "SANDBOX MESSAGE",
                        isClosable: false,
                        componentState: {
                            readOnly: true
                        }
                    }]
            }]
        }]
    }]
};

function encode(str) {
    return btoa(unescape(encodeURIComponent(str || "")));
}

function decode(bytes) {
    var escaped = escape(atob(bytes || ""));
    try {
        return decodeURIComponent(escaped);
    } catch {
        return unescape(escaped);
    }
}


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

function showMessages() {
    var width = $updates.offset().left - parseFloat($updates.css("padding-left")) -
                $navigationMessage.parent().offset().left - parseFloat($navigationMessage.parent().css("padding-left")) - 5;

    if (width < 200 || messagesData === undefined) {
        return;
    }

    var messages = messagesData["messages"];

    $navigationMessage.css("animation-duration", messagesData["duration"]);
    $navigationMessage.parent().width(width - 5);

    var combinedMessage = "";
    for (var i = 0; i < messages.length; ++i) {
        combinedMessage += `${messages[i]}`;
        if (i != messages.length - 1) {
            combinedMessage += "&nbsp".repeat(Math.min(200, messages[i].length));
        }
    }

    $navigationMessage.html(combinedMessage);
}

function showError(title, content) {
    $("#ide-modal #title").html(title);
    $("#ide-modal .content").html(content);
    $("#ide-modal").modal("show");
}

function handleError(jqXHR, textStatus, errorThrown) {
    showError(`${jqXHR.statusText} (${jqXHR.status})`, `<pre>${JSON.stringify(jqXHR, null, 4)}</pre>`);
}

function handleRunError(jqXHR, textStatus, errorThrown) {
    handleError(jqXHR, textStatus, errorThrown);
    $runBtn.removeClass("loading");
}

function handleResult(data) {
    timeEnd = performance.now();
    console.log("It took " + (timeEnd - timeStart) + " ms to get submission result.");

    var status = data.status;
    var stdout = decode(data.stdout);
    var stderr = decode(data.stderr);
    var compile_output = decode(data.compile_output);
    var sandbox_message = decode(data.message);
    var time = (data.time === null ? "-" : data.time + "s");
    var memory = (data.memory === null ? "-" : data.memory + "KB");

    $statusLine.html(`${status.description}, ${time}, ${memory}`);

    if (blinkStatusLine) {
        $statusLine.addClass("blink");
        setTimeout(function() {
            blinkStatusLine = false;
            localStorageSetItem("blink", "false");
            $statusLine.removeClass("blink");
        }, 3000);
    }

    stdoutEditor.setValue(stdout);
    stderrEditor.setValue(stderr);
    // compileOutputEditor.setValue(compile_output);
    sandboxMessageEditor.setValue(sandbox_message);

    if (stdout !== "") {
        var dot = document.getElementById("stdout-dot");
        if (!dot.parentElement.classList.contains("lm_active")) {
            dot.hidden = false;
        }
    }
    if (stderr !== "") {
        var dot = document.getElementById("stderr-dot");
        if (!dot.parentElement.classList.contains("lm_active")) {
            dot.hidden = false;
        }
    }
    // if (compile_output !== "") {
    //     var dot = document.getElementById("compile-output-dot");
    //     if (!dot.parentElement.classList.contains("lm_active")) {
    //         dot.hidden = false;
    //     }
    // }
    if (sandbox_message !== "") {
        var dot = document.getElementById("sandbox-message-dot");
        if (!dot.parentElement.classList.contains("lm_active")) {
            dot.hidden = false;
        }
    }

    $runBtn.removeClass("loading");

    var resultsData = JSON.parse(compile_output);
    console.log(resultsData)
    submission_results = resultsData.results
    drawChart(resultsData.results);
    createResultsTable(resultsData.results);
    createAdvTable(resultsData);
    document.getElementById("results").style.display = "block";
    document.getElementById("results").scrollIntoView(true);
}

function getIdFromURI() {
  var uri = location.search.substr(1).trim();
  return uri.split("&")[0];
}

function downloadSource() {
    var value = parseInt($selectLanguage.val());
    download(sourceEditor.getValue(), fileNames[value], "text/plain");
}

//Test Configuration Presets
const nn_configs_preset = [['MNIST_FFNN', 2, 128],['MNIST_FFNN', 3, 256],['MNIST_FFNN', 4, 512],['MNIST_FFNN', 5, 1024]];
const transfer_nn_configs_preset = [['MNIST_FFNN', 2, 128],['MNIST_FFNN', 3, 256],['MNIST_FFNN', 4, 512],['MNIST_FFNN', 5, 1024]];
const data_configs_preset={
    n_test_data:"100",
    indices: "1,2,3"
};

let nn_configs = JSON.parse(localStorageGetItem('nn_configs'))|| nn_configs_preset
let transfer_nn_configs = JSON.parse(localStorageGetItem('transfer_nn_configs'))|| transfer_nn_configs_preset
let data_configs = JSON.parse(localStorageGetItem('data_configs')) || data_configs_preset


function saveNNConfig(){
    val=JSON.stringify(nn_configs)
    localStorageSetItem('nn_configs', val)
}
function saveTransferNNConfig(){
    val=JSON.stringify(transfer_nn_configs)
    localStorageSetItem('transfer_nn_configs', val)
}
function saveDataConfig(){
    data_configs={
        random: document.getElementById('data-configs-random').checked?1:0,
        n_test_data: document.getElementById('data-configs-ndata').value,
        indices: document.getElementById('data-configs-indices').value
    }
    localStorageSetItem('data_configs', JSON.stringify(data_configs))
}

function loadDataConfigs(configs){
    document.getElementById('data-configs-ndata').value=configs.n_test_data;
    document.getElementById('data-configs-indices').value=configs.indices.replace("[","").replace("]","");
}

function addNNToTable(){
    const type = document.getElementById('select-network').value
    const m = document.getElementById('select-m-layers').value
    const n = document.getElementById('select-n-nodes').value
    const data = [type, m, n]
    updateNNConfigsTable(data, 'nn-configs-table')
    nn_configs=readNNConfigsTableData2Array('nn-configs-table')
}

function addNNToTransferTable(){
    const type = document.getElementById('transfer-select-network').value
    const m = document.getElementById('transfer-select-m-layers').value
    const n = document.getElementById('transfer-select-n-nodes').value
    const data = [type, m, n]
    updateNNConfigsTable(data, 'transfer-nn-configs-table')
    transfer_nn_configs=readNNConfigsTableData2Array('transfer-nn-configs-table')
}

function setProjectName(){
    const project_name = document.getElementById('project-name');
    const curr_name= project_name.innerText;
    const val = prompt("Enter new project name", curr_name);
    project_name.innerText=val?val:curr_name;
}

function saveProject(){
    const project_name = document.getElementById('project-name').innerText;
    const type = document.getElementById("select-language").value
    let projects = JSON.parse(localStorageGetItem("projects")) || []
    projects.push([project_name, type]);
    localStorageSetItem("projects", JSON.stringify(projects))

    let project_data={}
    keys = Object.keys(submission_results)
    keys.forEach(key=>{
        project_data[key] = {}
        project_data[key].stats=submission_results[key].stats
    })

    localStorageSetItem("project_data?"+project_name, JSON.stringify(project_data))
    alert("Saved Project:" + project_name)
}

function loadSavedConfigs(data){
    data=JSON.parse(data)
    console.log(data['nn_configs'])
    createNNConfigsTable(JSON.parse(data['nn_configs']), "nn-configs-table");
    createNNConfigsTable(JSON.parse(data['transfer_nn_configs']), "transfer-nn-configs-table");
    loadDataConfigs(JSON.parse(data["data_configs"]));
}
function loadSavedSource() {
    project_id = ""
    snippet_id = getIdFromURI();

    if (snippet_id.length == 36) {
        $.ajax({
            url: apiUrl + "/projects/" + project_id + "/submissions/" + snippet_id + "?fields=source_code,language_id,stdin,stdout,stderr,compile_output,message,time,memory,status,compiler_options,command_line_arguments&base64_encoded=true",
            type: "GET",
            success: function(data, textStatus, jqXHR) {
                sourceEditor.setValue(decode(data["source_code"]));
                $selectLanguage.dropdown("set selected", data["language_id"]);
                $compilerOptions.val(data["compiler_options"]);
                $commandLineArguments.val(data["command_line_arguments"]);
                // stdinEditor.setValue(decode(data["stdin"]));
                stdoutEditor.setValue(decode(data["stdout"]));
                stderrEditor.setValue(decode(data["stderr"]));
                // compileOutputEditor.setValue(decode(data["compile_output"]));
                sandboxMessageEditor.setValue(decode(data["message"]));
                var time = (data.time === null ? "-" : data.time + "s");
                var memory = (data.memory === null ? "-" : data.memory + "KB");
                $statusLine.html(`${data.status.description}, ${time}, ${memory}`);
                changeEditorLanguage();
            },
            error: handleRunError
        });
    } else {
        loadRandomLanguage();
    }
}

function run() {
    if (sourceEditor.getValue().trim() === "") {
        showError("Error", "Source code can't be empty!");
        return;
    } else {
        $runBtn.addClass("loading");
    }

    document.getElementById("stdout-dot").hidden = true;
    document.getElementById("stderr-dot").hidden = true;
    // document.getElementById("compile-output-dot").hidden = true;
    document.getElementById("sandbox-message-dot").hidden = true;

    stdoutEditor.setValue("");
    stderrEditor.setValue("");
    // compileOutputEditor.setValue("");
    sandboxMessageEditor.setValue("");

    let data_configs_random=document.getElementById('data-configs-random').checked?1:0;
    let data_configs_n_test_data = document.getElementById('data-configs-ndata').value;
    let data_configs_indices = document.getElementById('data-configs-indices').value;

    data_configs_n_test_data = data_configs_n_test_data?data_configs_n_test_data:0;
    data_configs_indices = '['+data_configs_indices+']';
    data_configs={
        random: data_configs_random,
        n_test_data: data_configs_n_test_data,
        indices: data_configs_indices
    }
    nn_configs=readNNConfigsTableData2Array('nn-configs-table')
    transfer_nn_configs=readNNConfigsTableData2Array('transfer-nn-configs-table')
    let experiment_configs = {
        nn_configs:JSON.stringify(nn_configs),
        transfer_nn_configs:JSON.stringify(transfer_nn_configs),
        data_configs:JSON.stringify(data_configs)
    }

    var sourceValue = encode(sourceEditor.getValue());
    // var stdinValue = encode(stdinEditor.getValue());
    var stdinValue=encode(JSON.stringify(experiment_configs));
    var languageId = resolveLanguageId($selectLanguage.val());
    var compilerOptions = $compilerOptions.val();
    var commandLineArguments = $commandLineArguments.val();

    if (parseInt(languageId) === 44) {
        sourceValue = sourceEditor.getValue();
    }

    var data = {
        name : document.getElementById("project-name").innerHTML,
        type : document.getElementById("select-language").value,
        source_code: sourceValue,
        language_id: languageId,
        stdin: stdinValue,
        compiler_options: compilerOptions,
        command_line_arguments: commandLineArguments,
        redirect_stderr_to_stdout: redirectStderrToStdout
    };

    var sendRequest = function(data) {

        timeStart = performance.now();

        let url = apiUrl + `/projects/submissions`;

        if (projectID != undefined){
            url = apiUrl + `/projects/${projectID}/submissions?base64_encoded=true&wait=${wait}`;
        }

        $.ajax({
            url: url,
            type: "POST",
            async: true,
            contentType: "application/json",
            data: JSON.stringify(data),
            headers: { 'Authorization': getCookie('token') },
            xhrFields: {
                withCredentials: apiUrl.indexOf("/secure") != -1 ? true : false
            },
            success: function (data, textStatus, jqXHR) {
                console.log(`Your submission token is: ${data.token}`);
                if (wait == true) {
                    handleResult(data);
                } else {
                    setTimeout(fetchSubmission.bind(null, data.token), check_timeout);
                }
            },
            error: handleRunError
        });
    }

    if (additional_files){
        if (typeof additional_files === "string") {
            sendRequest(data);
        } else {
            var reader = new FileReader();
            reader.readAsDataURL(additional_files);
            reader.onload = function () {
            let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
            if ((encoded.length % 4) > 0) {
                encoded += '='.repeat(4 - (encoded.length % 4));
            }
            console.log(encoded);
            data["additional_files"] = encoded
            sendRequest(data);
            };
            reader.onerror = function (error) {
            console.log('Error: ', error);
            };
        }
    }else{
        sendRequest(data);
    }
}

function fetchSubmission(submission_token) {
    $.ajax({
        url: apiUrl + "/submissions/" + submission_token + "?base64_encoded=true",
        type: "GET",
        async: true,
        headers: { 'Authorization': getCookie('token') },
        success: function (data, textStatus, jqXHR) {
            console.log(data)
            if (data.status.id <= 2) { // In Queue or Processing
                setTimeout(fetchSubmission.bind(null, submission_token), check_timeout);
                return;
            }
            handleResult(data);
        },
        error: handleRunError
    });
}

function changeEditorLanguage() {
    monaco.editor.setModelLanguage(sourceEditor.getModel(), $selectLanguage.find(":selected").attr("mode"));
    currentLanguageId = parseInt($selectLanguage.val());
    $(".lm_title")[0].innerText = fileNames[currentLanguageId];
    apiUrl = resolveApiUrl($selectLanguage.val());
}

function insertTemplate() {
    currentLanguageId = parseInt($selectLanguage.val());
    sourceEditor.setValue(sources[currentLanguageId]);
    changeEditorLanguage();
}

function loadRandomLanguage() {
    var values = [];
    for (var i = 0; i < $selectLanguage[0].options.length; ++i) {
        values.push($selectLanguage[0].options[i].value);
    }
    // $selectLanguage.dropdown("set selected", values[Math.floor(Math.random() * $selectLanguage[0].length)]);
    $selectLanguage.dropdown("set selected", values[9]);
    apiUrl = resolveApiUrl($selectLanguage.val());
    insertTemplate();
}

function resizeEditor(layoutInfo) {
    if (editorMode != "normal") {
        var statusLineHeight = $("#editor-status-line").height();
        layoutInfo.height -= statusLineHeight;
        layoutInfo.contentHeight -= statusLineHeight;
    }
}

function disposeEditorModeObject() {
    try {
        editorModeObject.dispose();
        editorModeObject = null;
    } catch(ignorable) {
    }
}

function changeEditorMode() {
    disposeEditorModeObject();

    if (editorMode == "vim") {
        editorModeObject = MonacoVim.initVimMode(sourceEditor, $("#editor-status-line")[0]);
    } else if (editorMode == "emacs") {
        var statusNode = $("#editor-status-line")[0];
        editorModeObject = new MonacoEmacs.EmacsExtension(sourceEditor);
        editorModeObject.onDidMarkChange(function(e) {
          statusNode.textContent = e ? "Mark Set!" : "Mark Unset";
        });
        editorModeObject.onDidChangeKey(function(str) {
          statusNode.textContent = str;
        });
        editorModeObject.start();
    }
}

function resolveLanguageId(id) {
    id = parseInt(id);
    return languageIdTable[id] || id;
}

function resolveApiUrl(id) {
    id = parseInt(id);
    return languageApiUrlTable[id] || defaultUrl;
}

function editorsUpdateFontSize(fontSize) {
    sourceEditor.updateOptions({fontSize: fontSize});
    // stdinEditor.updateOptions({fontSize: fontSize});
    stdoutEditor.updateOptions({fontSize: fontSize});
    stderrEditor.updateOptions({fontSize: fontSize});
    // compileOutputEditor.updateOptions({fontSize: fontSize});
    sandboxMessageEditor.updateOptions({fontSize: fontSize});
}

function updateScreenElements() {
    var display = window.innerWidth <= 1200 ? "none" : "";
    $(".wide.screen.only").each(function(index) {
        $(this).css("display", display);
    });
}

function fileUploadHandler(fileInput){
    const files = fileInput.files;
    let message = "Succssfully added following files: "
    for (let i = 0; i < files.length; i++) {
        const name = files[i].name;
        const type = files[i].type;
        additional_files=files[i]
        message += name+type
      }
      alert(message);
}

async function getProjects(){
    return $.ajax({
        url:  apiUrl + `/projects`,
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

function saveOrAddProject(){

    let data = getProjectFields();

    $.ajax({
        url: apiUrl + `/projects`,
        type: "POST",
        async: true,
        contentType: "application/json",
        data: JSON.stringify(data),
        headers: { 'Authorization': getCookie('token') },
        xhrFields: {
            withCredentials: apiUrl.indexOf("/secure") != -1 ? true : false
        },
        success: function (data, textStatus, jqXHR) {
            projectID = data.project_id;
            console.log(`Your Project Id: ${data.project_id}`);
        },
        error: handleRunError
    });
}

function getProjectFields(){
    let name = document.getElementById("project-name").innerHTML;
    let type = document.getElementById("select-language").value;

    // if (sourceEditor.getValue().trim() === "") {
    //     showError("Error", "Source code can't be empty!");
    //     return;
    // } else {
    //     $runBtn.addClass("loading");
    // }

    document.getElementById("stdout-dot").hidden = true;
    document.getElementById("stderr-dot").hidden = true;
    // document.getElementById("compile-output-dot").hidden = true;
    document.getElementById("sandbox-message-dot").hidden = true;

    stdoutEditor.setValue("");
    stderrEditor.setValue("");
    // compileOutputEditor.setValue("");
    sandboxMessageEditor.setValue("");

    let data_configs_random=document.getElementById('data-configs-random').checked?1:0;
    let data_configs_n_test_data = document.getElementById('data-configs-ndata').value;
    let data_configs_indices = document.getElementById('data-configs-indices').value;

    data_configs_n_test_data = data_configs_n_test_data?data_configs_n_test_data:0;
    data_configs_indices = '['+data_configs_indices+']';
    data_configs={
        random: data_configs_random,
        n_test_data: data_configs_n_test_data,
        indices: data_configs_indices
    }
    nn_configs=readNNConfigsTableData2Array('nn-configs-table')
    transfer_nn_configs=readNNConfigsTableData2Array('transfer-nn-configs-table')
    let experiment_configs = {
        nn_configs:JSON.stringify(nn_configs),
        transfer_nn_configs:JSON.stringify(transfer_nn_configs),
        data_configs:JSON.stringify(data_configs)
    }

    var sourceValue = encode(sourceEditor.getValue());
    // var stdinValue = encode(stdinEditor.getValue());
    var stdinValue=encode(JSON.stringify(experiment_configs));
    var languageId = resolveLanguageId($selectLanguage.val());
    var compilerOptions = $compilerOptions.val();
    var commandLineArguments = $commandLineArguments.val();

    if (parseInt(languageId) === 44) {
        sourceValue = sourceEditor.getValue();
    }

    var data = {
        name: name,
        type: type,
        source_code: sourceValue,
        language_id: languageId,
        stdin: stdinValue,
        compiler_options: compilerOptions,
        command_line_arguments: commandLineArguments,
        redirect_stderr_to_stdout: redirectStderrToStdout
    };
    return data;
}

async function getProject(projectId){
    return $.ajax({
        url:  apiUrl + `/projects/` + projectId,
        type: "GET",
        async: true,
        headers: { 'Authorization': getCookie('token') },
        success: function (data, textStatus, jqXHR) {
            console.log("data:", data);
            handleResult(data.submission);
            sourceEditor.setValue(decode(data['project'][0]["source_code"]));
            $selectLanguage.dropdown("set selected", data['project'][0]["language_id"]);
            $compilerOptions.val(data['project'][0]["compiler_options"]);
            $commandLineArguments.val(data['project'][0]["command_line_arguments"]);
            loadSavedConfigs(decode(data['project'][0]["stdin"]))
            stdoutEditor.setValue(decode(data['project'][0]["stdout"]));
            stderrEditor.setValue(decode(data['project'][0]["stderr"]));
            //compileOutputEditor.setValue(decode(data['project'][0]["compile_output"]));
            sandboxMessageEditor.setValue(decode(data['project'][0]["message"]));
            document.getElementById('project-name').innerText=data['project'][0]['name'];
            additional_files = data["project"][0]["additional_files"];
            console.log(additional_files);
            console.log(data['project'][0]['name']);
            return data;
        },
    });
}
async function getProjectStats(projectId){
    return $.ajax({
        url:  apiUrl + `/projects_stats/` + projectId,
        type: "GET",
        async: true,
        headers: { 'Authorization': getCookie('token') },
        success: function (data, textStatus, jqXHR) {
            console.log("data:", data);
        },
    });
}

async function deleteProject(projectId){
    if (confirm('Are you sure you want to delete this project?')){
        return $.ajax({
            url: apiUrl + `/projects/` + projectId,
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

function GetURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}


$(window).resize(function() {
    if (layout != undefined){
        layout.updateSize();
        updateScreenElements();
    }
    // showMessages();
});


$(document).ready(async function () {

    updateScreenElements(projectID);

    projectID = GetURLParameter('projectId');

    $selectLanguage = $("#select-language");
    $selectLanguage.change(function (e) {
        if (!isEditorDirty) {
            insertTemplate();
        } else {
            changeEditorLanguage();
        }
    });

    $compilerOptions = $("#compiler-options");
    $commandLineArguments = $("#command-line-arguments");

    $insertTemplateBtn = $("#insert-template-btn");
    $insertTemplateBtn.click(function (e) {
        if (isEditorDirty && confirm("Are you sure? Your current changes will be lost.")) {
            insertTemplate();
        }
    });

    $runBtn = $("#run-btn");
    $runBtn.click(function (e) {
        run();
    });

    $navigationMessage = $("#navigation-message span");
    $updates = $("#judge0-more");

    $(`input[name="editor-mode"][value="${editorMode}"]`).prop("checked", true);
    $("input[name=\"editor-mode\"]").on("change", function(e) {
        editorMode = e.target.value;
        localStorageSetItem("editorMode", editorMode);

        resizeEditor(sourceEditor.getLayoutInfo());
        changeEditorMode();

        sourceEditor.focus();
    });

    $("input[name=\"redirect-output\"]").prop("checked", redirectStderrToStdout)
    $("input[name=\"redirect-output\"]").on("change", function(e) {
        redirectStderrToStdout = e.target.checked;
        localStorageSetItem("redirectStderrToStdout", redirectStderrToStdout);
    });

    $statusLine = $("#status-line");

    $("body").keydown(function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode == 120) { // F9
            e.preventDefault();
            run();
        } else if (keyCode == 121) { // F10
            console.log("Attempt to set apiURL")
            e.preventDefault();
            var url = prompt("Enter URL of Judge0 API:", apiUrl);
            if (url != null) {
                url = url.trim();
            }
            if (url != null && url != "") {
                apiUrl = url;
                localStorageSetItem("api-url", apiUrl);
            }
        } else if (keyCode == 118) { // F7
            e.preventDefault();
            wait = !wait;
            localStorageSetItem("wait", wait);
            alert(`Submission wait is ${wait ? "ON. Enjoy" : "OFF"}.`);
        } else if (event.ctrlKey && keyCode == 107) { // Ctrl++
            e.preventDefault();
            fontSize += 1;
            editorsUpdateFontSize(fontSize);
        } else if (event.ctrlKey && keyCode == 109) { // Ctrl+-
            e.preventDefault();
            fontSize -= 1;
            editorsUpdateFontSize(fontSize);
        }
    });

    $("select.dropdown").dropdown();
    $(".ui.dropdown").dropdown();
    $(".ui.dropdown.ide-links").dropdown({action: "hide", on: "hover"});
    $(".ui.checkbox").checkbox();
    $(".message .close").on("click", function () {
        $(this).closest(".message").transition("fade");
    });

    $('.tabular.menu .item').tab()

    require(["vs/editor/editor.main", "monaco-vim", "monaco-emacs"], function (ignorable, MVim, MEmacs) {
        layout = new GoldenLayout(layoutConfig, $("#ide-content"));

        MonacoVim = MVim;
        MonacoEmacs = MEmacs;

        layout.registerComponent("source", function (container, state) {
            sourceEditor = monaco.editor.create(container.getElement()[0], {
                automaticLayout: true,
                theme: "vs-dark",
                scrollBeyondLastLine: true,
                readOnly: state.readOnly,
                language: "python",
                minimap: {
                    enabled: false
                }
            });

            changeEditorMode();

            sourceEditor.getModel().onDidChangeContent(function (e) {
                currentLanguageId = parseInt($selectLanguage.val());
                isEditorDirty = sourceEditor.getValue() != sources[currentLanguageId];
            });

            sourceEditor.onDidLayoutChange(resizeEditor);
        });

        // layout.registerComponent("stdin", function (container, state) {
        //     stdinEditor = monaco.editor.create(container.getElement()[0], {
        //         automaticLayout: true,
        //         theme: "vs-dark",
        //         scrollBeyondLastLine: false,
        //         readOnly: state.readOnly,
        //         language: "plaintext",
        //         minimap: {
        //             enabled: false
        //         }
        //     });
        // });

        layout.registerComponent("stdout", function (container, state) {
            stdoutEditor = monaco.editor.create(container.getElement()[0], {
                automaticLayout: true,
                theme: "vs-dark",
                scrollBeyondLastLine: false,
                readOnly: state.readOnly,
                language: "plaintext",
                minimap: {
                    enabled: false
                }
            });

            container.on("tab", function(tab) {
                tab.element.append("<span id=\"stdout-dot\" class=\"dot\" hidden></span>");
                tab.element.on("mousedown", function(e) {
                    e.target.closest(".lm_tab").children[3].hidden = true;
                });
            });
        });

        layout.registerComponent("stderr", function (container, state) {
            stderrEditor = monaco.editor.create(container.getElement()[0], {
                automaticLayout: true,
                theme: "vs-dark",
                scrollBeyondLastLine: false,
                readOnly: state.readOnly,
                language: "plaintext",
                minimap: {
                    enabled: false
                }
            });

            container.on("tab", function(tab) {
                tab.element.append("<span id=\"stderr-dot\" class=\"dot\" hidden></span>");
                tab.element.on("mousedown", function(e) {
                    e.target.closest(".lm_tab").children[3].hidden = true;
                });
            });
        });

        layout.registerComponent("sandbox message", function (container, state) {
            sandboxMessageEditor = monaco.editor.create(container.getElement()[0], {
                automaticLayout: true,
                theme: "vs-dark",
                scrollBeyondLastLine: false,
                readOnly: state.readOnly,
                language: "plaintext",
                minimap: {
                    enabled: false
                }
            });

            container.on("tab", function(tab) {
                tab.element.append("<span id=\"sandbox-message-dot\" class=\"dot\" hidden></span>");
                tab.element.on("mousedown", function(e) {
                    e.target.closest(".lm_tab").children[3].hidden = true;
                });
            });
        });

        layout.on("initialised", function () {
            $(".monaco-editor")[0].appendChild($("#editor-status-line")[0]);
            if (getIdFromURI()) {
                loadSavedSource();
            } else {
                loadRandomLanguage();
            }
            $("#ide-navigation").css("border-bottom", "1px solid black");
            sourceEditor.focus();
            editorsUpdateFontSize(fontSize);
        });

        layout.init();

        if (projectID != undefined){
            getProject(projectID);
        }else{
            //setProjectName();
            createNNConfigsTable(nn_configs, "nn-configs-table");
            createNNConfigsTable(transfer_nn_configs, "transfer-nn-configs-table");
            loadDataConfigs(data_configs);
        }
    });
});

// Template Sources

var TorchSource = "\
from DeepPenAlgorithm import DeepPenAlgorithm\n\
from cleverhans.torch.attacks.fast_gradient_method import fast_gradient_method\n\
import numpy as np\n\
from torch import Tensor\n\
#import MyModules\n\
\n\
class Solution(DeepPenAlgorithm):\n\
    def run_algorithm(self, net, x, y) -> Tensor:\n\
        eps = 0.05\n\
        x_fgm = fast_gradient_method(net, x, eps, np.inf)\n\
        return x_fgm\n\
";

var TFSource = "\
from DeepPenAlgorithm import DeepPenAlgorithm\n\
from cleverhans.tf2.attacks.fast_gradient_method import fast_gradient_method\n\
import numpy as np\n\
from tensorflow import Tensor\n\
#import MyModules\n\
\n\
class Solution(DeepPenAlgorithm):\n\
    def run_algorithm(self, net, x, y) -> Tensor:\n\
        eps = 0.05\n\
        x_fgm = fast_gradient_method(net, x, eps, np.inf)\n\
        return x_fgm\n\
"
var sources = {
    420: TorchSource,
    421: TFSource
};

var fileNames = {
    45: "main.asm",
    46: "script.sh",
    47: "main.bas",
    48: "main.c",
    49: "main.c",
    50: "main.c",
    51: "Main.cs",
    52: "main.cpp",
    53: "main.cpp",
    54: "main.cpp",
    55: "script.lisp",
    56: "main.d",
    57: "script.exs",
    58: "main.erl",
    44: "a.out",
    59: "main.f90",
    60: "main.go",
    61: "main.hs",
    62: "Main.java",
    63: "script.js",
    64: "script.lua",
    65: "main.ml",
    66: "script.m",
    67: "main.pas",
    68: "script.php",
    43: "text.txt",
    69: "main.pro",
    70: "script.py",
    71: "script.py",
    72: "script.rb",
    73: "main.rs",
    74: "script.ts",
    75: "main.c",
    76: "main.cpp",
    77: "main.cob",
    78: "Main.kt",
    79: "main.m",
    80: "script.r",
    81: "Main.scala",
    82: "script.sql",
    83: "Main.swift",
    84: "Main.vb",
    85: "script.pl",
    86: "main.clj",
    87: "script.fsx",
    88: "script.groovy",
    420:"algorithm.py",
    421:"algorithm.py",
    1001: "main.c",
    1002: "main.cpp",
    1003: "main.c3",
    1004: "Main.java",
    1005: "MainTest.java",
    1006: "main.c",
    1007: "main.cpp",
    1008: "script.py",
    1009: "main.nim",
    1010: "script.py",
    1011: "main.bsq",
    1012: "main.cpp",
    1013: "main.c",
    1014: "main.cpp",
    1015: "main.cpp",
    1021: "Main.cs",
    1022: "Main.cs",
    1023: "Test.cs",
    1024: "script.fsx"
};

var languageIdTable = {
    1001: 1,
    1002: 2,
    1003: 3,
    1004: 4,
    1005: 5,
    1006: 6,
    1007: 7,
    1008: 8,
    1009: 9,
    1010: 10,
    1011: 11,
    1012: 12,
    1013: 13,
    1014: 14,
    1015: 15,
    1021: 21,
    1022: 22,
    1023: 23,
    1024: 24
}

var extraApiUrl = "https://extra-ce.judge0.com";
var languageApiUrlTable = {
    1001: extraApiUrl,
    1002: extraApiUrl,
    1003: extraApiUrl,
    1004: extraApiUrl,
    1005: extraApiUrl,
    1006: extraApiUrl,
    1007: extraApiUrl,
    1008: extraApiUrl,
    1009: extraApiUrl,
    1010: extraApiUrl,
    1011: extraApiUrl,
    1012: extraApiUrl,
    1013: extraApiUrl,
    1014: extraApiUrl,
    1015: extraApiUrl,
    1021: extraApiUrl,
    1022: extraApiUrl,
    1023: extraApiUrl,
    1024: extraApiUrl
}
