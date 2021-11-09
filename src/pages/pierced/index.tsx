
import React from 'react'; 
import { useUpdate, Icons, pagination } from '@/common/common';
import { Button, Popconfirm, Switch, Input, Empty, message, Spin, Table, Card} from 'antd';

export default React.memo((props) => {
	const [ state, setState, {handle, current, electron,  filterSize, md5, common }] = useUpdate({
		pagination: { ...pagination, pageSize: 5 },
		port: 12345,
		domain: 'abcd',
		options: {},
	});
 
	function onGetOptions() { 
		handle({ handle:'Events.getServer' }).then((res:any)=>{ 
			if(res.success){
				if(res.result?.stdout){
					setState({ servered: true })
				}
			}
		}) 
		common.DataBase.get({ table:'user' }).then((res:any)=>{ 
			if(res.success){
				if(res?.data?.length){
					const user = res?.data?.[0] 
					const options = user?.options 
					setState({ user, options, domain: options.domain, port:options.port})
				}
			}
		}) 
	}
	function onSetOptions(op:any){
		const user = state.user
		user.options = {
			...state?.options,
			...op,
		}
		common.DataBase.set({ table:'user', set: user }).then((res:any)=>{ 
			if(res.success){
				onGetOptions()
			}
		}) 
	}

	function onGetPierced(){
		const { page, pageSize } = state?.pagination 
		common.DataBase.select({ table:'pierced', page, pageSize }).then((res:any)=>{
			if(res.success){
				if(res?.data?.length){
					setState({ fileList: res?.data })
				}
			}
		}) 

	}

	React.useEffect(() => {
		onGetOptions();
		onGetPierced();
		
	}, []);

	function onFilesDrag(e: any) {
		e.preventDefault();
		e.stopPropagation();
		const files = e.dataTransfer.files;

		setState({ loading: true }).then(() => { 
			const fileList:any = []; 
			files.forEach((file: any) => {
				const md5Id = md5(file.path)
				fileList.push({
					status: true,
					path: file.path,
					size: file.size,
					id: md5Id.substr(8,16), 
					last: file.lastModified, 
					remote:md5Id.substr(8,8),
					name: file.path.split('\\').pop(), 
				})
			});
 
			handle({handle:'Events.getFileInfo', files: fileList }).then((res:any)=>{ 
				if(res.success){ 
					common.DataBase.set({ table:'pierced', set: res?.result }).then((resu:any)=>{
						if(resu.success){
							onGetPierced()
						}
					})
					 
				}
			})
 
		});

		state.timer = setTimeout(() => {
			current.dragBox.classList.remove('show');
			current.dragBox.classList.add('hidden');
		}, 0.3 * 1000);
	}

	function onDragEnter(e: any) {
		e?.currentTarget?.classList?.add('mask');
		if (current.dragBox) {
			current.dragBox?.classList?.add('show');
			current.dragBox?.classList?.remove('hidden'); 
		} 
	}
 
	function onDragOver(e: any) {
		e.preventDefault();
		if (state.timer) clearTimeout(state.timer); 
		let target = e.currentTarget;
		state.timer = setTimeout(() => {
			target?.classList?.remove('mask');
			current.dragBox.classList.remove('show');
			current.dragBox.classList.add('hidden');
		}, 0.3 * 1000);
	}
	
	function onServerChange(servered: any) { 
		setState({ servered }).then(()=>{
			let name = servered ?'Events.openServer':'Events.closeServer'
			handle?.({ handle: name, port: state.port, domain: state.domain }).then((res:any)=>{ 
				console.log({ res })
				if(res.success && servered){ 
					let isPort = state.port !== state?.options?.port
					let isDomain= state.domain !== state?.options?.domain
					if(isPort || isDomain){
						onSetOptions({ port:state.port, domain:state.domain })
					} 
				}
			})
		}) 	 
	}

	const columns =   [
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
				render: (re: any) => {
					const url = `http://${state?.options?.domain}.vaiwan.com/${re}`;
					return (
						<a onClick={() => electron?.shell?.openExternal(url)}>
							{url}
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
				render: (_: any, record: any) => {
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
										<b style={{ color: '#ff7875' }}>
											{' '}
											注意{' '}
										</b>{' '}
										删除后远程将无法访问
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
		]

	return (
		<div
			onDragOver={onDragOver}
			onDragEnter={onDragEnter}
			onDragLeave={e=>e.preventDefault()}
			onDrop={(e: any) => {
				e.preventDefault();
				e?.currentTarget?.classList?.remove('mask');
				current.dragBox.classList.remove('show');
				current.dragBox.classList.add('hidden');
			}}
			style={{ width: '100%', height: '100vh' }}
		>
			<h1 style={{ textAlign: 'center' }}> 映射 </h1>

			<Card>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						padding: 5,
					}}
				>
					<div style={{ marginRight: 12 }}> 自定义二级域名 </div>
					<Input
						className="text-align-right"
						style={{ width: 225 }}
						prefix="http://" 
						suffix={
						<div>
							<span style={{marginRight:6}}>.vaiwan.com</span> 
							<a onClick={(e:any)=>{
									e.stopPropagation();
									e.preventDefault();
									electron?.clipboard?.writeText('http://'+state.domain+'.vaiwan.com')
									message.success('已复制')
							}}> {Icons.Copy} </a>
						</div>}
						defaultValue="mysite"
						disabled={state.servered}
						value={state.domain}
						onChange={(e) =>
							setState({
								domain: e?.currentTarget?.value?.slice(0, 8),
							})
						}
					/>
				</div>

				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						padding: 5,
					}}
				>
					<div style={{ marginRight: 12 }}> 自定义映射端口 </div>
					<Input
						style={{ width: 150 }}
						value={state.port}
						type="number"
						disabled={state.servered}
						onChange={(e) =>
							setState({
								port: e?.currentTarget?.value?.slice(0, 6),
							})
						}
					/>
				</div>

				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						padding: 5,
					}}
				>
					<div style={{ marginRight: 26 }}> 本地服务管理 </div>
					<Switch
						checked={!!state.servered}
						checkedChildren="开启"
						unCheckedChildren="关闭"
						onChange={onServerChange}
					/>
				</div>
			</Card>

			<Table
				pagination={
					state?.fileList?.length > 5 ? state.pagination : false
				}
				size="small"
				rowKey="id"
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
				children='拖动到这里'
			/>
		</div>
	);
});
