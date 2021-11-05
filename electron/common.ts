



const child = require('child_process')

const { BrowserWindow } = require('electron')
  

const regEdit = {
    get:(params) => new Promise((resolve)=>{
        const { path, name, option } = params
        child.exec(`REG QUERY ${path} /v ${name}`, { ...option },(error,stdout,stderr)=>{ 
                resolve({ success: true, result:{ stdout, stderr } })
              if(error != null){ 
                resolve({ success: false, result: error })
              }
          })
    }),
    set:(params) => new Promise((resolve)=>{
        const { path, name, value, option } = params
        child.exec(`reg add ${path} /v ${name} /t REG_SZ /d ${value} /f`,{...option}, (error,stdout,stderr)=>{ 
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
} 

let common = {
    Events:{
        ewindows:()=>{
            const ewindows = BrowserWindow.getAllWindows();
            return {
                length:ewindows.length,
                ewindow: ewindows, 
            }
        }
    }
    
}

module.exports = {
	common,
	regEdit,
};
