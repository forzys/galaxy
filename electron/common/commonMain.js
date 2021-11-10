
const child = require('child_process') 
const querystring = require('querystring') 
const urls = require('url')
const iconv = require('iconv-lite');
const zlib = require('zlib')
const template = require('./template')
const { net, BrowserWindow,MessageChannelMain } = require('electron')

const common = {
    Events:{
        ewindows:()=> {
            const ewindows = BrowserWindow?.getAllWindows?.();
            return {
                ewindow: ewindows, 
				length:ewindows?.length,
            }
        },
		getFileInfo:(params)=>{ 
			return new Promise((resolve) => {
				const { files } = params;
				function readFile(path, filesList) {
					let files = fs.readdirSync(path); //需要用到同步读取
					files.forEach((file) => {
						let states = fs.statSync(path + '/' + file);
						if (states.isDirectory()) {
							readFile(path + '/' + file, filesList);
						} else {
							filesList.push({ size: states.size });
						}
					})
				}
				function geFileInfo(path) {
					let result = {}
					let pathInfo = fs.statSync(path);
					result.size = pathInfo.size;
					result.directory = pathInfo.isDirectory();
					if (result.directory) {
						let totalSize = 0;
						let filesList = [];
						readFile(path, filesList);
						for (let i = 0; i < filesList.length; i++) {
							let item = filesList[i];
							totalSize += item.size;
						} result.size = totalSize;
					} return result;
				}
				const result = files.map((i) => {
					const info = geFileInfo(i.path);
					return { ...i, ...info };
				});
				resolve({ success: true, result }) 
			});
		},
		setWallpaper:(params)=>{ 
			return new Promise((resolve)=>{
				let configPath = path.resolve(params?.path);
				let executPath = path.join(__dirname, '../static/wallpaper.exe');
				let cmdpath = [executPath,configPath].join(' ');
				common.RegEdit.cmd({ path: cmdpath, option:{ shell:'cmd.exe' }}).then((result)=>{
					resolve(result)
				})
			})
		},
		openServer:(params)=>{ 
			return new Promise((resolve)=>{
				let { domain='abc123', port = 12345 } = params; 
				common.Events.closeServer().then(()=>{
					Server.listen(port, ()=> {
						let executPath = path.join(__dirname, '../static/dd.exe');
						let configPath = path.join(__dirname, '../static/dd.cfg');
						let incognito1 = '-config=' + configPath 
						let incognito2 = '-subdomain=' + domain + ' ' + port;
						let cmdpath = [executPath,incognito1,incognito2].join(' ')
						common.RegEdit.cmd({ path:cmdpath, option:{ shell:'cmd.exe' }}).then((result)=>{
							resolve(result)
						})
					})
				}) 
			})
		},
		closeServer:(params)=>{ 
			return new Promise((resolve)=>{
				Server?.close(()=> { 
					common.RegEdit.kill({ name:['dd.exe'] }).then(result=>{ 
						resolve(result)
					}) 
				})
			})
		},
		getServer:()=>{
			return new Promise((resolve)=>{
				if(Server.listening){
					common.RegEdit.cmd({ path:'tasklist /fi "imagename eq dd.exe"' }).then(result=>{
						resolve(result)
					})
				}else{
					resolve({ success: false, result:'Server is closed'})
				}
			})
		},
    },
	RegEdit: {
		get:(params)=>new Promise((resolve)=>{
			let { path, name, option } = params
			child.exec(`REG QUERY ${path} /v ${name}`, { ...option },(error,stdout,stderr)=>{ 
				resolve({ success: true, result:{ stdout, stderr } })
				if(error != null){ 
					resolve({ success: false, result: error })
				}
			})
		}),
		set:(params)=>new Promise((resolve)=> {
			let { path, name, value, option } = params 
			let regs = `reg add ${path} /v ${name} /d ${value} /f && RunDll32.exe USER32.DLL,UpdatePerUserSystemParameters`
			child.exec(regs,{...option}, (error,stdout,stderr)=> {
				if(error != null){ 
					resolve({ success: false, result: error })
				}else{
					resolve({ success: true, result:{ stdout, stderr }})
				}
			})
		}),
		del:(params)=>new Promise((resolve)=>{
			let { path, value, option } = params 
			child.exec(`reg delete ${path} /v ${value} /f`, { ...option }, (error,stdout,stderr)=>{ 
				if(error != null){ 
					resolve({ success: false, result: error })
				}else{
					resolve({ success: true, result:{ stdout, stderr }})
				}
			})
		}),
		cmd:(params)=>new Promise((resolve)=>{
			let { path, option } = params  
			child.exec(path, { encoding: 'buffer', ...option }, (error,stdout,stderr)=> {
				if(error != null){ 
					resolve({ success: false, result: error })
				}else{
					resolve({ success: true, result:{stdout:iconv.decode(stdout,'cp936'), stderr:iconv.decode(stderr,'cp936')}})
				}
			})
			setTimeout(() => {
				resolve({ success: true, result:null })
			}, 1500);
		}),
		kill:(params)=>new Promise((resolve)=>{
			let { pid = [], name =[] , option} = params
			let killStr = 'taskkill '
			if(pid.length){
				killStr+= pid?.map(i=> `/pid ${i}`).join(' ') + ' /f'
			} 
			if(name.length){
				killStr+=name?.map(i=> `/im ${i}`).join(' ') + ' /f'
			}
			child.exec(killStr, { ...option }, (error,stdout,stderr)=>{
				if(error != null){ 
					resolve({ success: false, result: error })
				}else{
					resolve({ success: true, result:{ stdout, stderr } })
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
	if(remote === ''){
		res.writeHead(301, {'Location': `/index.html`});
		res.end();
	}

	if (remote === 'index.html') {  
		common.Callback({ handle:'DataBase.select', table:'pierced', page:1, pageSize: 100 }).then((result)=>{
			if (result?.success) {
				res.writeHead(200, {'Content-Type': 'text/html' }) 
				res.end(template?.piercedIndex(result.data)); 
			} else {
				res.writeHead(404);
				res.end('404 Not Found');
			}
		})

		setTimeout(()=>{
			res.writeHead(200, { 'Content-Type': 'text/html' })
			res.end('Timeout ! ');
		},7000)
	}

	if(remote?.length === 8){
		common.Callback({ handle:'DataBase.get', table:'pierced', get:{ remote } }).then((result)=>{
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
							res.end('404 File Not Found');
						}
					})
				}
			}else{
				res.writeHead(404);
				res.end('!404 Not Found')
			}
		})
	}
})
 
