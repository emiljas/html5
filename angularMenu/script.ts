/// <reference path="typings/tsd.ts" />

var app = angular.module("app", []);

app.controller("MenuController", function() {
  this.links = [
    { name: "a", href: "a.html" },
    { name: "b", href: "b.html" },
    { name: "c", href: "c.html" }
  ];
});

app.controller("MainController", function() {
  this.content = "a aaa a aaaaa a a a  aaa a a a a a a   aaaa a aaaa a a";
});