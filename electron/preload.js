 


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
        if(params?.name){
			let Events = common
			params.name.split('.').forEach(n=>{
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


ipcRenderer.on('main-handle-ipc', async (event, params) => { 
 
	console.log('-----,oooooooo',	Events.ewindows?.())
	// await new Promise((resolve) => {
	// 	window.onload = resolve;
	// }); 
	const [port] = event.ports;
	// console.log('-----,oooooooo')
	// port.onmessage = (event) => {
	// 	if (event?.data) { 
	// 		const { remote } = event?.data; 
	// 		if (remote === 0) {
	// 			db.pierced.toArray().then((res) => { 
	// 				port.postMessage({ success: true, data: res });
	// 			});
	// 		} else {
	// 			db.pierced
	// 				.where(event?.data)
	// 				.toArray()
	// 				.then((res) => {
	// 					port.postMessage({ success: true, data: res });
	// 				})
	// 				.catch((e) => {
	// 					port.postMessage({ success: false, message: e });
	// 				});
	// 		}
	// 	} else {
	// 		port.postMessage({ success: false, message: null });
	// 	}
	// };
})