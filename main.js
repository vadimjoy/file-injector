var elem = document.querySelectorAll('.js-file-uploader')[0];
var target = document.querySelectorAll('.js-target')[0];


function readStatus(data) {
    /**
     * While image not loaded get info about load process
     */
    function getPercent(loaded, total) {
        return Math.floor(loaded / (total / 100));
    }

    console.log('file: ' + data.filename + '; status: ' + data.status + '; total: ' + getPercent(data.loaded, data.total));
}

function imagePreview(base64) {
    /**
     * If image loaded append this in block
     */
    var image = new Image();
    image.src = base64;

    target.appendChild(image);
}

new FileInjector({elem: elem, imagePreview: imagePreview, readStatus: readStatus}, function (file) {
    /**
     * Get original file
     */
    //console.log(file);
});