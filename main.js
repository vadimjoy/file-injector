var elem = document.querySelectorAll('.js-file-uploader')[0];
var target = document.querySelectorAll('.js-target')[0];

function imagePreview(info, base64) {
    /**
     * While image not loaded get info about load process
     */
    console.log(info);

    /**
     * If image loaded append this in block
     */
    var image = new Image();
    image ? target.appendChild(image.src = base64) : null;
}

new FileUploader({elem: elem, imagePreview: imagePreview}, function (file) {
    /**
     * Get original file
     */
    console.log(file);
});
