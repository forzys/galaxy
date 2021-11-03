const path = require('path');
const http = require('http');
const fs = require('fs');
const archiver = require('archiver');

const template = (list) => { 
	return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Document</title>
			<style>
				ul,li{
					list-style:none;
				}
				li{
					display:flex;
					align-items:center;
					padding:10px 0;
				}
				.app{
					width:60vw;
					height:80vh;
					box-shadow:0 0.5em 1em rgba(0,0,0,0.45);
					margin:8vh auto;
					text-align:center;
					overflow:auto;
				}
				li>div{
					margin:10px;
				}
				::-webkit-scrollbar {
					width: 0;
					height: 0;
					opacity: 0;
					display: none;
					visibility: hidden;
					background: transparent;
				}
			</style>
		</head>
		<body>
			<div class='app'>
				<h1>当前 0-100条映射数据 </h1>
				<ul>
				${list
					.map((i) => {
						return `
							<li key=${i.remote}>
								<div>${i.name} :</div>
								<div>${i.path}</div>
								<div><a href='/${i.remote}'>${i.remote}</a></div>
							</li>
						`;
					})
					.join('')}
				</ul>
			</div>
		</body>
	</html>`;
};

function fileServer(cb) {
	let server;
	let callback = cb;
	// const server = http.createServer((req, res) => {
	// 	const url = decodeURIComponent(req.url);
	// 	const remote = url.split('/').pop();

	// 	if (remote === 'index.html') {
	// 		callback({ remote: 0 }).then((result) => {
	// 			if (result.success) {
	// 				res.writeHead(200, { 'Content-Type': 'text/html' });
	// 				res.end(template(result.data));
	// 			} else {
	// 				res.writeHead(404);
	// 				res.end('404 Not Found');
	// 			}
	// 		});
	// 	}

	// 	callback({ remote }).then((result) => {
	// 		// console.log('res:', res);
	// 		if (result.success) {
	// 			const file = result.data[0];
	// 			if (file.directory) {
	// 				let archive = archiver('zip', {
	// 					zlib: { level: 9 }, // 设置压缩级别
	// 				});
	// 				archive.directory(path.resolve(file.path), false);
	// 				res.writeHead(200);
	// 				archive.pipe(res);
	// 				archive.finalize();
	// 			} else {
	// 				fs.stat(file.path, (err, stats) => {
	// 					if (!err) {
	// 						// 这个header用于支持断点续传
	// 						res.setHeader('Accept-Ranges', 'bytes');
	// 						res.setHeader('Content-Length', stats.size);
	// 						if (file.path.includes('.mp4')) {
	// 							res.writeHead(200, {
	// 								'Content-Type': 'video/mp4',
	// 							});
	// 						} else {
	// 							res.writeHead(200);
	// 						}
	// 						// 返回一个流媒体
	// 						fs.createReadStream(file.path).pipe(res);
	// 					}
	// 					if (err) {
	// 						res.writeHead(404);
	// 						res.end('404 Not Found');
	// 					}
	// 				});
	// 			}
	// 		}
	// 	});
	// }).listen(7888, '127.0.0.1', () => {
	// 	// callback();
	// });

	// server.shutdown(function() {
	// 	console.log('Everything is cleanly shutdown.');
	//   });
	return {
		open: ({ port }) => {
			return new Promise((resolve) => {
				server = http
					.createServer((req, res) => {
						const url = decodeURIComponent(req.url);
						const remote = url.split('/').pop();

						if (!callback) {
							res.writeHead(200);
							res.end('Server Error');
						} 

						if(remote === ''){ 
							res.writeHead(301, {'Location': `http://${req.headers.host}/index.html`});
							res.end();
						}

						if (remote === 'index.html') {
							callback({ remote: 0 }).then((result) => {
								if (result?.success) {
									res.writeHead(200, {
										'Content-Type': 'text/html',
									});
									res.end(template(result.data));
								} else {
									res.writeHead(404);
									res.end('404 Not Found');
								}
							});
						}

						callback({ remote }).then((result) => {
							if (result.success) {
								const file = result.data[0];
								if (file.directory) {
									let archive = archiver('zip', {
										zlib: { level: 9 }, // 设置压缩级别
									});
									archive.directory(
										path.resolve(file.path),
										false,
									);
									res.writeHead(200);
									archive.pipe(res);
									archive.finalize();
								} else {
									fs.stat(file.path, (err, stats) => {
										if (!err) {
											// 这个header用于支持断点续传
											res.setHeader(
												'Accept-Ranges',
												'bytes',
											);
											res.setHeader(
												'Content-Length',
												stats.size,
											);
											if (file.path.includes('.mp4')) {
												res.writeHead(200, {
													'Content-Type': 'video/mp4',
												});
											} else {
												res.writeHead(200);
											}
											// 返回一个流媒体
											fs.createReadStream(file.path).pipe(
												res,
											);
										}
										if (err) {
											res.writeHead(404);
											res.end('404 Not Found');
										}
									});
								}
							}
						});
					})
					.listen(port || 12345, '127.0.0.1', () => {
						resolve(server);
						server.on('clientError', (err, socket) => {
							if (err.code === 'ECONNRESET' || !socket.writable) {
								return;
							}
							socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
						});
					});
			});
		},
		close: () => {
			return new Promise((resolve) => {
				if (server) {
					server?.close(function () {
						console.log('Everything is cleanly shutdown.');
						server = null;
						resolve({ success: true });
					});
				} else {
					resolve({ success: true });
				}
			});
		},
		isOpen: () => !!server,
	};
}

module.exports = {
	fileServer,
};
