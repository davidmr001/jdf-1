"use strict";

const beautify = require('js-beautify');
const jdfUtils = require('jdf-utils');
const $ = jdfUtils.base;
const f = jdfUtils.file;
const logger = require('jdf-log');

/**
 * @init
 * @param {String} filename 文件名称
 */
exports.init = function(filename){
	if(!typeof(filename) !== 'undefined'){
		if(f.isDir(filename)){
			var filelist = f.getdirlist(filename, '(html|vm|tpl|css|scss|less|js)$');

			filelist.forEach(function(file){
				route(file);
			});

		}else{
			route(filename);
		}
	}

	function route(file){
		var exists = f.exists(file);

		if(exists){
			if($.is.html(file) || $.is.vm(file) || $.is.tpl(file)){
				htmlFormat(file);

			}else if($.is.css(file) || $.is.less(file) || $.is.sass(file)){
				cssFormat(file);

			}else if($.is.js(file)){
				jsFormat(file);

			}else{
				logger.warn('can not format the [' + file + '].\n');
			}
		}else{
			logger.error(file + ' may be not exist.');
		}
	}
}

function htmlFormat(filename){
	var content = f.read(filename);

	f.write(filename, beautify.html_beautify(content));
	logger.info('jdf format ['+filename+'] success');
}

function cssFormat(filename){
	var content = f.read(filename);

	f.write(filename, beautify.css_beautify(content));
	logger.info('jdf format ['+filename+'] success');
}

function jsFormat(filename){
	var content = f.read(filename);

	f.write(filename, beautify.js_beautify(content));
	logger.info('jdf format ['+filename+'] success');
}
