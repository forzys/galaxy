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
		<div style={{ display: 'flex', height: '100vh' }}>
			<div style={{ width: 256 }}>
				<Card>
					<Menu>
						<Menu.Item key="1" icon={''}>
							Navigation One
						</Menu.Item>
						<Menu.Item key="2" icon={<div />}>
							Navigation Two
						</Menu.Item>
					</Menu>
				</Card>
				<div>Todo</div>
				<div>Wallpaper</div>
				<div>Hotspot</div>
			</div>
			<PageContainer style={{ flex: 1 }}>{props.children}</PageContainer>
		</div>
	);
});
