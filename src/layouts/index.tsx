import React, { useRef } from 'react';
import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Menu } from 'antd';
import { Link } from 'umi';
import { useUpdate } from '@/common/common';

const waitTime = (time: number = 100) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(true);
		}, time);
	});
};

// export default (props:any) => {
// 	const [state, setState] = useUpdate({})

// 	console.log({ props })
// 	return (
// 		<ProLayout
// 			logo={() => <div style={{ width: 32, height: 32 }} />}
// 			title={false}
// 			collapsed={false}
// 			footerRender={() => <div />}
// 			collapsedButtonRender={() => <div />}
// 			menu={{
// 				request: async (params, menus) => {
// 				await waitTime(2000);
// 				return [
// 					{
// 						path: '/todo',
// 						name: 'todo',
// 						component: menus.filter((i) => i.path === '/todo'),
// 					},
// 					{
// 						path: '/wallpaper',
// 						name: 'wallpaper',
// 						component: menus.filter((i) => i.path === '/wallpaper'),
// 					},
// 				];
// 				},
// 			}}
// 			location={{
// 			  pathname : props.pathname ,
// 			}}
// 			style={{ height: '100vh' }}
// 			>
// 			<PageContainer>{props.children}</PageContainer>
// 		</ProLayout>
// 	);
// };

export default React.memo((props: any) => {
	const [state, setState] = useUpdate({});

	console.log({ props });

	return (
		<div style={{ display: 'flex', height: '100vh', width:'100vw', padding:10 }}>
			 
			<Card className='_layout-menu' style={{ width: 256, marginRight:24, height:'100%',paddingTop:'10vh', paddingBottom:'10vh',}}>
				<Menu>
					<Menu.Item key="0" icon={<div />}>
						<Link to='/'>Home</Link> 
					</Menu.Item>
					<Menu.Item key="1" icon={<div />}>
						<Link to='/hotspot'>Navigation One</Link> 
					</Menu.Item>
					<Menu.Item key="2" icon={<div />}>
						<Link to='/hotpots2'>Navigation Two</Link>
					</Menu.Item>
					<Menu.Item key="3" icon={<div />}>
						<Link to='/hotpots3'>Navigation Thre</Link>
					</Menu.Item>
				</Menu>
			</Card>  
			
			<Card className='_layout-content' style={{ flex:'auto', minWidth:256 }}>{props.children}</Card>
		</div>
	);
});
