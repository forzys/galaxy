

window.electron = require('electron')
window.electronBridge = require('./event.js') 

window.electronHandle = (params)=>{
    let ipcRenderer = window?.electron?.ipcRenderer
    if(!ipcRenderer) ipcRenderer = require('electron')?.ipcRenderer
    return ipcRenderer.invoke('render-handle-ipc', params)
}