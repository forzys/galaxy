import React, { useEffect } from 'react';
import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Menu } from 'antd';
import { Link } from 'umi';
import Dexie from 'dexie';
import { useUpdate } from '@/common/common'; 

const waitTime = (time: number = 100) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(true);
		}, time);
	});
};

export default React.memo((props: any) => {
	const [state, setState, { uuid, common }] = useUpdate({});


	useEffect(()=>{ 
		common.DataBase.get({ table:'user' }).then((res:any)=>{ 
			if(res.success){
				if(!res.data.length){
					const uid = uuid()
					const user = {
						id: uid,
						options:{
							remote:uid.slice(0,6),
							port: 12345,
						}
					} 
					common.DataBase.set({ table:'user', set: user }).then((ress:any)=>{
						// console.log({ ress })
					})
				}
			}
		})
	},[])


	

	// const db = new Dexie('files_pierced_database');
	// db.version(1).stores({
	// 	pierced: '++id, path, remote, last'
	// })
	// state.db = db

	// const a = state.db.pierced.where('remote').equals('00000')

	// console.log('hello',a)

	// electron.ipcRenderer.on('get-database',(event, params, cb)=>{
	// 	console.log({ event, params, cb })
	// 	if(params.remote){
	// 		state.db.pierced.where('remote').equals(params.remote).then(e=>{
	// 			console.log({e})
	// 			cb(e)
	// 		})
	// 	}
	// })

	return (
		<div
			style={{
				display: 'flex',
				height: '100vh',
				width: '100vw',
				padding: 10,
			}}
		>
			<Card
				className="_layout-menu"
				style={{
					width: 256,
					marginRight: 24,
					height: '100%',
					paddingTop: '10vh',
					paddingBottom: '10vh',
				}}
			>
				<Menu>
					<Menu.Item key="0" icon={<div />}>
						<Link to="/">Home</Link>
					</Menu.Item>
					<Menu.Item key="1" icon={<div />}>
						<Link to="/hotpots" title="热点"> 
							热点 Navigation One 
						</Link>
					</Menu.Item>
					<Menu.Item key="2" icon={<div />}>
						<Link to="/net_iptv" title="电视">
							电视 Navigation Two 
						</Link>
					</Menu.Item>
					<Menu.Item key="3" icon={<div />}>
						<Link to="/pierced" title="映射"> 
							映射 Navigation Thre{' '}
						</Link>
					</Menu.Item>
					<Menu.Item key="4" icon={<div />}>
						<Link to="/feed" title="Rss"> 
							RSS 订阅 
						</Link>
					</Menu.Item>
					<Menu.Item key="5" icon={<div />}>
						<Link to="/m3u8" title="映射"> 
							M3U8 下载 
						</Link>
					</Menu.Item>
					<Menu.Item key="6" icon={<div />}>
						<Link to="/wallpaper" title="壁纸"> 
							壁纸 
						</Link>
					</Menu.Item>
				</Menu>
			</Card>

			<Card
				className="_layout-content"
				style={{ flex: 1, minWidth: 256  }}
			>
				{props.children}
			</Card>
		</div>
	);
});
