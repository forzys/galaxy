import { Button, Empty, message, Spin, Table } from 'antd';
import React from 'react';
import Dexie from 'dexie';
import { useUpdate, Icons } from '@/common/common';

export default React.memo((props) => {
	const [state, setState, { current }] = useUpdate({});

	function onFilesDrag(e: any) {
		e.preventDefault();
		e.stopPropagation();
		const files = e.dataTransfer.files;

		setState.timeout({ loading: true }, 1000).then(() => {
			const fileList: any = [];
			files.forEach((file: any) => {
				fileList.push({
					path: file.path,
					size: file.size,
					last: file.lastModified,
				});
			});
			message.success('success');
			setState({ loading: false, fileList });
		});

		state.timer = setTimeout(() => {
			current.dragBox.classList.remove('show');
			current.dragBox.classList.add('hidden');
		}, 0.3 * 1000);
	}

	function onDragEnter(e: any) {
		e?.currentTarget?.classList?.add('mask');

		if (current.dragBox) {
			current.dragBox?.classList?.remove('hidden');
			current.dragBox?.classList?.add('show');
		}
	}

	function onDragLeave(e: any) {
		e.preventDefault();

		// if (current.dragBox) {
		// 	if (state.timer) {
		// 		clearTimeout(state.timer);
		// 	}
		// 	let target = e.currentTarget
		// 	state.timer = setTimeout(() => {
		// 		target?.classList?.remove('mask')

		// 		current.dragBox.classList.remove('show');
		// 		current.dragBox.classList.add('hidden');
		// 	}, 0.3 * 1000);
		// }
	}

	function onDragOver(e: any) {
		e.preventDefault();
		if (state.timer) {
			clearTimeout(state.timer);
		}
		let target = e.currentTarget;
		state.timer = setTimeout(() => {
			target?.classList?.remove('mask');
			current.dragBox.classList.remove('show');
			current.dragBox.classList.add('hidden');
		}, 0.3 * 1000);
	}

	const columns = React.useMemo(
		() => [
			{
				title: '序号',
				dataIndex: 'index',
			},
			{
				title: '路径',
				dataIndex: 'path',
			},
			{
				title: '状态',
				dataIndex: 'status',
			},
			{
				title: '操作',
				dataIndex: '_op',
			},
		],
		[],
	);

	return (
		<Spin spinning={!!state?.loading}>
			<div
				onDragOver={onDragOver}
				onDragEnter={onDragEnter}
				onDragLeave={onDragLeave}
				onDrop={(e: any) => {
					e.preventDefault();
					e?.currentTarget?.classList?.remove('mask');
					current.dragBox.classList.remove('show');
					current.dragBox.classList.add('hidden');
				}}
				style={{ width: '100vh', height: '100vh' }}
			>
				<h1 style={{ textAlign: 'center' }}> 映射 </h1>

				<Table
					size="small"
					rowKey="index"
					columns={columns}
					dataSource={[]}
					locale={{
						emptyText: (
							<Spin spinning={!!state.loading}>
								<Empty
									image={Icons.Empty}
									description="啥都没有"
								/>
							</Spin>
						),
					}}
				/>

				<div
					onDragOver={(e) => e.preventDefault()}
					className="drag_box hidden"
					onDrop={onFilesDrag}
					ref={(e) => {
						current.dragBox = e;
					}}
				/>
			</div>
		</Spin>
	);
});
