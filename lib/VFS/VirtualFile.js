'use strict';
const path = require('path');
const fs = require('fs');
const logger = require('jdf-log');
const fileType = require('./fileType');

/**
 *  文件描述格式
 *  originPath和targetPath均为绝对路径(absolute path)
 *  originPath是从硬盘中文件的路径
 *  targetPath是编译后生成的路径，位置和originPath处于同一文件夹下，后缀按需更改
 *  originContent是文件内容，作为留存不直接在这上面操作
 *  targetContent是处理后的文件内容，操作都是在targetContent上
 *  fetched 文件内容是否已从硬盘拉取，拉取过为true
 *  示例：
 *  VFile {
 *      originPath: 'D:\\NodeApp\\jdfDev\\widget\\p2\\p2.scss',
 *      originContent: '#p2 {\r\n    a {\r\n        color: blue;\r\n    }\r\n}',
 *      targetPath: 'D:\\NodeApp\\jdfDev\\widget\\p2\\p2.css',
 *      targetContent: ''#p2 a {\n  color: blue;\n}\n',
 *      fetched: true
 *  }
 */

class VFile {
    constructor(oPath, oContent, tPath, tContent) {
        if (oPath && !path.isAbsolute(oPath)) {
            logger.error('new VFile()--originPath must be absolute.');
            return {};
        }
        this._originPath = oPath;
        this._originContent = oContent;
        this._targetPath = tPath;
        this._targetContent = tContent;
        this._fetched = false;
        this._status = VFile.status.READY;
    }

    get status() {
        return this._status;
    }
    set status(value) {
        if (VFile.status[value]) {
            this._status = value;
        } else {
            logger.error('set status error, need status in VFile.status')
        }
    }

    get originPath() {
        return this._originPath;
    }

    set originPath(value) {
        this._originPath = value;
    }

    get originContent() {
        this.fetch();
        return this._originContent;
    }

    set originContent(value) {
        this._fetched = true;
        this._originContent = value;
    }

    get targetPath() {
        if (!this._targetPath) {
            this._targetPath = this._originPath;
        }
        return this._targetPath;
    }

    set targetPath(value) {
        this._targetPath = value;
    }

    get targetContent() {
        return this._targetContent;
    }

    set targetContent(value) {
        this._fetched = true;
        this._targetContent = value;
    }

    // 如果没有读到内存，则执行一次读取操作
    // 无论成功失败，都只会读取一次
    fetch() {
        if (!this._fetched && !this._originContent) {
            this._originContent = fs.readFileSync(this._originPath);
            if(VFile.isTextFile(this)) {
                this._originContent = this._originContent.toString();
            }
            this._targetContent = this._originContent;
            this._fetched = true;
        }
    }

    getType() {
        return path.extname(this._originPath).slice(1);
    }

    getTargetType() {
        if (!this._targetPath) {
            this._targetPath = this._originPath;
        }
        return path.extname(this._targetPath).slice(1);
    }

    changeTargetType(nType) {
        if (!this._targetPath) {
            this._targetPath = this._originPath;
        }
        this._targetPath = VFile.changeType(nType, this._targetPath);
    }

    // 如果是文本文件，那么可以以string方式写入内存，并成功写出
    // png, pdf, doc这种文件如果存string在内存处理，拷贝的时候就出问题
    // 可以在writeFies的时候指定输出文件后缀，避免非文本文件错误
    static isTextFile(vfile) {
        let textExtname = fileType.getTextExtname().join(',');
        let extname = vfile.getType();

        let reg = new RegExp(`^${extname}$|\\W${extname}$|^${extname}\\W|\\W${extname}\\W`, 'i');
        return reg.test(textExtname);
    }

    isTextFile() {
        return VFile.isTextFile(this);
    }

    isOutputIgnored() {
        let exts = fileType.getOutputIgnore().join(',');
        let extname = this.getType();

        let reg = new RegExp(`^${extname}$|\\W${extname}$|^${extname}\\W|\\W${extname}\\W`, 'i');
        return reg.test(exts);
    }

    static changeType(type, filepath) {
        let extname = path.extname(filepath).slice(1);
        return filepath.replace(new RegExp(extname + '$', 'i'), type);
    }
}

VFile.status = {
    READY: 'READY',
    DOING: 'DOING',
    DONE: 'DONE',
    WRITTEN: 'WRITTEN'
}

module.exports = VFile;
