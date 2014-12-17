var body = document.body;

function makeRandomString(): string
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function randomDigit(): number {
  return Math.floor(Math.random() * 9);
}

function makeRandomNumber(): string {
  var str = "";
  str += randomDigit().toString();
  str += randomDigit().toString();
  return str;
}

function removeElement(element: HTMLElement) {
  element.parentElement.removeChild(element);
}

function removeToInsertLater (element: HTMLElement): () => void {
    var parentNode = element.parentNode;
    var nextSibling = element.nextSibling;
    parentNode.removeChild(element);
    return () => {
        if (nextSibling) {
            parentNode.insertBefore(element, nextSibling);
        } else {
            parentNode.appendChild(element);
        }
    };
};

function forEachNode(nodes: NodeList, callback: (HTMLElement) => void) {
  for(var i = 0; i < nodes.length; i++)
    callback(nodes[i]);
}

class RandomRecordCollection {
  private records: RandomRecord[];

  private lastSortIndex: number;
  private isDesc: boolean;

  constructor(private table: HTMLTableElement) {
    this.records = new Array<RandomRecord>();
  }

  public push(record: RandomRecord) {
    this.records.push(record);
  }

  public sortByColumnIndex(index: number) {
    if(index === this.lastSortIndex)
    this.isDesc = true;

    if(index === 0) {
      this.records.sort((a, b) => {
        return a.Name.localeCompare(b.Name);
      });
    }

    this.lastSortIndex = index;
  }

  public refresh() {
    this.records.forEach((record) => {
      removeElement(record.Row);
      this.table.appendChild(record.Row);
    });
  }
}

class RandomRecord {
  public Name: string;
  public Surname: string;
  public Sex: string;
  public Age: string;

  constructor(public Row: HTMLTableRowElement) {
    this.Name = makeRandomString();
    this.Surname = makeRandomString();
    this.Sex = makeRandomString();
    this.Age = makeRandomNumber();
  }

  public render() {
    this.renderCell(0, this.Name);
    this.renderCell(1, this.Surname);
    this.renderCell(2, this.Sex);
    this.renderCell(3, this.Age);
  }

  private renderCell(cellIndex: number, text: string) {
    var column = <HTMLTableCellElement>row.insertCell(cellIndex);
    column.innerText = text;
  }
}

var randomDataTable = <HTMLTableElement>document.getElementById("randomData");
var records = new RandomRecordCollection(randomDataTable);
var showRandomDataTable = removeToInsertLater(randomDataTable);

for(var rowIndex = 1; rowIndex < 20; rowIndex++) {
  var row = <HTMLTableRowElement>randomDataTable.insertRow(rowIndex);
  var record = new RandomRecord(row);
  record.render();
  records.push(record);
}

forEachNode(randomDataTable.querySelectorAll("th"), (headerCell: HTMLTableHeaderCellElement) => {
  headerCell.addEventListener("click", (event) => {
    records.sortByColumnIndex(headerCell.cellIndex);
    records.refresh();
  }, false);
});

forEachNode(randomDataTable.querySelectorAll("td"), (cell: HTMLTableCellElement) => {
  cell.addEventListener("click", (event) => {
    var row = <HTMLTableRowElement>cell.parentElement;
    if(row.classList.contains("selected"))
      row.classList.remove("selected");
    else
      row.classList.add("selected");
  }, false);
});

randomDataTable.classList.remove("hide");
showRandomDataTable();