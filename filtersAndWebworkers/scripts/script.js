function forEachNode(selector, callback) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
        callback(nodes[i]);
    }
}
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}
var State = (function () {
    function State() {
        this.IsFilter1Enabled = false;
        this.IsFilter2Enabled = false;
    }
    return State;
})();
var LogType;
(function (LogType) {
    LogType[LogType["ALL"] = -1] = "ALL";
    LogType[LogType["PICTURE_CHANGE"] = 0] = "PICTURE_CHANGE";
    LogType[LogType["TEXT_CHANGE"] = 1] = "TEXT_CHANGE";
})(LogType || (LogType = {}));
var Log = (function () {
    function Log(Type, CreateDate, Content) {
        this.Type = Type;
        this.CreateDate = CreateDate;
        this.Content = Content;
    }
    return Log;
})();
var FilterWorkerMessage = (function () {
    function FilterWorkerMessage(ImageData, IsFilter1Enabled, IsFilter2Enabled) {
        this.ImageData = ImageData;
        this.IsFilter1Enabled = IsFilter1Enabled;
        this.IsFilter2Enabled = IsFilter2Enabled;
    }
    return FilterWorkerMessage;
})();
var filterWorker = new Worker("/scripts/filterWorker.js");
filterWorker.onmessage = function (event) {
    var message = event.data;
    context.putImageData(message.ImageData, 0, 0);
    drawText();
};
var canvas, context;
var canvasWidth, canvasHeight;
var logsTable;
var logsTableBody;
var state = new State();
var db;
var request = window.indexedDB.open("db", 2);
request.onupgradeneeded = function (event) {
    var db = request.result;
    var transaction = event.currentTarget["transaction"];
    transaction.objectStore("logs").createIndex("TypeIndex", "Type");
};
request.onerror = function (event) {
    console.log("indexeddb");
};
request.onsuccess = function (event) {
    db = request.result;
    loadLogs();
};
var selectedLogType = -1 /* ALL */;
function loadLogs() {
    var transaction = db.transaction("logs", "readonly");
    var request = transaction.objectStore("logs").openCursor();
    request.onsuccess = function (event) {
        var cursor = event.target["result"];
        if (cursor) {
            var log = cursor.value;
            log.ID = cursor.key;
            appendLogToTable(log);
            cursor.continue();
        }
    };
}
function filterLogs(type) {
    var transaction = db.transaction("logs", "readonly");
    var request = transaction.objectStore("logs").index("TypeIndex").openCursor(IDBKeyRange.only(type));
    request.onsuccess = function (event) {
        var cursor = event.target["result"];
        if (cursor) {
            var log = cursor.value;
            log.ID = cursor.primaryKey;
            appendLogToTable(log);
            cursor.continue();
        }
    };
}
function log(log) {
    var transaction = db.transaction("logs", "readwrite");
    var request = transaction.objectStore("logs").add(log);
    request.onsuccess = function (event) {
        log.ID = event.target["result"];
        appendLogToTable(log);
    };
}
function emptyLogsTable() {
    forEachNode("tbody tr", function (row) {
        row.parentNode.removeChild(row);
    });
}
function appendLogToTable(log) {
    if (selectedLogType === -1 /* ALL */ || log.Type === selectedLogType) {
        var type = log.Type;
        var cssClass = type === 0 /* PICTURE_CHANGE */ ? "pictureRow" : "textRow";
        var row = logsTableBody.insertRow();
        row.classList.add(cssClass);
        var idCell = row.insertCell();
        idCell.innerText = log.ID.toString();
        var createDateCell = row.insertCell();
        createDateCell.innerText = new Date(log.CreateDate).toLocaleString();
        var contentCell = row.insertCell();
        contentCell.innerText = log.Content;
    }
}
window.addEventListener("load", function (e) {
    logsTable = document.getElementById("logsTable");
    logsTableBody = logsTable.querySelector("tbody");
    var filter1CB = document.getElementById("filter1CB");
    var filter2CB = document.getElementById("filter2CB");
    filter1CB.addEventListener("change", function (e) {
        enableOrDisableFilter(e, 1);
    }, false);
    filter2CB.addEventListener("change", function (e) {
        enableOrDisableFilter(e, 2);
    }, false);
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    canvas.addEventListener("dragenter", function (e) {
        e.stopPropagation();
        e.preventDefault();
    }, false);
    canvas.addEventListener("dragover", function (e) {
        e.stopPropagation();
        e.preventDefault();
    }, false);
    canvas.addEventListener("drop", function (e) {
        e.stopPropagation();
        e.preventDefault();
        var dt = e.dataTransfer;
        var file = dt.files[0];
        var isImage = file.name.match(/\.(jpg|jpeg|png|gif)$/);
        if (isImage) {
            var img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = function () {
                state.Image = img;
                var widthRatio = state.Image.width / canvasWidth;
                var heightRatio = state.Image.height / canvasHeight;
                if (widthRatio > heightRatio) {
                    state.ImageWidth = state.Image.width / widthRatio;
                    state.ImageHeight = state.Image.height / widthRatio;
                }
                else {
                    state.ImageWidth = state.Image.width / heightRatio;
                    state.ImageHeight = state.Image.height / heightRatio;
                }
                state.ImageX = (canvasWidth - state.ImageWidth) / 2;
                state.ImageY = (canvasHeight - state.ImageHeight) / 2;
                draw();
                log(new Log(0 /* PICTURE_CHANGE */, Date.now(), "picture changed: " + file.name));
            };
        }
        else {
            var reader = new FileReader();
            reader.onload = function (e) {
                var text = reader.result;
                state.Text = text;
                draw();
                log(new Log(1 /* TEXT_CHANGE */, Date.now(), "text changed: " + file.name));
            };
            reader.readAsText(file);
        }
    }, false);
}, false);
function enableOrDisableFilter(e, which) {
    var cb = e.target;
    if (which == 1)
        state.IsFilter1Enabled = cb.checked;
    if (which == 2)
        state.IsFilter2Enabled = cb.checked;
    draw();
}
function draw() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    if (state.Image) {
        context.drawImage(state.Image, state.ImageX, state.ImageY, state.ImageWidth, state.ImageHeight);
        var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
        filterWorker.postMessage(new FilterWorkerMessage(imageData, state.IsFilter1Enabled, state.IsFilter2Enabled));
    }
    else
        drawText();
}
forEachNode("input[name='logType']", function (node) {
    node.addEventListener("click", function (event) {
        var radio = node;
        var logType = parseInt(radio.value);
        selectedLogType = logType;
        emptyLogsTable();
        if (logType == -1 /* ALL */)
            loadLogs();
        else
            filterLogs(logType);
    }, false);
});
function drawText() {
    if (state.Text) {
        context.fillStyle = "red";
        context.font = "13px Sans-Serif";
        wrapText(context, state.Text, 0, canvasHeight / 2, canvasWidth, 20);
    }
}
