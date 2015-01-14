var request = new XMLHttpRequest();
request.open("get", "/getCurrencies", true);
request.onload = (e) => {
  var xml = request.responseXML;
  console.log(xml.querySelector("pozycja[nazwa_waluty='bat\\ \\(Tajlandia\\)']"));
};
request.send();