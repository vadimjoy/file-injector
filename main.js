var target = document.querySelectorAll('.js-target')[0];

function sendLog(data, mark) {
    var body = document.getElementsByTagName('body')[0],
        log_div = document.createElement('div');
    mark ? log_div.style.color = mark : null;
    log_div.appendChild(document.createTextNode(data));
    body.appendChild(log_div)

}

var $injector = new FileInjector('.js-file-uploader');

$injector.readimageprocess = function (data) {
    /**
     * While image not loaded get info about load process
     */
    function getPercent(loaded, total) {
        return Math.floor(loaded / (total / 100));
    }

    var percent = getPercent(data.loaded, data.total);
    sendLog('file: ' + data.filename + '; status: ' + data.status + '; total: ' + percent + '%', 'blue');
    if (percent === 100 && data.status === 'load') {
        sendLog('file: ' + data.filename + ' ready', 'green');
    }
};

$injector.onchangefile = function (file) {
    console.log(file);
};

$injector.onreadimage = function (image) {
    target.appendChild(image);
};