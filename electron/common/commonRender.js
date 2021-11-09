
 
const { Callback } = require('./commonMain')
const Dexie = require('dexie') 
 
let common ={
    Events:{
		test: (params)=>{
			return new Promise((resolve)=>{ 
				Callback({ name: 'test', a:0 }).then(res=>{
					console.log('---来自渲染进程的数据:',res)
					resolve('GOOD',)
				})
				setTimeout(()=>{  
					resolve('GOOD')
				},3000)
			}).catch(e=>{ console.log({ e })})
		}
    },
	DataBase:{
		open:(params)=>{ 
			return new Promise((resolve)=>{ 
				const db = new Dexie('Galaxy');
				db.version(params?.version || 0.1).stores({
					user:'++id, options',
					pierced: '++id,path,size,last,name,status,remote',
					...params.stores,
				});
				resolve(db.table(params?.table)) 	 
			})
		},
		upgrade:(params)=>{
			return new Promise((resolve)=>{ 
				const db = new Dexie('Galaxy');
				db.version(version).stores({
					user:'++id, options',
					pierced: '++id,path,size,last,name,status,remote',
					...params.stores,
				}).upgrade(async tables=>{
					const result = await resolve(tables)
					return  result
				})
			}).catch(e=> resolve({ success:false, message:e }) )
		},
		get:(params)=>{ 
			return new Promise((resolve)=>{
				common.DataBase.open(params).then((table)=>{
					if(params?.get){
						table?.get(params?.get).then(res=>{
							resolve({
								success: true,
								data: res,
							})
						})
					}else{
						table?.toArray().then(res=>{
							resolve({
								success: true,
								data: res,
							})
						}) 
					}
				})
			}).catch(e=> resolve({ success:false, message:e }) )
		},
		select:(params)=>{
			return new Promise((resolve)=>{
				const { page = 0, pageSize= 10 } = params
				common.DataBase.open(params).then(async (table)=>{
					let select = params?.select?table?.where(params?.select):table;
					let total = await select.count() 
					select.offset(page).limit(pageSize).toArray().then(res=>{ 
						resolve({
							success:true,
							data: res,
							info:{ page, total, pageSize },
						})
					})
				})
			}).catch(e=> resolve({ success:false, message:e }) )
		},
		set:(params)=>{ 
			return new Promise((resolve)=>{
				common.DataBase.open(params).then((table)=>{ 
					if(Array.isArray(params.set)){
						table?.bulkPut(params.set).then(res=>{ 
							resolve({
								success:true,
								data: res,
							}) 
						})
					}else{
						console.log({ p: table?.put })
						table?.put(params.set).then(res=>{
							resolve({
								success:true,
								data: res,
							})
						})
					} 
				})
			}).catch(e=> resolve({ success:false, message:e }) )
		},
		del:()=>{ },
	}
} 
module.exports = common