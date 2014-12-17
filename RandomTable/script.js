var body = document.body;
function makeRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
function randomDigit() {
    return Math.floor(Math.random() * 9);
}
function makeRandomNumber() {
    var str = "";
    str += randomDigit().toString();
    str += randomDigit().toString();
    return str;
}
function removeElement(element) {
    element.parentElement.removeChild(element);
}
function removeToInsertLater(element) {
    var parentNode = element.parentNode;
    var nextSibling = element.nextSibling;
    parentNode.removeChild(element);
    return function () {
        if (nextSibling) {
            parentNode.insertBefore(element, nextSibling);
        }
        else {
            parentNode.appendChild(element);
        }
    };
}
;
function forEachNode(nodes, callback) {
    for (var i = 0; i < nodes.length; i++)
        callback(nodes[i]);
}
var RandomRecordCollection = (function () {
    function RandomRecordCollection(table) {
        this.table = table;
        this.records = new Array();
    }
    RandomRecordCollection.prototype.push = function (record) {
        this.records.push(record);
    };
    RandomRecordCollection.prototype.sortByColumnIndex = function (index) {
        if (index === this.lastSortIndex)
            this.isDesc = true;
        if (index === 0) {
            this.records.sort(function (a, b) {
                return a.Name.localeCompare(b.Name);
            });
        }
        this.lastSortIndex = index;
    };
    RandomRecordCollection.prototype.refresh = function () {
        var _this = this;
        this.records.forEach(function (record) {
            removeElement(record.Row);
            _this.table.appendChild(record.Row);
        });
    };
    return RandomRecordCollection;
})();
var RandomRecord = (function () {
    function RandomRecord(Row) {
        this.Row = Row;
        this.Name = makeRandomString();
        this.Surname = makeRandomString();
        this.Sex = makeRandomString();
        this.Age = makeRandomNumber();
    }
    RandomRecord.prototype.render = function () {
        this.renderCell(0, this.Name);
        this.renderCell(1, this.Surname);
        this.renderCell(2, this.Sex);
        this.renderCell(3, this.Age);
    };
    RandomRecord.prototype.renderCell = function (cellIndex, text) {
        var column = row.insertCell(cellIndex);
        column.innerText = text;
    };
    return RandomRecord;
})();
var randomDataTable = document.getElementById("randomData");
var records = new RandomRecordCollection(randomDataTable);
var showRandomDataTable = removeToInsertLater(randomDataTable);
for (var rowIndex = 1; rowIndex < 20; rowIndex++) {
    var row = randomDataTable.insertRow(rowIndex);
    var record = new RandomRecord(row);
    record.render();
    records.push(record);
}
forEachNode(randomDataTable.querySelectorAll("th"), function (headerCell) {
    headerCell.addEventListener("click", function (event) {
        records.sortByColumnIndex(headerCell.cellIndex);
        records.refresh();
    }, false);
});
forEachNode(randomDataTable.querySelectorAll("td"), function (cell) {
    cell.addEventListener("click", function (event) {
        var row = cell.parentElement;
        if (row.classList.contains("selected"))
            row.classList.remove("selected");
        else
            row.classList.add("selected");
    }, false);
});
randomDataTable.classList.remove("hide");
showRandomDataTable();
