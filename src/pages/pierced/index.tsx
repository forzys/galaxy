import { Button, Popconfirm, Switch, Empty, message, Spin, Table } from 'antd';
import React from 'react';
import Dexie from 'dexie';
import { useUpdate, Icons, pagination } from '@/common/common';

export default React.memo((props) => {
	const [
		state,
		setState,
		{ current, electron, bridge, filterSize, md5 },
	] = useUpdate({
		pagination: { ...pagination, pageSize: 5 },
	});

	function onFilesDrag(e: any) {
		e.preventDefault();
		e.stopPropagation();
		const files = e.dataTransfer.files;
		setState({ loading: true }).then(() => {
			const fileList: any = state.fileList || [];
			files.forEach((file: any, i: number) => {
				const index = fileList.findIndex(
					(f: any) => f.path === file.path,
				);

				const info: any = {
					path: file.path,
					size: file.size,
					last: file.lastModified,
					name: file.path.split('\\').pop(),
					remote: md5(file.path).substr(13, 6),
				};

				if (index !== -1) {
					info.index = index;
					fileList.splice(index, 1, info);
				} else {
					(info.index = fileList.length), fileList.push(info);
				}
			});

			bridge
				?.onGetFilesInfo?.({ files: fileList })
				?.then((result: any) => {
					message.success('success');
					setState({ loading: false, fileList: result });
				});
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
				render: (i: any) => i + 1,
			},
			{
				title: '名称',
				dataIndex: 'name',
			},
			{
				title: '路径',
				dataIndex: 'path',
			},
			{
				title: '远程',
				dataIndex: 'remote',
				render: (re) => {
					return (
						<a
							onClick={() => {
								electron?.shell?.openExternal(
									'http://*.vaiwan.com/' + re,
								);
							}}
						>
							http://*.vaiwan.com/{re}
						</a>
					);
				},
			},
			{
				title: '类型',
				dataIndex: 'directory',
				render: (dir: any) => (dir ? '文件夹' : '文件'),
			},
			{
				title: '大小',
				dataIndex: 'size',
				render: (size: any) => filterSize(size),
			},
			{
				title: '状态',
				dataIndex: 'status',
				render: (status) => (status ? '启用中' : '关闭中'),
			},
			{
				title: '操作',
				dataIndex: '_op',
				render: (_, record: any) => {
					return (
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<Switch
								checked={!!record.status}
								checkedChildren="开启"
								unCheckedChildren="关闭"
								onChange={(e) => {
									const files = state.fileList;
									files.splice(record.index, 1, {
										...record,
										status: e,
									});
									setState({ fileList: [...files] });
								}}
							/>
							<Popconfirm
								icon={
									<div>
										{' '}
										<b style={{ color: '#ff7875' }}>
											注意
										</b>{' '}
										删除后远程将无法访问{' '}
									</div>
								}
								cancelText="取消"
								title={null}
								okText="确认"
								onConfirm={() => {
									const files = state.fileList;
									files.splice(record.index, 1);
									state.fileList = files.map(
										(f: any, i: number) => {
											f.index = i;
											return f;
										},
									);
									setState({ fileList: [...state.fileList] });
								}}
							>
								<Button type="link">删除</Button>
							</Popconfirm>
						</div>
					);
				},
			},
		],
		[],
	);

	return (
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
				pagination={
					state?.fileList?.length > 5 ? state.pagination : false
				}
				size="small"
				rowKey="index"
				columns={columns}
				dataSource={state?.fileList || []}
				locale={{
					emptyText: (
						<Spin spinning={!!state.loading}>
							<Empty image={Icons.Empty} description="啥都没有" />
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
	);
});
