 



const { app, protocol, ipcMain, BrowserWindow, } = require('electron')

const { common } = require('./common.ts');
const urls = require('url');
const path = require('path'); 

// win.loadURL('https://github.com')

let win

const onWindowsMain = ()=>{
    const webPreferences = {
        webSecurity: false,
        nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js'),
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
}


protocol.interceptFileProtocol('file',(req, cb)=>{
    return cb(decodeURI(req?.url?.substr(8)))
},e=>{
    console.log('Error: protocol---->'+ e)
})


app.on('ready', () => {
    onWindowsMain()


    app.on('activate', ()=>{
        common.ewindows().length === 0 && onWindowsMain()
    })
})



app.on('window-all-closed', () => {
    process.platform !== 'darwin' && app.quit()
})


ipcMain.handle('render-handle-ipc', (event, params) => { 
    return new Promise((resolve)=>{
        console.log('success in : render-handle-ipc')
        if(params?.handle){
            if(common.Events[params?.handle]){
                common.Events[params?.handle]?.(params)?.then(result=>{
                    resolve({ success: true, result })
                })
            }else{
                resolve({ success: false, result:'not find handle' })
            }
        }
        resolve({ success: false, result:'not find handle' })
    })
})
  
//   // 渲染进程
//   async () => {
//     const result = await ipcRenderer.invoke('my-invokable-ipc', arg1, arg2)
//     // ...
//   }