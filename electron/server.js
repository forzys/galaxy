const path = require('path');
const http = require('http');
const fs = require('fs');
const os = require('os');

function fileServer(callback) {
	const server = http.createServer((req, res) => {
		const filePath = path.join(os.tmpdir(), decodeURIComponent(req.url));
		fs.stat(filePath, (err, stats) => {
			// 这个header用于支持断点续传
			res.setHeader('Accept-Ranges', 'bytes');
			res.setHeader('Content-Length', stats.size);
			// 返回一个流媒体
			fs.createReadStream(filePath).pipe(res);
		});
	});
	server.listen(7888, '127.0.0.1', () => {
		callback();
	});
}

export default fileServer;