function Requests(params){ 
	return new Promise((resolve) => { 
		let { url, data, port = 80, type='json' } = params;
		let { headers={}, hostname='127.0.0.1' } = params;
		let { method ='get', protocol = 'http:' } = params;
		let parseUrl = urls.parse(url) 
		if(parseUrl.hostname || parseUrl.protocol){ 
			port = parseUrl.port || port
			hostname = parseUrl.hostname || hostname
			url = parseUrl.path || url
		}
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
			result._data = []
			response.on('data', (data) => { 
				result._data.push(data) 
			})
			response.on('end', () => {
				let buffer = Buffer.concat(result._data)
				let encoding = response.headers["content-encoding"]
				let zlibs = {
					gzip:()=>{
						zlib.gunzip(buffer, (err, decoded) => { 
							if(!err){
								result.data = decoded.toString()
							}else{ 
								result.success = false;
								result.message = err; 
							} 
						})
					},
					deflate:()=>{
						zlib.inflate(buffer, (err, decoded) =>{ 
							if(!err){
								result.data = decoded.toString()
							}else{ 
								result.success = false;
								result.message = err; 
							}
						})
					}
				} 

				if(zlibs[encoding]){
					zlibs?.[encoding]?.()
				}else{
					result.data = buffer.toString()
				}

				try{
					delete result._data
					if(type === 'json'){
						result.data = JSON.parse(result.data)
					} 
				}catch(e){
					result.success = false;
					result.message = 'json parse error';
				}  
				resolve(result)
			});
		})
		request.end()
	})
}