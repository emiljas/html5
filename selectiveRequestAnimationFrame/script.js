var Script;
(function (Script) {
    "use strict";
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    var fontHeight = 15;
    var margin = 35;
    var radius = canvas.width / 2 - margin;
    var hourHandLength = 0.5;
    var minuteHandLength = 0.8;
    var secondHandLength = 0.8;
    context.font = fontHeight + "px Arial";
    context.textBaseline = "middle";
    context.textAlign = "center";
    function drawCircle() {
        context.beginPath();
        context.arc(width / 2, height / 2, radius, 0, Math.PI * 2, true);
        context.stroke();
    }
    function drawNumerals() {
        var numerals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        numerals.forEach(function (numeral, index) {
            var angle = Math.PI / 6 * (index - 2);
            var text = numeral.toString();
            var x = Math.cos(angle) * (width / 2 - margin / 2) + (width / 2);
            var y = Math.sin(angle) * (height / 2 - margin / 2) + (height / 2);
            context.fillText(text, x, y);
        });
    }
    function drawHands() {
        drawHourHand();
        drawMinuteHand();
        drawSecondHand();
    }
    function drawHourHand() {
        drawHand(calculateHourValue(), hourHandLength);
    }
    function drawMinuteHand() {
        drawHand(calculateMinuteValue(), minuteHandLength);
    }
    function drawSecondHand() {
        drawHand(calculateSecondValue(), secondHandLength);
    }
    function calculateHourValue() {
        var hours = new Date().getHours();
        if (hours > 12)
            hours -= 12;
        return (hours + calculateMinuteValue()) / 60;
    }
    function calculateMinuteValue() {
        var minutes = new Date().getMinutes();
        return (minutes + calculateSecondValue()) / 60;
    }
    function calculateSecondValue() {
        var seconds = new Date().getSeconds();
        return (seconds + calculateMillisecondValue()) / 60;
    }
    function calculateMillisecondValue() {
        var milliseconds = new Date().getMilliseconds();
        return milliseconds / 1000;
    }
    function drawHand(timeValue, length) {
        console.log(timeValue);
        context.moveTo(width / 2, height / 2);
        var angle = timeValue * 2 * Math.PI;
        angle -= Math.PI / 2;
        var x = Math.cos(angle) * ((width - margin - (1 - length) * width) / 2) + (width / 2);
        var y = Math.sin(angle) * ((height - margin - (1 - length) * height) / 2) + (height / 2);
        context.lineTo(x, y);
        context.stroke();
    }
    setInterval(function () {
        context.clearRect(0, 0, width, height);
        drawCircle();
        drawNumerals();
        drawHands();
    }, 10);
})(Script || (Script = {}));
