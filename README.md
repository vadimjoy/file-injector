# file-injector

#### Example

###### HTML
```html              
<!-- wrapper for image preview -->
<div class="load-target js-target"></div>

                          <!-- important wrapper class --> 
<div class="file-uploader js-file-uploader">
    <label class="file-uploader__field">
        <!-- optional clipboard catch input -->
        <input type="text">
        <span class="file-uploader__indicator"><i class="fa fa-clipboard" aria-hidden="true"></i></span>
    </label>
    <span class="file-uploader__delimiter">или</span>
    <label class="file-uploader__field">
        <!-- optional file input -->
        <input type="file" multiple>
        <span class="file-uploader__indicator"><i class="fa fa-upload" aria-hidden="true"></i></span>
    </label>
</div>
```

###### JS
```js
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
```