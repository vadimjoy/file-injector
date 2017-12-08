var elem = document.querySelectorAll('.js-file-uploader')[0];
var target = document.querySelectorAll('.js-target')[0];

function sendLog(data, mark) {
    var body = document.getElementsByTagName('body')[0],
        log_div = document.createElement('div');
    mark ? log_div.style.color = mark : null;
    log_div.appendChild(document.createTextNode(data));
    body.appendChild(log_div)

}

function readStatus(data) {
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
}

function imagePreview(base64) {
    /**
     * If image loaded append this in block
     */
    var image = new Image();
    image.src = base64;

    //target.appendChild(image);
}

new FileInjector({elem: elem, imagePreview: imagePreview, readStatus: readStatus}, function (file) {
    /**
     * Get original file
     */
    //console.log(file);
});