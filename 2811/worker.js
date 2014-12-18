onmessage = function (e) {
    var imageData = e.data.imageData;
    var level = e.data.level;
    var data = imageData.data;
    for (var i = 0; i <= data.length - 4; i += 4) {
        data[i] = solarizeColor(data[i], level);
        data[i + 1] = solarizeColor(data[i + 1], level);
        data[i + 2] = solarizeColor(data[i + 2], level);
    }
    postMessage(imageData);
};
function solarizeColor(color, level) {
    return Math.min(color + level, 255);
}
