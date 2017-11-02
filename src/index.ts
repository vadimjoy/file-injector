/**
 * @license
 * Copyright Vadim Joy. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import './css/common.css'
import './css/main.css'

export default class FileUploader {
    elem:Element;
    target:Element;
    callback:Function;
    clip_input:Element;
    file_input:Element;
    files:Array<File> = [];

    constructor(elem:Element, target:Element, callback:Function) {
        var clip = this;
        this.elem = elem;
        this.target = target;

        this.file_input = this.elem.querySelectorAll('input[type="file"]')[0];
        this.clip_input = this.elem.querySelectorAll('input[type="text"]')[0];
        this.clip_input.addEventListener("paste", (e)=> {
            clip.pasteHandler(e)
        });

        this.file_input.addEventListener("change", (e)=> {
            clip.changeFileHandler(e)
        });

        this.callback = callback;
    }

    public addFile(item:any) {
        this.elem.classList.add('test');
        this.files.push(item);
        let reader = new FileReader();
        let image = new Image();
        reader.onloadend = function () {
            image.src = reader.result;
        };
        reader.readAsDataURL(item);
        this.target.appendChild(image);
        this.callback(item);
    }

    public pasteHandler(e:any) {
        if (e.clipboardData) {
            var items = e.clipboardData.items;
            if (items) {
                for (let item of items) {
                    if (item.type.indexOf("image") !== -1) {
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
                if (item.type.indexOf("image") !== -1) {
                    this.addFile(item);
                }
            }
        }
    }
}