var canvas: HTMLCanvasElement, context: CanvasRenderingContext2D;
var canvasWidth: number, canvasHeight: number;

var logsTable: HTMLTableElement;

class State {
  public Image: HTMLImageElement;
  public ImageX: number;
  public ImageY: number;
  public ImageWidth: number;
  public ImageHeight: number;

  public Text: string;

  public IsFilter1Enabled = false;
  public IsFilter2Enabled = false;

  public LogDisplayMode = LogDisplayMode.ALL;
}

enum LogType {
  PICTURE_CHANGE,
  TEXT_CHANGE
}

class Log {
  public ID: number;

  constructor (
    public Type: LogType,
    public CreateDate: number,
    public Content: string
  ) { }
}

var state = new State();

var db: IDBDatabase;

var request = window.indexedDB.open("db", 3);

request.onupgradeneeded = (event) => {
  var db = <IDBDatabase>request.result;
  var logsObjectStore = db.createObjectStore("logs", {
    autoIncrement: true
  });
  logsObjectStore.createIndex("Type", "Type", { unique: false });
};

request.onerror = (event) => {
  console.log("create indexeddb permission denied");
};

request.onsuccess = (event) => {
  db = request.result;

  loadLogs();
};

function loadLogs() {
  var logsObjectStore = db.transaction("logs", "readwrite").objectStore("logs");
  var request = logsObjectStore.index("Type").get(state.LogDisplayMode);

  request.onsuccess = (event) => {
    console.log(event.target["result"]);
    // var cursor = <IDBCursorWithValue>event.target["result"];
    // if(cursor) {
    //   var log = <Log>cursor.value;
    //   log.ID = cursor.key;
    //   appendLogToTable(log);
    //   cursor.continue();
    // }
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

function appendLogToTable(log: Log) {
  var type = <LogType>log.Type;
  var cssClass = type === LogType.PICTURE_CHANGE ? "pictureRow" : "textRow";

  var row = <HTMLTableRowElement>logsTable.insertRow();
  row.classList.add(cssClass);

  var idCell = <HTMLTableCellElement>row.insertCell();
  idCell.innerText = log.ID.toString();

  var createDateCell = <HTMLTableCellElement>row.insertCell();
  createDateCell.innerText = new Date(log.CreateDate).toLocaleString();

  var contentCell = <HTMLTableCellElement>row.insertCell();
  contentCell.innerText = log.Content;
}

function refreshLogTable() {
  logsTable.innerHTML = "";
  loadLogs();
}

window.addEventListener("load", (e) => {
  var logDisplayModeRadioBtns = document.querySelectorAll("input[name='logDisplayMode']");
  for (var i = logDisplayModeRadioBtns.length - 1; i >= 0; i--) {
    logDisplayModeRadioBtns[i].addEventListener("click", (event) => {
      var radioBtn = <HTMLInputElement>event.target;
      var mode = <LogDisplayMode>parseInt(radioBtn.value);
      state.LogDisplayMode = mode;

      refreshLogTable();
    }, false);
  }

  logsTable = <HTMLTableElement>document.getElementById("logsTable");

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

var solarizeLevel = 100;

function draw() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  if(state.Image) {
    context.drawImage(state.Image, state.ImageX, state.ImageY, state.ImageWidth, state.ImageHeight);
    if(state.IsFilter1Enabled) {
      var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
      var data = imageData.data;
      for (var i = 0; i <= data.length - 4; i += 4) {
            data[i] = solarizeColor(data[i], solarizeLevel)
            data[i + 1] = solarizeColor(data[i + 1], solarizeLevel)
            data[i + 2] = solarizeColor(data[i + 2], solarizeLevel);
        }
      context.putImageData(imageData, 0, 0);
    }
    if(state.IsFilter2Enabled) {
      var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
      var data = imageData.data;
      for (var i = 0; i <= data.length - 4; i += 4) {
            data[i] = 255 - data[ i ];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
      context.putImageData(imageData, 0, 0);
    }
  }
  if(state.Text) {
    context.fillStyle = "red";
    context.font = "13px Sans-Serif";
    wrapText(context, state.Text, 0, canvasHeight / 2, canvasWidth, 20)
  }
}

function solarizeColor(color, level) {
  return Math.min(color + level, 255);
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ');
  var line = '';

  for(var n = 0; n < words.length; n++) {
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

enum LogDisplayMode {
  ALL = 1,
  TEXT = 2,
  IMAGES = 3
}



// function getLogDisplayMode(): LogDisplayMode {
//   var selectedRadioBtn = <HTMLInputElement>document.querySelector('input[name="logDisplayMode"]:checked');
//   return <LogDisplayMode>parseInt(selectedRadioBtn.value);
// }