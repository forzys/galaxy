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

export default React.memo((props: any) => {
	const [state, setState] = useUpdate({});

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
							映射 Navigation Thre
						</Link>
					</Menu.Item>
				</Menu>
			</Card>

			<Card
				className="_layout-content"
				style={{ flex: 'auto', minWidth: 256 }}
			>
				{props.children}
			</Card>
		</div>
	);
});
