/**
 * @license
 * Copyright Vadim Joy. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import './css/common.css'
import './css/main.css'

export default class FileUploader {
    options:{
        elem:Element,
        imagePreview:Function
    };

    callback:Function;
    clip_input:Element;
    file_input:Element;

    constructor(options:any, callback:Function) {
        var upl = this;

        this.options = {
            elem: options.elem || undefined,
            imagePreview: options.imagePreview || null
        };

        if (this.options.elem) {
            this.file_input = this.options.elem.querySelectorAll('input[type="file"]')[0] || undefined;
            this.clip_input = this.options.elem.querySelectorAll('input[type="text"]')[0] || undefined;
        }

        this.file_input ? this.file_input.addEventListener("change", (e)=> {
            upl.changeFileHandler(e)
        }) : null;

        this.clip_input ? this.clip_input.addEventListener("paste", (e)=> {
            upl.pasteHandler(e)
        }) : null;

        this.callback = callback;
    }

    public imageLoad(item:any) {
        let upl = this;

        let reader = new FileReader();
        let image = new Image();

        /**
         * Create image info
         */
        let current = {
            filename: item.name,
            status: 'ready',
            loaded: 0,
            total: 0
        };

        /**
         * FileReader API
         */
        reader.onloadstart = (e:any)=> {
            if (e.lengthComputable) {
                current.status = 'start';
                current.loaded = e.loaded;
                current.total = e.total;
                upl.options.imagePreview(current, null);
            }
        };

        reader.onerror = (e:any)=> {
            current.status = e.code;
        };

        reader.onprogress = (e:any) => {
            if (e.lengthComputable) {
                current.status = 'progress';
                current.loaded = e.loaded;
                current.total = e.total;
                upl.options.imagePreview(current, null);
            }
        };

        reader.onload = (e:any) => {
            if (e.lengthComputable) {
                current.status = 'load';
                current.loaded = e.loaded;
                current.total = e.total;
                this.options.imagePreview(current, null);
            }
        };

        /**
         * Callback on end of load
         */
        reader.onloadend = (e:any) => {
            current.status = 'end';
            current.loaded = e.loaded;
            current.total = e.total;
            image.src = reader.result;
            upl.options.imagePreview(current, image);
        };

        reader.readAsDataURL(item);
    }

    public addFile(item:any) {
        if (item.type.indexOf('image') !== -1) {
            this.options.imagePreview ? this.imageLoad(item) : null;
        }
        this.callback(item);
    }

    public pasteHandler(e:any) {
        if (e.clipboardData) {
            var items = e.clipboardData.items;
            if (items) {
                for (let item of items) {
                    if (item.kind === 'file') {
                        var file = item.getAsFile();
                        this.addFile(file);
                    }
                }
            }
        }
    }

    public changeFileHandler(e:any) {
        var items = e.target.files;
        if (items) {
            for (let item of items) {
                this.addFile(item);
            }
        }
    }
}

var elem = document.querySelectorAll('.js-file-uploader')[0];
var target = document.querySelectorAll('.js-target')[0];

function imagePreview(info:any, image:any) {
    /**
     * While image not loaded get info about load process
     */
    console.log(info);

    /**
     * If image loaded append this in block
     */
    image ? target.appendChild(image) : null;
}

new FileUploader({elem: elem, imagePreview: imagePreview}, function (file:any) {
    /**
     * Get o file
     */
    console.log(file);
});
