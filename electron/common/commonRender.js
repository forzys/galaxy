
 
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
			console.log('open',{params})
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
		get:(params)=>{ 
			return new Promise((resolve)=>{
				common.DataBase.open(params).then((table)=>{
					console.log(table) 
					table?.get(params.id).then(res=>{
						console.log(res)
						resolve(res)
					})
				})
			}).catch(e=>{ console.log(e) })
		},
		set:(params)=>{ 
			return new Promise((resolve)=>{
				common.DataBase.open(params).then((table)=>{
					// console.log(table) 
					table?.bulkPut(params.list).then(res=>{
						console.log(res)
						resolve(res)
					})

				})
			}).catch(e=>{ console.log(e) })
		},
		del:()=>{ },
	}
} 
module.exports = common