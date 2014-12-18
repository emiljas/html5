var FilterWorkerMessage = (function () {
    function FilterWorkerMessage(ImageData, IsFilter1Enabled, IsFilter2Enabled) {
        this.ImageData = ImageData;
        this.IsFilter1Enabled = IsFilter1Enabled;
        this.IsFilter2Enabled = IsFilter2Enabled;
    }
    return FilterWorkerMessage;
})();
var solarizeLevel = 100;
onmessage = function (event) {
    var message = event.data;
    var data = message.ImageData.data;
    if (message.IsFilter2Enabled) {
        for (var i = 0; i <= data.length - 4; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
    }
    if (message.IsFilter1Enabled) {
        for (var i = 0; i <= data.length - 4; i += 4) {
            data[i] = solarizeColor(data[i], solarizeLevel);
            data[i + 1] = solarizeColor(data[i + 1], solarizeLevel);
            data[i + 2] = solarizeColor(data[i + 2], solarizeLevel);
        }
    }
    postMessage(message);
};
function solarizeColor(color, level) {
    return Math.min(color + level, 255);
}
