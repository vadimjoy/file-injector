/**
 * @license пофиг
 */
import './css/common.css'
import './css/main.css'

export default class FileInjector {
    element:Element;
    clip_input:Element;
    file_input:Element;
    readimageprocess:Function;
    onchangefile:Function;
    onreadimage:Function;
    dragClass:string;

    constructor(element:any, options:{
        dragClass?: string
    } = {}) {
        if (typeof element === 'string') {
            this.element = document.querySelectorAll(element)[0] || undefined;

        }
        else {
            this.element = element;
        }

        this.dragClass = options.dragClass || 'dragenter';
        this.readimageprocess = undefined;
        this.onchangefile = undefined;
        this.onreadimage = undefined;

        this.onDragOver = this.onDragOver.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onChangeFile = this.onChangeFile.bind(this);
        this.onPaste = this.onPaste.bind(this);

        if (this.element) {
            this.file_input = this.element.querySelectorAll('input[type="file"]')[0] || undefined;
            this.clip_input = this.element.querySelectorAll('[data-clip="image"]')[0] || undefined;

            this.element.addEventListener("dragover", this.onDragOver, false);
            this.element.addEventListener("dragleave", this.onDragLeave, false);
            this.element.addEventListener("drop", this.onDrop, false);
        }

        this.file_input ? this.file_input.addEventListener("change", this.onChangeFile, false) : null;
        this.clip_input ? this.clip_input.addEventListener("paste", this.onPaste, false) : null;
    }

    public imageLoad(item:any) {
        let reader = new FileReader();

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
        if (this.readimageprocess) {
            reader.onloadstart = (e:any)=> {
                if (e.lengthComputable) {
                    current.status = 'start';
                    current.loaded = e.loaded;
                    current.total = e.total;
                    this.readimageprocess.call(this, current);
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
                    this.readimageprocess.call(this, current);
                }
            };

            reader.onload = (e:any) => {
                if (e.lengthComputable) {
                    current.status = 'load';
                    current.loaded = e.loaded;
                    current.total = e.total;
                    this.readimageprocess.call(this, current);
                }
            };
        }

        /**
         * Callback on end of load
         */
        reader.onloadend = (e:any) => {
            current.status = 'end';
            current.loaded = e.loaded;
            current.total = e.total;

            var image = new Image();
            image.src = reader.result;
            this.onreadimage.call(this, image);
        };

        reader.readAsDataURL(item);
    }

    public addFile(item:any) {
        if (item.type.indexOf('image') !== -1) {
            this.onreadimage ? this.imageLoad(item) : null;
        }

        if (this.onchangefile) {
            this.onchangefile.call(this, item);
        }
    }

    private onDragOver(e:Event) {
        e.preventDefault();
        e.stopPropagation();
        this.element.classList.add(this.dragClass);
        return false;
    }

    private onDragLeave(e:Event) {
        e.preventDefault();
        e.stopPropagation();
        this.element.classList.remove(this.dragClass);
        return false;
    }

    private onDrop(e:any) {
        e.preventDefault();
        e.stopPropagation();
        this.element.classList.remove(this.dragClass);
        if (e.dataTransfer) {
            this.dataToFiles(e.dataTransfer.items);
        }
        return false;
    }

    private onPaste(e:any) {
        if (e.clipboardData) {
            this.dataToFiles(e.clipboardData.items)
        }
    }

    private dataToFiles(items:any) {
        if (items) {
            for (let item of items) {
                if (item.kind === 'file') {
                    var file = item.getAsFile();
                    this.addFile(file);
                }
            }
        }
    }

    private onChangeFile(e:any) {
        var items = e.target.files;
        if (items) {
            for (let item of items) {
                this.addFile(item);
            }
        }
    }
}
