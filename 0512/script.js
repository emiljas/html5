var canvas, context;
var canvasWidth, canvasHeight;
var logsTable;
var State = (function () {
    function State() {
        this.IsFilter1Enabled = false;
        this.IsFilter2Enabled = false;
    }
    return State;
})();
var LogType;
(function (LogType) {
    LogType[LogType["PICTURE_CHANGE"] = 0] = "PICTURE_CHANGE";
    LogType[LogType["TEXT_CACHE"] = 1] = "TEXT_CACHE";
})(LogType || (LogType = {}));
var Log = (function () {
    function Log(Type, CreateDate, Content) {
        this.Type = Type;
        this.CreateDate = CreateDate;
        this.Content = Content;
    }
    return Log;
})();
var state = new State();
var db;
var request = window.indexedDB.open("db", 1);
request.onupgradeneeded = function (event) {
    var db = request.result;
    db.createObjectStore("logs", {
        autoIncrement: true
    });
};
request.onerror = function (event) {
    console.log("create indexeddb permission denied");
};
request.onsuccess = function (event) {
    console.log("success");
    db = request.result;
    loadLogs();
};
function loadLogs() {
    var transaction = db.transaction("logs", "readonly");
    var request = transaction.objectStore("logs").openCursor();
    request.onsuccess = function (event) {
        var cursor = event.target["result"];
        if (cursor) {
            var type = cursor.value.Type;
            var cssClass = type === 0 /* PICTURE_CHANGE */ ? "pictureRow" : "textRow";
            var row = logsTable.insertRow();
            row.classList.add(cssClass);
            var idCell = row.insertCell();
            idCell.innerText = cursor.key;
            var createDateCell = row.insertCell();
            createDateCell.innerText = cursor.value.CreateDate;
            var contentCell = row.insertCell();
            contentCell.innerText = cursor.value.Content;
            console.log(cursor.key, cursor.value);
            cursor.continue();
        }
    };
}
function log(log) {
    var transaction = db.transaction("logs", "readwrite");
    var request = transaction.objectStore("logs").add(log);
    request.onsuccess = function (event) {
        console.log("success log");
    };
    request.onerror = function (event) {
        console.log(event.error);
    };
}
window.addEventListener("load", function (e) {
    logsTable = document.getElementById("logsTable");
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
var solarizeLevel = 100;
function draw() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    if (state.Image) {
        context.drawImage(state.Image, state.ImageX, state.ImageY, state.ImageWidth, state.ImageHeight);
        if (state.IsFilter1Enabled) {
            var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
            var data = imageData.data;
            for (var i = 0; i <= data.length - 4; i += 4) {
                data[i] = solarizeColor(data[i], solarizeLevel);
                data[i + 1] = solarizeColor(data[i + 1], solarizeLevel);
                data[i + 2] = solarizeColor(data[i + 2], solarizeLevel);
            }
            context.putImageData(imageData, 0, 0);
        }
        if (state.IsFilter2Enabled) {
            var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
            var data = imageData.data;
            for (var i = 0; i <= data.length - 4; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            context.putImageData(imageData, 0, 0);
        }
    }
    if (state.Text) {
        context.fillStyle = "red";
        context.font = "13px Sans-Serif";
        wrapText(context, state.Text, 0, canvasHeight / 2, canvasWidth, 20);
    }
}
function solarizeColor(color, level) {
    return Math.min(color + level, 255);
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
