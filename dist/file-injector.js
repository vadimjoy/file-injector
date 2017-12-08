(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["FileInjector"] = factory();
	else
		root["FileInjector"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__css_common_css__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__css_common_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__css_common_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__css_main_css__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__css_main_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__css_main_css__);
/**
 * @license
 * Copyright Vadim Joy. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */


var FileInjector = /** @class */ (function () {
    function FileInjector(options, callback) {
        var upl = this;
        this.options = {
            elem: options.elem || undefined,
            imagePreview: options.imagePreview || null,
            readStatus: options.readStatus || null
        };
        if (this.options.elem) {
            this.file_input = this.options.elem.querySelectorAll('input[type="file"]')[0] || undefined;
            this.clip_input = this.options.elem.querySelectorAll('input[type="text"]')[0] || undefined;
        }
        this.file_input ? this.file_input.addEventListener("change", function (e) {
            upl.changeFileHandler(e);
        }) : null;
        this.clip_input ? this.clip_input.addEventListener("paste", function (e) {
            upl.pasteHandler(e);
        }) : null;
        this.callback = callback;
    }
    FileInjector.prototype.imageLoad = function (item) {
        var _this = this;
        var upl = this;
        var reader = new FileReader();
        /**
         * Create image info
         */
        var current = {
            filename: item.name,
            status: 'ready',
            loaded: 0,
            total: 0
        };
        /**
         * FileReader API
         */
        if (this.options.readStatus) {
            reader.onloadstart = function (e) {
                if (e.lengthComputable) {
                    current.status = 'start';
                    current.loaded = e.loaded;
                    current.total = e.total;
                    upl.options.readStatus(current);
                }
            };
            reader.onerror = function (e) {
                current.status = e.code;
            };
            reader.onprogress = function (e) {
                if (e.lengthComputable) {
                    current.status = 'progress';
                    current.loaded = e.loaded;
                    current.total = e.total;
                    upl.options.readStatus(current);
                }
            };
            reader.onload = function (e) {
                if (e.lengthComputable) {
                    current.status = 'load';
                    current.loaded = e.loaded;
                    current.total = e.total;
                    _this.options.readStatus(current);
                }
            };
        }
        /**
         * Callback on end of load
         */
        reader.onloadend = function (e) {
            current.status = 'end';
            current.loaded = e.loaded;
            current.total = e.total;
            upl.options.imagePreview(reader.result);
        };
        reader.readAsDataURL(item);
    };
    FileInjector.prototype.addFile = function (item) {
        if (item.type.indexOf('image') !== -1) {
            this.options.imagePreview ? this.imageLoad(item) : null;
        }
        this.callback(item);
    };
    FileInjector.prototype.pasteHandler = function (e) {
        if (e.clipboardData) {
            var items = e.clipboardData.items;
            if (items) {
                for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                    var item = items_1[_i];
                    if (item.kind === 'file') {
                        var file = item.getAsFile();
                        this.addFile(file);
                    }
                }
            }
        }
    };
    FileInjector.prototype.changeFileHandler = function (e) {
        var items = e.target.files;
        if (items) {
            for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
                var item = items_2[_i];
                this.addFile(item);
            }
        }
    };
    return FileInjector;
}());
/* harmony default export */ __webpack_exports__["default"] = (FileInjector);
var elem = document.querySelectorAll('.js-file-uploader')[0];
var target = document.querySelectorAll('.js-target')[0];
/*
function readStatus(status:any) {
    /!**
     * While image not loaded get info about load process
     *!/
    console.log(status);
}

function imagePreview(base64:any) {
    /!**
     * If image loaded append this in block
     *!/
    var image = new Image();
    image.src = base64;

    target.appendChild(image);
}

new FileInjector({elem: elem, imagePreview: imagePreview, readStatus: readStatus}, function (file:any) {
    /!**
     * Get original file
     *!/
    console.log(file);
});*/


/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
/******/ ])["default"];
});