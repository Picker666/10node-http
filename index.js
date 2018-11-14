/*
* @Author: Administrator
* @Date:   2018-11-09 10:42:36
* @Last Modified by:   Administrator
* @Last Modified time: 2018-11-09 15:51:07
*/

'use strict';

var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');

var root = path.resolve(process.argv[2] || '.');

var server = http.createServer(function (request, response) {
	var pathName = url.parse(request.url).pathname;

	if (pathName !== '/favicon.ico') {
		var filePath = path.join(root, pathName || '');
		console.log(filePath, '====', request.url, '======', pathName);

		function getDefaultPage() {
			var page = path.join(root, 'default.html');
			fs.stat(page, function(err, stats) {
				if (err || !stats.isFile()) {
					getNotFindPage();
				} else {
					response.writeHead(200);
					fs.createReadStream('default.html').pipe(response);
				}
			})
		}

		function getNotFindPage () {
			console.log('404' + request.url);
			response.writeHead(404);
			fs.createReadStream('notFind.html').pipe(response);
		}

		function getSuccessPage (fileP) {
			console.log('200', '-----------', fileP);
			response.writeHead(200);
			var readable = fs.createReadStream(fileP || 'index.html');
			readable.pipe(response);
			readable.on('error', function(err) {
				console.log('it occours error, and return default page to B/E');
				getDefaultPage();
			});
		}

		function readDir (readFilePath) {
			fs.readdir(readFilePath, function(err, files) {
				if(err) {
					getNotFindPage();
				} else {
					files.forEach(file => {
						var itemFilePath = path.resolve(readFilePath, file);
						console.log(file, '------------');
						fs.stat(itemFilePath, function (err, stats) {
							if (stats.isFile()) {
								getSuccessPage(itemFilePath);
							} else if (stats.isDirectory()) {
								console.log('stats.isDirectory...')
								readDir(itemFilePath);
								// 递归返回有问题。。。
							} else {
								getDefaultPage();
							}
						})
					})
				}
			})
		}

		fs.stat(filePath, function(err, stats) {
			if (err) {
				// 异常处理
				console.log('main line err----');
				getNotFindPage();
			} else if (stats.isFile()) {
				// 读取文件
				getSuccessPage(filePath);
			} else if (stats.isDirectory()) {
				// 文件夹
				console.log('this is directory....')
				readDir(filePath);
			}else {
				// 不报错的异常处理
				console.log('main line defaultPages');
				getDefaultPage();
			};
		});
	}

});

server.listen(8888);

console.log('sever running ...');
