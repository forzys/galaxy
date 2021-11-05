// 引入electron并创建一个Browserwindow
const {
	app,
	ipcMain,
	protocol,
	BrowserWindow,
	// MessageChannelMain,
} = require('electron');
const { eventsList, isPromise } = require('./common');
const path = require('path');
const url = require('url');

function createWindow() {
	//创建窗口
	let mainWindow = new BrowserWindow({
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			webSecurity: false,
			nodeIntegration: true,
		},
		backgroundColor: '#2e2c29',
		title: 'Galaxy',
		darkTheme: true,
		frame: true,
		width: 1200,
		height: 900,
		minWidth: 560,
		minHeight: 800,
	});

	if (process.env.NODE_ENV === 'development') {
		// 开发环境 加载页面并打开调试工具,根据 NODE_ENV 
		mainWindow.loadURL('http://localhost:8000/');
		mainWindow.webContents.openDevTools();
	} else {
		// 生产环境 加载html文件 这里的路径是umi输出的html路径
		mainWindow.loadURL(
			url.format({
				pathname: path.join(__dirname, './dist/index.html'),
				protocol: 'file:',
				slashes: true,
			}),
		);
	}

	//===========自定义file:///协议的解析=======================
	protocol.interceptFileProtocol(
		'file',
		(req, callback) => {
			const url = req.url.substr(8);
			callback(decodeURI(url));
		},
		(error) => {
			if (error) {
				console.error('Failed to register protocol');
			}
		},
	);

	mainWindow.on('closed', function () {
		mainWindow = null;
	});
}

app.on('ready', () => {
	createWindow();
	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// 渲染进程调用主进程注册的事件，主进程处理完毕之后，通过主进程向渲染进程发送结果
// 统一采用异步通信方式 监听一个异步事件，处理所有的渲染进程触发的事件，请求主进程处理
ipcMain.on('regist-event', (event, params) => {
	// 处理异步操作
	const nativeEvent = eventsList[params.eventName];
	if (nativeEvent) {
		const result = nativeEvent(app, params);
		// 异步通信，结果处理完，主进程向渲染进程发送消息
		if (isPromise(result)) {
			result
				.then((res) => {
					event.sender.send('fire-event', {
						stamp: params.stamp,
						payload: res,
					});
				})
				.catch((err) => {
					event.sender.send('fire-event', {
						stamp: params.stamp,
						error: err,
					});
				});
		} else {
			event.sender.send('fire-event', {
				stamp: params.stamp,
				payload: result,
			});
		}
	} else {
		event.sender.send('fire-event', {
			stamp: params.stamp,
			error: new Error('event not support'),
		});
	}
});
