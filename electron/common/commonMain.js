
const child = require('child_process') 
const querystring = require('querystring') 
const { net, BrowserWindow,MessageChannelMain } = require('electron')

const common = {
    Events:{
        ewindows:()=>{
            const ewindows = BrowserWindow?.getAllWindows?.();
            return {
                length:ewindows?.length,
                ewindow: ewindows, 
            }
        },
		test: (params)=>{
			return new Promise((resolve)=>{ 
				common.Callback({ name: 'DataBase.open', a:0 }).then(res=>{
					console.log('---来自渲染进程的数据:',res)
					resolve('GOOD',)
				})
				setTimeout(()=>{  
					resolve('GOOD')
				},3000)
			}).catch(e=>{ console.log({ e })})
		},
		openServer:(params)=>{ 
			return new Promise((resolve)=>{
				let { domain='zys123', port = 12345 } = params
				Server.listen(port,()=>{ 
					let executPath = path.join(__dirname, '../static/dd.exe');
					let configPath = path.join(__dirname, '../static/dd.cfg');
					let incognito1 = '-config=' + configPath 
					let incognito2 = '-subdomain=' + domain + ' ' + port
					let cmdpath = [executPath,incognito1,incognito2].join(' ')
					common.RegEdit.cmd({ path:cmdpath, option:{ shell:'cmd.exe' }})
					resolve({ scuess: true })
				})
			})
		},
		closeServer:()=>{ 
			return new Promise((resolve)=>{
				Server?.close(function () {
					// console.log('Everything is cleanly shutdown.'); 
					common.RegEdit.kill({ name:['dd.exe']  })
					resolve({ success: true })
				})
			})
		}
    },
	RegEdit: {
		get:(params) => new Promise((resolve)=>{
			const { path, name, option } = params
			child.exec(`REG QUERY ${path} /v ${name}`, { ...option },(error,stdout,stderr)=>{ 
					resolve({ success: true, result:{ stdout, stderr } })
				  if(error != null){ 
					resolve({ success: false, result: error })
				  }
			  })
		}),
		set:(params) => new Promise((resolve)=> {
			const { path, name, value, option } = params 
			let regs = `reg add ${path} /v ${name} /d ${value} /f && RunDll32.exe USER32.DLL,UpdatePerUserSystemParameters`
			child.exec(regs,{...option}, (error,stdout,stderr)=>{ 
				resolve({ success: true, result:{ stdout, stderr } })
				if(error != null){ 
					resolve({ success: false, result: error })
				}
			}) 
		}),
		del:(params)=>new Promise((resolve)=>{
			const { path, value, option } = params 
			child.exec(`reg delete ${path} /v ${value} /f`, {...option},(error,stdout,stderr)=>{ 
				resolve({ success: true, result:{ stdout, stderr } })
				if(error != null){ 
					resolve({ success: false, result: error })
				}
			})
		}),
		cmd:(params)=>new Promise((resolve)=>{
			const { path, option } = params 
			console.log('path:',path)
			child.exec(path, {...option }, (error,stdout,stderr)=>{ 
				resolve({ success: true, result:{ stdout, stderr } })
				if(error != null){ 
					resolve({ success: false, result: error })
				}
			})
		}),
		kill:(params)=>new Promise((resolve)=>{
			const { pid = [], name =[] , option} = params
			let killStr = 'taskkill '
			if(pid.length){
				killStr+=pid?.map(i=> `/pid ${i}`).join(' ') + ' /f'
			} 
			if(name.length){
				killStr+=name?.map(i=> `/im ${i}`).join(' ') + ' /f'
			}
			child.exec(killStr,  { ...option }, (error,stdout,stderr)=>{ 
				resolve({ success: true, result:{ stdout, stderr } })
				if(error != null){ 
					resolve({ success: false, result: error })
				}
			})
		}),
	},
	Callback : (query) => {
		let win = BrowserWindow.getAllWindows()
		let content = win?.[0]?.webContents
		return new Promise((resolve) => {
			const { port1, port2 } = new MessageChannelMain()
			if (query) {
				port2.postMessage(query) 
				port2.on('message', (event) => resolve(event.data))
				port2.start()
				content?.postMessage('main-handle-ipc',query, [port1]); 
			} else {
				resolve({ success: false })
			}
		}).catch((e) => {console.log({e})});
	},
	request: Requests
} 

module.exports = common
 
const path = require('path');
const http = require('http');
const fs = require('fs');

var Server = http.createServer((req,res)=>{
	const url = decodeURIComponent(req.url);
	const remote = url.split('/').pop()

	console.log(remote)

	if(remote === ''){ 
		res.writeHead(301, {'Location': `/index.html`});
		res.end();
	}

	if (remote === 'index.html') {
		common.Callback({ name:'DataBase.get', data:{
			table:'pierced',
			remote:null,
		}}).then((result)=>{
			if (result?.success) {
				res.writeHead(200, { 'Content-Type': 'text/html' })
				// res.end(template(result.data));
				res.end('Success !');
			} else {
				res.writeHead(404);
				res.end('404 Not Found');
			}
		})
		setTimeout(()=>{
			res.writeHead(200, { 'Content-Type': 'text/html' })
				// res.end(template(result.data));
			res.end('Success !');
		},3000)
	}
	common.Callback({ name:'DataBase.get', data:{
		table:'pierced',
		remote:remote,
	}}).then((result)=>{
		console.log({ result })
		if (result?.success && result?.data) {
			const file = result.data 
			if (file?.directory) {
				// let archive = archiver('zip', {
				// 	zlib: { level: 9 }, // 设置压缩级别
				// });
				// archive.directory(path.resolve(file.path), false);
				// res.writeHead(200);
				// archive.pipe(res);
				// archive.finalize();
			} else {
				fs.stat(file.path, (err, stats) => {
					if (!err) {
						// 这个header用于支持断点续传
						res.setHeader('Accept-Ranges', 'bytes');
						res.setHeader('Content-Length', stats.size);
						res.writeHead(200);
						if (file.path.includes('.mp4')) {
							res.writeHead(200, { 'Content-Type': 'video/mp4' });
						}
						fs.createReadStream(file.path).pipe(res);
					}
					if (err) {
						res.writeHead(404);
						res.end('404 Not Found');
					}
				});
			}
		}else{
			res.writeHead(404);
			res.end('404 Not Found');
		}
	})
})
 
var Requests = (params) => {
	const { url, data, port = 80 } = params;
	const { headers={}, hostname='127.0.0.1' } = params;
	const { method ='get', protocol = 'http:' } = params;

	return new Promise((resolve) => {
		const result = {
			data:undefined,
			message:undefined,
			code: 200,
			success: true
		}

		const request = net.request({
			path: url,
			port: port,
			method: method,
			protocol: protocol,
			headers: headers,
			hostname: hostname.replace(/^(http:\/\/|https:\/\/)/, ''),
		})

		if (String(method).toLowerCase() === 'post') {
			const postData = querystring.stringify(data);
			request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
			request.setHeader('Content-Length', postData.length)
			request.write(postData)
		}

		request.on('error', (e) => {
			result.success = false;
			result.message = e.message;
			resolve(result)
		})

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
			response.on('end', () => resolve(result));
		}) 
		request.end()
	});
}
