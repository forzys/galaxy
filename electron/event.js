const { ipcRenderer } = require('electron');
const Dexie = require('dexie');
const eventsMap = {};

const db = new Dexie('files_pierced_database');
db.version(1).stores({
	pierced: '++id,&remote, path, last, status, size',
});

const windowLoaded = new Promise((resolve) => {
	window.onload = resolve;
});

ipcRenderer.on('file-get-database', async (event, params) => {
	await windowLoaded;
	const [port] = event.ports;
	port.onmessage = (event) => {
		if (event?.data) {
			const { remote } = event?.data;
			if (remote === 0) {
				db.pierced.toArray().then((res) => {
					port.postMessage({ success: true, data: res });
				});
			} else {
				db.pierced
					.where(event?.data)
					.toArray()
					.then((res) => {
						port.postMessage({ success: true, data: res });
					})
					.catch((e) => {
						port.postMessage({ success: false, message: e });
					});
			}
		} else {
			port.postMessage({ success: false, message: null });
		}
	};
});

function registEvent(eventName, cb, params = {}) {
	const stamp = String(new Date().getTime());
	const opts = Object.assign({ eventName, stamp }, params);
	eventsMap[stamp] = cb; // 注册唯一函数
	ipcRenderer.send('regist-event', opts); // 发送事件
}

// 主进程通知渲染进程，触发事件回调
ipcRenderer.on('fire-event', (event, arg) => {
	// 通过 stamp 找到当前的回调
	const cb = eventsMap[arg.stamp];
	if (cb) {
		cb(arg.error || arg.payload);
		// 执行完成之后，注销stamp回调，stamp 代表是当前eventName的一次事件请求， 请求完成之后，就清除
		delete eventsMap[arg.stamp];
	}
});

module.exports = {
	// 原则是渲染进程能做的事情，就不要跟主进程进行通信了，否则需要借助主进程处理。
	// 手动关闭登录窗口（退出程序）
	onSetManualClose: (windowName = 'mainWindow') => {
		// 兼容一个参数的情况
		return new Promise((resolve) => {
			registEvent(
				'manual-close',
				() => {
					resolve(true);
				},
				{ windowName },
			);
		});
	},

	onSetWindowClose: (windowName = 'mainWindow') => {
		return new Promise((resolve) => {
			registEvent(
				'window-close',
				() => {
					resolve(true);
				},
				{ windowName },
			);
		});
	},
	// 打开登录窗口
	// openLoginWindow: () => {
	//     registEvent('open-login-window')
	// },
	onSetWindowMax: (windowName = 'mainWindow') => {
		return new Promise((resolve) => {
			registEvent(
				'window-max',
				() => {
					resolve(true);
				},
				{ windowName },
			);
		});
	},

	onSetWindowMin: (windowName = 'mainWindow') => {
		return new Promise((resolve) => {
			registEvent(
				'window-min',
				() => {
					resolve(true);
				},
				{ windowName },
			);
		});
	},
	onGetWindowMaximized: (windowName = 'mainWindow') => {
		return new Promise((resolve) => {
			registEvent(
				'get-window-maximized',
				() => {
					resolve(true);
				},
				{ windowName },
			);
		});
	},
	// 关闭主窗口，打开登录窗口, 多窗口操作时，直接定义具体操作的窗口即可
	// mainWindowClose: (cb = null) => {
	//     registEvent('main-window-close', cb, {mainWindow: 'mainWindow', loginWindow: 'loginWindow'})
	// },
	// // 关闭登录窗口，然后打开主窗口
	// loginWindowClose: (cb = null) => {
	//     registEvent('login-window-close', cb, {mainWindow: 'mainWindow', loginWindow: 'loginWindow'})
	// },
	// 新建一个窗口
	onWindowNewCreate: (windowName, browserWindowOpt, HashRoute) => {
		return new Promise((resolve) => {
			registEvent(
				'create-new-window',
				() => {
					resolve(true);
				},
				{ windowName, browserWindowOpt, HashRoute },
			);
		});
	},
	// 窗口路由跳转
	onWindowRouteChange: (params) => {
		return new Promise((resolve) => {
			registEvent(
				'window-route-change',
				() => {
					resolve(true);
				},
				params,
			);
		});
	},
	/**
	 * @description 实例之间互相通讯
	 * @params Object  ipcName 实例名称
	 * @return Function
	 */
	onWindowIpc: (params) => {
		return new Promise((resolve) => {
			registEvent(
				'window-ipc',
				() => {
					resolve(true);
				},
				params,
			);
		});
	},

	request: (url, params = {}) => {
		params.url = url;
		if (typeof url === 'object' && url.url) {
			Object.keys(url).forEach((n) => {
				params[n] = url[n];
			});
		}
		return new Promise((resolve) => {
			registEvent(
				'net-request',
				(data) => {
					console.log({ data });
					resolve(data);
				},
				params,
			);
		});
	},

	onGetFilesInfo: (params) => {
		return new Promise((resolve) => {
			registEvent(
				'get-files-info',
				(data) => {
					resolve(data);
				},
				params,
			);
		});
	},
};
