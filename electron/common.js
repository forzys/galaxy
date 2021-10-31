const { BrowserWindow, net } = require('electron');
const path = require('path');
const zlib = require('zlib');
const querystring = require('querystring');
const windowMap = {};

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
		// createLoginWindow()
		console.log('---login');
	},
	'is-file-directory': (app, params) => {},
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
