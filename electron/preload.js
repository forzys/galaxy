

window.electron = require('electron')
window.electronBridge = require('./event.js') 

window.electronHandle = (params)=>{ 
    let ipcRenderer = window?.electron?.ipcRenderer
    if(!ipcRenderer) ipcRenderer = require('electron')?.ipcRenderer
    // ipcRenderer.invoke('render-handle-ipc', params)
    return  111
    return new Promise((resolve)=>{
        resolve(ipcRenderer.invoke('render-handle-ipc', params))
    })
}