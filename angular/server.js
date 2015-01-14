/// <reference path="typings/tsd.d.ts" />
var http = require("http");
var fs = require("fs");
var url = require("url");
var mime = require("mime");
var request = require("request");
http.createServer(function (req, res) {
    var parsedUrl = url.parse(req.url);
    if (parsedUrl.pathname == "/getCurrencies") {
        request.get('http://www.nbp.pl/kursy/xml/a003z150107.xml', function (error, response, body) {
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
var RequestHandler = (function () {
    function RequestHandler(request, response) {
        var _this = this;
        this.readFilePath = function () {
            var requestUrl = url.parse(_this.request.url);
            return "./" + requestUrl.pathname;
        };
        this.responseFile = function () {
            _this.response.setHeader("Content-Type", mime.lookup(_this.filePath));
            _this.response.writeHead(200);
            fs.readFile(_this.filePath, function (error, data) {
                _this.response.end(data);
            });
        };
        this.reponseFileNotFound = function () {
            _this.response.writeHead(404);
            _this.response.end();
        };
        this.reponseError = function () {
            _this.response.writeHead(500);
            _this.response.end();
        };
        this.tryReponseFile = function () {
            try {
                fs.exists(_this.filePath, function (exists) {
                    if (exists)
                        _this.responseFile();
                    else
                        _this.reponseFileNotFound();
                });
            }
            catch (error) {
                console.log("server: " + error);
                _this.reponseError();
            }
        };
        this.request = request;
        this.response = response;
        this.filePath = this.readFilePath();
    }
    return RequestHandler;
})();
