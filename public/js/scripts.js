var dataObject = {},
    graphButton = window.document.getElementById('graphButton'),
    tableButton = window.document.getElementById('tableButton'),
    prettyButton = window.document.getElementById('prettyButton'),
    prettyPrintBox = window.document.getElementById('prettyPrintBox'),
    prettyResult = window.document.getElementById('prettyResult'),
    contentBox = window.document.getElementById('contentBox');

function showGraph(){
    toggleContent('graph');
    clearPrettyPrint();
}

function showTable(){
    toggleContent('table');
    clearPrettyPrint();
}

function showPretty(){
    toggleContent('pretty');
}

function toggleContent(type){
    if (type === 'pretty'){
        hide(contentBox);
        show(prettyPrintBox);
    } else {
        hide(prettyPrintBox);
        show(contentBox);
        (dataObject[type]) ? setContentBoxText(dataObject[type]) : getData(type);
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

    request.onreadystatechange = function() {
        if(request.readyState === 4) {
            if(request.status === 200) {
                contentBox.style.border = '1px solid green';
                dataObject[type] = request.responseText;
                setContentBoxText(request.responseText);
            } else {
                contentBox.style.border = '1px solid red';
                setContentBoxText('An error occurred during your request: ' +  request.status + ' ' + request.statusText);
            }
        }
    };

    request.open('GET', 'api/'+type+'.json');
    request.send();
}

function setContentBoxText(text){
    contentBox.innerHTML = text;
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

