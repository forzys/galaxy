 



const { app, protocol, ipcMain, BrowserWindow } = require('electron')

const urls = require('url');
const path = require('path'); 
const common = require('./common/commonMain')

let win


const onWindowsMain = ()=>{
    const webPreferences = {
        webSecurity: false,
        nodeIntegration: true,
        preload: path.join(__dirname, 'load.js'),
    }
    win = new BrowserWindow({
		frame: true,
        darkTheme: true,
        webPreferences,
		width: 1200,
		height: 900,
		minWidth: 560,
		minHeight: 800,
        title: 'Galaxy',
		backgroundColor: '#2e2c29',
	})

    if (process.env.NODE_ENV === 'development') { 
		win.loadURL('http://localhost:8000/')
		win.webContents.openDevTools()
	} else { 
		win.loadURL(
			urls.format({
				slashes: true,
				protocol: 'file:', 
                pathname: path.join(__dirname, './dist/index.html'),
			}),
		);
	}

    protocol.interceptFileProtocol('file',(req, cb)=>{
        return cb(decodeURI(req?.url?.substr(8)))
    },e=>{
        console.log('Error: protocol---->'+ e)
    })

	win.on('closed',()=> win = null)
}
 

// 单例窗口 
if (!app.requestSingleInstanceLock()) { app.quit() }






app.on('second-instance', (event, command, working) => { 
    if (win) {
      if (win.isMinimized()) 
      win.restore();
      win.show()
      win.focus() 
    }
})



app.on('window-all-closed', () => {
    process.platform !== 'darwin' && app.quit()
})

app.on('ready', () => {
    onWindowsMain()
    app.on('activate', ()=>{
        common?.Events?.ewindows().length === 0 && onWindowsMain()
    })
})

ipcMain.handle('render-handle-ipc', (event, params) => { 
    return new Promise((resolve)=>{ 
        if(params?.handle){
			let Events = common
			params.handle.split('.').forEach(n=>{
				if(Events[n]){
					Events = Events[n]
				}
			}) 
            if(Events){
				Events?.(params).then(result=> { 
					resolve(result)
				})
            }else{
                resolve({ success: false, result:'not find name' })
            }
        }else{
			resolve({ success: false, result:'not find name' })
		} 
    }).catch(e=>{ console.log('-- se', e)})
})
 