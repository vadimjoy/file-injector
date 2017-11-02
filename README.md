# file-uploader

#### example

```js
var elem = document.querySelectorAll('.js-file-uploader')[0];
var target = document.querySelectorAll('.js-target')[0];
new FileUploader(elem, target, function (file) {
    console.log(file)
});
```