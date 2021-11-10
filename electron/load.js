 


window.electron = require('electron')
window.electronBridge = require('./event.js') 

const { ipcRenderer } = require('electron')
const common = require('./common/commonRender')
 
window.commonRender = common

window.electronHandle = (params)=>{
    return new Promise((resolve)=>{
        resolve(ipcRenderer.invoke('render-handle-ipc', params))
    })
}
// ipcRenderer.on('file-get-database', async (event, params) => {
// 	await windowLoaded;
// 	const [port] = event.ports;
// 	port.onmessage = (event) => {
		// if (event?.data) { 
		// 	const { remote } = event?.data; 
		// 	if (remote === 0) {
		// 		db.pierced.toArray().then((res) => { 
		// 			port.postMessage({ success: true, data: res });
		// 		});
		// 	} else {
		// 		db.pierced
		// 			.where(event?.data)
		// 			.toArray()
		// 			.then((res) => {
		// 				port.postMessage({ success: true, data: res });
		// 			})
		// 			.catch((e) => {
		// 				port.postMessage({ success: false, message: e });
		// 			});
		// 	}
		// } else {
		// 	port.postMessage({ success: false, message: null });
		// }
// 	};
// });


ipcRenderer.on('main-handle-ipc', (_event,_sender) => { 
    let params = _event 
    let port = null
    if(_event.sender && _event.ports){
        params = _sender
        port = _event.ports[0]
    }

    const callback = (params)=>{ 
        return new Promise((resolve)=>{
            if(params?.handle){
                let Events = common
                params?.handle?.split('.').forEach(n=>Events[n] && (Events = Events[n] ))
                if(Events){ 
                    Events?.(params).then(result=> resolve(result))
                }else{
                    resolve({ success: false, result:'not find name' })
                }
            }else{
                resolve({ success: false, result:'not find name' })
            } 
        }).catch(e=>{ console.log('-- se', e)}) 
    }

    if(port){
        port.onmessage = (event) => {
            if (event?.data) {
                params = event?.data;
                callback(event?.data).then((result)=>{
                    console.log({ result })
                    port.postMessage(result);
                })
            } else {
                port.postMessage({ success: false, message: null });
            }
        }
    }else {
        return new Promise((resolve)=>{  
            callback(params).then((result)=>{
                resolve(result);
            })
        }).catch(e=>{ console.log('-- se', e)})
    } 
})