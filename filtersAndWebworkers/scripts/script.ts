/// <reference path="Utils.ts" />
/// <reference path="State.ts" />
/// <reference path="LogType.ts" />
/// <reference path="Log.ts" />
/// <reference path="FilterWorkerMessage.ts" />

var filterWorker = new Worker("/scripts/filterWorker.js");
filterWorker.onmessage = (event) => {
  var message = <FilterWorkerMessage>event.data;
  context.putImageData(message.ImageData, 0, 0);

  drawText();
};

var canvas: HTMLCanvasElement, context: CanvasRenderingContext2D;
var canvasWidth: number, canvasHeight: number;

var logsTable: HTMLTableElement;
var logsTableBody: HTMLTableSectionElement;

var state = new State();

var db: IDBDatabase;

var request = window.indexedDB.open("db", 4);

request.onupgradeneeded = (event) => {
  var db = <IDBDatabase>request.result;
  // db.createObjectStore("logs", {
  //   autoIncrement: true
  // });
  var transaction = <IDBTransaction>event.currentTarget["transaction"];
  transaction.objectStore("logs").createIndex("TypeIndex", "Type");
};

request.onerror = (event) => {
  console.log("indexeddb");
};

request.onsuccess = (event) => {
  db = request.result;
  loadLogs();
};

var selectedLogType = LogType.ALL;

function loadLogs() {
  var transaction = db.transaction("logs", "readonly");
  var request = transaction.objectStore("logs").openCursor();
  request.onsuccess = (event) => {
    var cursor = <IDBCursorWithValue>event.target["result"];
    if(cursor) {
      var log = <Log>cursor.value;
      log.ID = cursor.key;
      appendLogToTable(log);
      cursor.continue();
    }
  };
}

function filterLogs(type: LogType) {
  var transaction = db.transaction("logs", "readonly");
  var request = transaction.objectStore("logs").index("TypeIndex").openCursor(IDBKeyRange.only(type));
  request.onsuccess = (event) => {
    var cursor = <IDBCursorWithValue>event.target["result"];
    if(cursor) {
      var log = <Log>cursor.value;
      log.ID = cursor.primaryKey;
      appendLogToTable(log);
      cursor.continue();
    }
  };
}

function log(log: Log) {
  var transaction = db.transaction("logs", "readwrite");
  var request = transaction.objectStore("logs").add(log);
  request.onsuccess = (event) => {
    log.ID = event.target["result"];
    appendLogToTable(log);
  };
}

function emptyLogsTable() {
  forEachNode("tbody tr", (row) => {
    row.parentNode.removeChild(row);
  });
}

function appendLogToTable(log: Log) {
  if(selectedLogType === LogType.ALL || log.Type === selectedLogType) {
    var type = <LogType>log.Type;
    var cssClass = type === LogType.PICTURE_CHANGE ? "pictureRow" : "textRow";

    var row = <HTMLTableRowElement>logsTableBody.insertRow();
    row.classList.add(cssClass);

    var idCell = <HTMLTableCellElement>row.insertCell();
    idCell.innerText = log.ID.toString();

    var createDateCell = <HTMLTableCellElement>row.insertCell();
    createDateCell.innerText = new Date(log.CreateDate).toLocaleString();

    var contentCell = <HTMLTableCellElement>row.insertCell();
    contentCell.innerText = log.Content;
  }
}

window.addEventListener("load", (e) => {
  logsTable = <HTMLTableElement>document.getElementById("logsTable");
  logsTableBody = <HTMLTableSectionElement>logsTable.querySelector("tbody");

  var filter1CB = <HTMLInputElement>document.getElementById("filter1CB");
  var filter2CB = <HTMLInputElement>document.getElementById("filter2CB");
  filter1CB.addEventListener("change", (e) => {enableOrDisableFilter(e, 1);}, false);
  filter2CB.addEventListener("change", (e) => {enableOrDisableFilter(e, 2);}, false);

  canvas = <HTMLCanvasElement>document.getElementById("canvas");
  context = canvas.getContext("2d");
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
  canvas.addEventListener("dragenter", (e) => {
    e.stopPropagation();
    e.preventDefault();
  }, false);
  canvas.addEventListener("dragover", (e) => {
    e.stopPropagation();
    e.preventDefault();
  }, false);
  canvas.addEventListener("drop", (e) => {
    e.stopPropagation();
    e.preventDefault();

    var dt = e.dataTransfer;
    var file = dt.files[0];

    var isImage = file.name.match(/\.(jpg|jpeg|png|gif)$/);
    if(isImage) {
      var img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = function() {
        state.Image = img;
        var widthRatio = state.Image.width / canvasWidth;
        var heightRatio = state.Image.height / canvasHeight;
        if(widthRatio > heightRatio) {
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

        log(new Log(LogType.PICTURE_CHANGE, Date.now(), "picture changed: " + file.name));
      }
    }
    else {
      var reader = new FileReader();
      reader.onload = function(e) {
        var text = reader.result;
        state.Text = text;
        draw();
        log(new Log(LogType.TEXT_CHANGE, Date.now(), "text changed: " + file.name));
      }
      reader.readAsText(file);
    }
  }, false);
}, false);

function enableOrDisableFilter(e: Event, which: number) {
  var cb = <HTMLInputElement>e.target;
  if(which == 1) state.IsFilter1Enabled = cb.checked;
  if(which == 2) state.IsFilter2Enabled= cb.checked;
  draw();
}

function draw() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  if(state.Image) {
    context.drawImage(state.Image, state.ImageX, state.ImageY, state.ImageWidth, state.ImageHeight);

    var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
    filterWorker.postMessage(new FilterWorkerMessage(imageData, state.IsFilter1Enabled, state.IsFilter2Enabled));
  }
  else
    drawText();
}

forEachNode("input[name='logType']", (node) => {
  node.addEventListener("click", (event) => {
    var radio = <HTMLInputElement>node;
    var logType = <LogType>parseInt(radio.value);
    selectedLogType = logType;
    emptyLogsTable();
    if(logType == LogType.ALL)
      loadLogs();
    else
      filterLogs(logType);
  }, false);
});

function drawText() {
  if(state.Text) {
    context.fillStyle = "red";
    context.font = "13px Sans-Serif";
    wrapText(context, state.Text, 0, canvasHeight / 2, canvasWidth, 20);
  }
}