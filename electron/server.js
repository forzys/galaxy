const path = require('path');
const http = require('http');
const fs = require('fs');
const os = require('os');

function fileServer(callback) {
	const server = http.createServer((req, res) => {
		const filePath = path.join(os.tmpdir(), decodeURIComponent(req.url));

		const url = decodeURIComponent(req.url);
		const remote = url.split('/').pop();

		callback({ remote }).then((res) => {
			console.log('res:', res);
		});

		fs.stat(filePath, (err, stats) => {
			if (!err) {
				// 这个header用于支持断点续传
				res.setHeader('Accept-Ranges', 'bytes');
				res.setHeader('Content-Length', stats.size);
				// 返回一个流媒体
				res.writeHead(200);
				fs.createReadStream(filePath).pipe(res);
			}

			if (err) {
				res.writeHead(404);
				res.end('404 Not Found');
			}
		});
	});

	server.listen(7888, '127.0.0.1', () => {
		callback();
	});
}

module.exports = {
	fileServer,
};
