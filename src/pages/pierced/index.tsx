import { Button, message, Spin } from 'antd';
import React from 'react';
import Dexie from 'dexie';
import { useUpdate } from '@/common/common';

export default React.memo((props) => {
	const [state, setState, { current }] = useUpdate({});

	function onFilesDrag(e: any) {
		e.preventDefault();
		e.stopPropagation();
		const files = e.dataTransfer.files;
		setState.timeout({ loading: true }, 1000).then(() => {
			const fileList: any = [];
			console.log({ files });
			files.forEach((file: any) => {
				fileList.push({
					path: file.path,
					size: file.size,
					last: file.lastModified,
				});
			});
			console.log({ fileList });
			message.success('success');
			setState({ loading: false, fileList });
		});

		state.timer = setTimeout(() => {
			current.dragBox.classList.remove('show');
			current.dragBox.classList.add('hidden');
		}, 0.3 * 1000);
	}

	function onDragEnter(e: any) {
		if (current.dragBox) {
			current.dragBox?.classList?.remove('hidden');
			current.dragBox?.classList?.add('show');
		}
	}

	function onDragLeave(e: any) {
		e.preventDefault();
		if (current.dragBox) {
			if (state.timer) {
				clearTimeout(state.timer);
			}
			state.timer = setTimeout(() => {
				current.dragBox.classList.remove('show');
				current.dragBox.classList.add('hidden');
			}, 0.3 * 1000);
		}
	}

	function onDragOver(e: any) {
		e.preventDefault();
		if (state.timer) {
			clearTimeout(state.timer);
		}
	}

	return (
		<Spin spinning={!!state?.loading}>
			<div
				onDragOver={onDragOver}
				onDragEnter={onDragEnter}
				onDragLeave={onDragLeave}
				onDrop={(e) => {
					e.preventDefault();
					current.dragBox.classList.remove('show');
					current.dragBox.classList.add('hidden');
				}}
				style={{ width: '100vh', height: '100vh' }}
			>
				<h1 style={{ textAlign: 'center' }}> 映射 </h1>
				<div>hello</div>

				<div
					className="drag_box hidden"
					ref={(e) => {
						current.dragBox = e;
					}}
					onDrop={onFilesDrag}
					onDragOver={(e) => e.preventDefault()}
				></div>
			</div>
		</Spin>
	);
});
