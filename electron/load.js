 


window.electron = require('electron')
window.electronBridge = require('./event.js') 

const { ipcRenderer } = require('electron')
const common = require('./common/commonRender')
 
window.electronHandle = (params)=>{
    return new Promise((resolve)=>{
        resolve(ipcRenderer.invoke('render-handle-ipc', params))
    })
}
 
ipcRenderer.on('main-handle-ipc', (params) => { 
	return new Promise((resolve)=>{ 
        if(params?.handle){
			let Events = common
			params?.handle?.split('.').forEach(n=>{
				if(Events[n]){
					Events = Events[n]
				}
			})
            if(Events){
               	Events?.(params).then(result=>{ 
                    resolve({ success: true, result })
                })
            }else{
                resolve({ success: false, result:'not find name' })
            }
        }else{
			resolve({ success: false, result:'not find name' })
		} 
    }).catch(e=>{ console.log('-- se', e)})
})