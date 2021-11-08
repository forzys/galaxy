
 
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
		open:(table)=>{
			console.log('open',{params})
			return new Promise((resolve)=>{ 
				// 打开已经存在的数据库
				new Dexie('Galaxy').open().then((db)=> {
					console.log({db})
					// console.log ("Found database: " + db.name);
					// console.log ("Database version: " + db.verno);
					// db.tables.forEach(function (table) {
					// 	console.log ("Found table: " + table.name);
					// 	console.log ("Table Schema: " +
					// 		JSON.stringify(table.schema, null, 4));
					// }) 
					resolve(db.table(table))
					// const table = db.table(table)
					// resolve(table)
					// resolve({success: false, data:''})
					// if(db.tables(name)){
					// 	resolve(db.table(name))
					// }
					 
				}).catch('NoSuchDatabaseError', function(e) {
					// Database with that name did not exist
					console.error ("Database not found");
				}).catch(function (e) {
					console.error ("Oh uh: " + e);
				})
			}) 
		},
		get:(params)=>{ 
			return new Promise(()=>{
				renderCommon.DataBase.open( params?.table || 'test').then((table)=>{
					console.log(table)

					table.get(params.remote).then(res=>{
						resolve(res)
					}) 
				})
			}).catch(e=>{ console.log(e) })
		},
		set:()=>{ },
		del:()=>{ },
	}
} 
module.exports = common