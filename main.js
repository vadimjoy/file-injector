var elem = document.querySelectorAll('.js-file-uploader')[0];
var target = document.querySelectorAll('.js-target')[0];


function readStatus(status) {
    /**
     * While image not loaded get info about load process
     */
    console.log(status);
}

function imagePreview(base64) {
    /**
     * If image loaded append this in block
     */
    var image = new Image();
    base64 ? target.appendChild(image.src = base64) : null;
}

new FileUploader({elem: elem, readStatus: readStatus, imagePreview: imagePreview}, function (file) {
    /**
     * Get original file
     */
    console.log(file);
});
