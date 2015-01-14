/// <reference path="typings/tsd.d.ts" />

import http = require("http");
import fs = require("fs");
import url = require("url");
import mime = require("mime");
import request = require("request");

http.createServer((req, res) => {
  var parsedUrl = url.parse(req.url);
  if(parsedUrl.pathname == "/getCurrencies") {
    request.get('http://www.nbp.pl/kursy/xml/a003z150107.xml'
      , function (error, response, body) {
        if (!error && res.statusCode == 200) {
          res.write(body);
          res.end();
        }
    });
  }
  else {
    var handler = new RequestHandler(req, res);
    handler.tryReponseFile();
  }
}).listen(9500);

class RequestHandler {
  private request: http.ServerRequest;
  private response: http.ServerResponse;
  private filePath: string;

  constructor(request , response) {
    this.request = request;
    this.response = response;
    this.filePath = this.readFilePath();
  }

 private readFilePath = () => {
    var requestUrl = url.parse(this.request.url);
    return "./" + requestUrl.pathname;
  };

 private responseFile = () => {
    this.response.setHeader("Content-Type", mime.lookup(this.filePath));
    this.response.writeHead(200);
    fs.readFile(this.filePath, (error, data) => { 
      this.response.end(data); 
    });
  };

 private reponseFileNotFound = () => {
    this.response.writeHead(404);
    this.response.end();
  };

 private reponseError = () => {
    this.response.writeHead(500);
    this.response.end();
  };

 public tryReponseFile = () => {
    try {
      fs.exists(this.filePath, (exists) => {
        if (exists)
          this.responseFile();
        else
          this.reponseFileNotFound();
      });
    }
    catch (error) {
      console.log("server: " + error);
      this.reponseError();
    }
  };
}