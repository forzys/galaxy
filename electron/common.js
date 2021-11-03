const { BrowserWindow, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { fileServer } = require('./server');
const querystring = require('querystring');
const windowMap = {};

const server = {};

function isPromise(obj) {
	return (
		!!obj &&
		(typeof obj === 'object' || typeof obj === 'function') &&
		typeof obj.then === 'function'
	);
}

const baseHost = '127.0.0.1';

const eventsList = {
	// 手动关闭登录窗口（退出程序）,仅仅用于登录窗口，原因为何： 历史原因
	'manual-close': (app, params) => {
		if (windowMap[params.windowName]) {
			windowMap[params.windowName].close();
			delete windowMap[params.windowName];
		}
		// 关闭登录窗口，直接退出应用
		if (process.platform !== 'darwin') {
			if (Object.keys(windowMap).length === 0) {
				app.quit();
			}
		}
	},
	'open-file-server': (app, params) => {
		const mainWindow = BrowserWindow.getFocusedWindow();
		return new Promise((resolve) => {
			if (params?.servered) {
				if (!server.fileServer) {
					server.fileServer = fileServer((query) => {
						return new Promise((resolve, reject) => {
							const { port1, port2 } = new MessageChannelMain();
							if (query) {
								port2.postMessage(query);
								port2.on('message', (event) => {
									resolve(event.data);
								});
								port2.start();
								mainWindow.webContents.postMessage(
									'file-get-database',
									query,
									[port1],
								);
							} else {
								resolve({ success: false });
							}
						}).catch(() => {});
					});
				}
				const port = params.port || 12345;
				const domain = params.domain || 'domain';
				server.fileServer.open({ port }).then((res) => {
					let child = require('child_process').execFile;
					let executablePath = path.join(__dirname, 'static/dd.exe');
					let incognito = '-subdomain=' + domain + ' ' + port;
					console.log({ incognito });
					server.piercedServer = child(
						executablePath,
						[incognito],
						function (err, data) {
							console.log(err);
							console.log(data.toString());
						},
					);
					resolve({ success: true });
				});
			} else {
				server.fileServer.close().then((res) => {
					if (res.success) {
						server.piercedServer.kill();
						console.log({ kill: server.piercedServer });
						resolve({ success: true });
					}
				});
			}
		});
	},
	'open-pierced': (app, params) => {
		let child = require('child_process').execFile;
		let executablePath = path.join(__dirname, 'static/dd.exe');
		let incognito = '-subdomain=' + subdomain + ' ' + port;
		let parameters = ['-subdomain=abcde 8080'];

		child(executablePath, parameters, function (err, data) {
			console.log(err);
			console.log(data.toString());
		});
	},
	// 关闭窗口
	'window-close': (app, params) => {
		// 获取操作的窗口
		if (windowMap[params.windowName]) {
			// 防止异步没有关闭，导致判断失误
			windowMap[params.windowName].close() &&
				delete windowMap[params.windowName];
		}
		// TODO 主窗口关闭，windows app一定要退出，否则没法再次打开，暂时未定位到原因，暂时这么处理， Mac 不影响
		if (process.platform !== 'darwin') {
			if (Object.keys(windowMap).length === 0) {
				app.quit();
			}
		}
	},
	// 最大化
	'window-max': (app, params) => {
		let xWindow = windowMap[params.windowName];
		if (!xWindow) {
			return;
		}
		if (xWindow.isMaximized()) {
			xWindow.restore();
		} else {
			xWindow.maximize();
		}
	},
	// 最小化
	'window-min': (app, params) => {
		let xWindow = windowMap[params.windowName];
		if (!xWindow) {
			return;
		}
		xWindow.minimize();
	},
	// 获取窗口是否最大化
	'get-window-maximized': (app, params) => {
		let xWindow = windowMap[params.windowName];
		if (!xWindow) {
			return;
		}
		return xWindow.isMaximized();
	},
	// 关闭主窗口，打开登录窗口
	'main-window-close': (app, params) => {
		let mainWindow = windowMap[params.mainWindow];
		let loginWindow = windowMap[params.loginWindow];
		mainWindow && mainWindow.close() && delete windowMap.mainWindow;
		// !loginWindow && createLoginWindow()
	},
	// 关闭登录窗口，然后打开新窗口
	'login-window-close': (app, params) => {
		let mainWindow = windowMap[params.mainWindow];
		let loginWindow = windowMap[params.loginWindow];
		loginWindow && loginWindow.close();
		// !mainWindow && createWindow()
	},
	'create-new-window': (app, params) => {
		if (
			windowMap[params.windowName] &&
			!windowMap[params.windowName].isDestroyed()
		) {
			windowMap[params.windowName].show();
			return;
		}
		let { windowName, browserWindowOpt, HashRoute = '' } = params;
		let xWindow = new BrowserWindow({
			...browserWindowOpt,
			webPreferences: {
				// 在页面运行其他脚本之前预先加载指定的脚本 无论页面是否集成Node, 此脚本都可以访问所有Node API 脚本路径为文件的绝对路径
				// preload: process.cwd() + '/src/utils/electron/bridge.js',
				preload: path.join(__dirname, 'preload.js'),
				nodeIntegration: true,
				contextIsolation: false,
				plugins: true,
			},
		});
		windowMap[windowName] = xWindow;
		// '#/login'
		// xWindow.loadURL(winURL + HashRoute)
		xWindow.loadURL('http://localhost:8000/' + HashRoute);
		xWindow.on('closed', () => {
			xWindow = null;
			delete windowMap[windowName];
			console.log('windowMap =====>', windowMap);
		});
	},
	// 窗口路由跳转
	'window-route-change': (app, params) => {
		let xWindow = windowMap[params.windowName];
		if (!xWindow) {
			return;
		}
		xWindow.webContents.send('changeRoute', params);
	},
	'window-ipc': (app, params) => {
		let xWindow = windowMap[params.windowName];
		if (!xWindow) {
			return;
		}
		xWindow.webContents.send(params.ipcName, params);
	},
	// 环境切换的时候，重新打开登录窗口
	'open-login-window': () => {
		console.log('---login');
	},
	'get-files-info': (app, params) => {
		//遍历读取文件
		function readFile(path, filesList) {
			let files = fs.readdirSync(path); //需要用到同步读取
			files.forEach((file) => {
				let states = fs.statSync(path + '/' + file);
				if (states.isDirectory()) {
					readFile(path + '/' + file, filesList);
				} else {
					filesList.push({ size: states.size });
				}
			});
		}

		return new Promise((resolve) => {
			const { files } = params;
			function geFileInfo(path) {
				let pathInfo = fs.statSync(path);
				const result = {};
				result.size = pathInfo.size;
				result.directory = pathInfo.isDirectory();

				if (result.directory) {
					let totalSize = 0;
					let filesList = [];
					readFile(path, filesList);
					for (let i = 0; i < filesList.length; i++) {
						let item = filesList[i];
						totalSize += item.size;
					}
					result.size = totalSize;
				}
				return result;
			}
			const result = files.map((i) => {
				const info = geFileInfo(i.path);
				return { ...i, ...info };
			});
			resolve(result);
		});
	},
	'net-request': (app, params) => {
		const {
			url,
			port = 80,
			data,
			hostname = baseHost,
			headers = {},
		} = params;
		const { method = 'get', protocol = 'http:' } = params;

		return new Promise((resolve) => {
			const result = {
				success: true,
				code: 200,
			};
			const request = net.request({
				method: method,
				protocol: protocol,
				hostname: hostname.replace(/^(http:\/\/|https:\/\/)/, ''),
				port: port,
				path: url,
				headers: headers,
			});
			if (String(method).toLowerCase() === 'post') {
				const postData = querystring.stringify(data);
				request.setHeader(
					'Content-Type',
					'application/x-www-form-urlencoded',
				);
				request.setHeader('Content-Length', postData.length);
				request.write(postData);
			}

			request.on('response', (response) => {
				result.code = response.statusCode;
				response.on('data', (data) => {
					try {
						result.data = JSON.parse(data);
					} catch (e) {
						result.success = false;
						result.message = 'json parse error';
					}
				});
				response.on('end', () => {
					resolve(result);
				});
			});
			request.on('error', (e) => {
				result.success = false;
				result.message = e.message;
				resolve(result);
			});
			request.end();
		});
	},
};

module.exports = {
	eventsList,
	isPromise,
};
