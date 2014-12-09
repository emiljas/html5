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

window.addEventListener("load", (event) => {
  var html = "<table>";
  html += "<thead>";
  html += "<th>name</th>";
  html += "<th>surname</th>";
  html += "<th>sex</th>";
  html += "<th>age</th>";
  html += "</thead>";
  html += "<tbody>"
  for(var rowI = 0; rowI < 20; rowI++) {
    html += "<tr>";
    for(var columnI = 0; columnI < 4; columnI++) {
      if(columnI == 3)
        html += "<td>" + makeRandomNumber() + "</td>";
      else
        html += "<td>" + makeRandomString() + "</td>";
    }
    html += "</tr>";
  }
  html += "</tbody>";
  html += "</table>";
  body.innerHTML = html;
}, false);
