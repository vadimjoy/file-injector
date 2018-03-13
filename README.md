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
var target = document.querySelectorAll('.js-target')[0];


var $injector = new FileInjector('.js-file-uploader');

$injector.readimageprocess = function (status:any) {
    console.log(status);
};

$injector.onchangefile = function (file:any) {
    console.log(file);
};

$injector.onreadimage = function (image:any) {
    target.appendChild(image);
};
```