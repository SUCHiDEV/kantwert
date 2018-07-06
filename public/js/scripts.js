var dataObject = {},
    filteredTableData = [],
    currentTableData = [],
    pagination = 1,
    currentView = null,
    prettyPrintBox = window.document.getElementById('prettyPrintBox'),
    contentBox = window.document.getElementById('contentBox');

function showGraph(){
    toggleContent('graph');
}

function showTable(){
    toggleContent('table');
}

function showPretty(){
    toggleContent('pretty');
}

function toggleContent(type){
    if (currentView === type) return;
    currentView = type;
    if (type === 'pretty'){
        hide(contentBox);
        show(prettyPrintBox);
    } else {
        clearPrettyPrint();
        hide(prettyPrintBox);
        show(contentBox);
        (dataObject[type]) ? setContentBox(type) : getData(type);
    }
}

function show(element){
    return (element.className.indexOf('hidden') > -1) ? element.className = element.className.replace('hidden', '') : null;
}

function hide(element){
    return (element.className.indexOf('hidden') > -1) ? null : element.className = element.className + ' hidden';
}

function getData(type){
    var request = new XMLHttpRequest();
    (!type) ? type = 'graph' : null;

    request.onreadystatechange = function() {
        if(request.readyState === 4) {
            if(request.status === 200) {
                contentBox.style.border = '1px solid green';
                updateData(JSON.parse(request.responseText));
                setContentBox(type);
            } else {
                contentBox.style.border = '1px solid red';
                contentBox.innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
            }
        }
    };

    request.open('GET', 'api/data.json');
    request.send();
}


function updateData(data){
   dataObject = data;
   updateCurrentTableData(dataObject['table']);
}

function setContentBox(type){
    switch (type) {
        case 'graph':
            contentBox.innerHTML = getHighlightedText(dataObject[type]);
            break;
        case 'table':
            getTable(filteredTableData);
            break;
        default:
            contentBox.innerHTML = getHighlightedText(dataObject[type]);
    }
}

function getHighlightedText(data){
    return syntaxHighlight(JSON.stringify(data, undefined, 4));
}

function getTable(data){
    currentTableData = JSON.parse(JSON.stringify(paginateData(data)));
    renderTableMenu();
    renderTable(currentTableData);
}

function nextTablePage(){
    var paginationRest = ((filteredTableData.length % 10) > 0) ? 1 : 0,
        maxPages = parseInt(filteredTableData.length / 10) + paginationRest;
    if (pagination < maxPages) {
        pagination++;
        refreshTable();
    }
}

function previousTablePage(){
    if (pagination > 1) {
        pagination--;
        refreshTable();
    }
}

function paginateData(data){
    return JSON.parse(JSON.stringify(data)).splice(10*(pagination-1), 10);
}

function updateCurrentTableData(data){
    var newData = JSON.parse(JSON.stringify(data)),
        searchValue = getTableSearchValue();
    if (searchValue !== ''){
        filteredTableData = newData.filter(function(element){
            var isMatch = false;
            Object.keys(element).forEach(function(key){
                if (element[key].toString().toLowerCase().search(searchValue.toLowerCase()) > -1) isMatch = true;
            });
            return isMatch;
        });
        return;
    }
    filteredTableData = newData;
}

function searchTable(){
    pagination = 1;
    refreshTable();
}

function refreshTable(){
    updateCurrentTableData(dataObject['table']);
    setContentBox('table');
}

function renderTableMenu(){
    if (window.document.getElementById('tableMenu')) return;
    contentBox.innerHTML = (
        '<div id="tableMenu">' +
            '<h1>Table title</h1>' +
            '<input type="text" placeholder="Input global search phrase" name="searchTable" value="" id="tableSearchInput">' +
            '<button onclick="previousTablePage()">Previous Page</button>' +
            '<button onclick="nextTablePage()">Next Page</button>' +
        '</div>' +
        '<table id="tableBody"></table>'
    );
    window.document.getElementById("tableSearchInput").addEventListener('input', searchTable);
}

function renderTable(data){
    var tableHead = '',
        tableRows = '',
        tableElement = window.document.getElementById('tableBody');
    if (!tableElement) return;
    if (data.length) {
        Object.keys(data[0]).forEach(function (key) { tableHead += ('<td>' + key + '</td>'); });
        tableHead += ('<td>Action</td>');
        for (var i = 0; i < data.length; i++) {
            var dataElement = data[i],
                row = '';
            Object.keys(dataElement).forEach(function (key) {
                switch (key){
                    case 'profilePicture':
                        row += ('<td><img src='+ dataElement[key] +'></td>');
                        break;
                    case 'index':
                        row += ('<td>' + parseFloat(dataElement[key]+1) + '</td>');
                        break;
                    default:
                        row += ('<td>' + dataElement[key] + '</td>');
                        break;
                }
            });
            row += (
                '<td>' +
                '<button onclick="actionButton(1)">Action 1</button>' +
                '<button onclick="actionButton(2)">Action 2</button>' +
                '<button onclick="actionButton(3)">Action 3</button>' +
                '</td>'
            );
            tableRows += ('<tr>' + row + '</tr>');
        }
        return tableElement.innerHTML = (
            '<thead>' +
            '<tr>' +
            tableHead +
            '</tr>'+
            '</thead>' +
            '<tbody>' +
            tableRows +
            '</tbody>'
        );
    }
    return tableElement.innerHTML = 'No data';
}

function getTableSearchValue(){
    var element = window.document.getElementById('tableSearchInput');
    return (element) ? element.value : '';
}

function prettyPrint() {
    try {
        var obj = window.document.getElementById('uglyInput').value;
        obj = JSON.parse(obj);
        // obj = {a:1, 'b':'foo', c:[false,'false',null, 'null', {d:{e:1.3e5,f:'1.3e5'}}]};
        window.document.getElementById('prettyResult').innerHTML = syntaxHighlight(JSON.stringify(obj, undefined, 4));
    } catch(err) {
        window.document.getElementById('prettyResult').innerHTML = 'Invaild JSON - keys must be in "" quotes';
    }
}

function clearPrettyPrint(){
    window.document.getElementById('prettyResult').innerHTML = '';
    window.document.getElementById('uglyInput').value = '';
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function actionButton(number){
    console.log('actionButton nr '+ number +' clicked');
}

