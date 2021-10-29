import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';
import { useUpdate } from '@/common/common';

export default React.memo((props) => {
	// console.log({ props });
	const [state, setState, { current }] = useUpdate({});

	function onFilesDrag(e: any) {
		console.log('onFilesDrag', { e });
	}
	function onDragEnter(e: any) {
		if (current.dragBox) {
			console.log('---', current.dragBox.classList);
			current.dragBox?.classList?.remove('hidden');
			current.dragBox?.classList?.add('show');
		}

		console.log('onDragEnter', { e, L: current });
	}
	function onDragLeave(e: any) {
		if (current.dragBox) {
			console.log('---', current.dragBox.classList);
			current.dragBox.classList.remove('show');
			current.dragBox.classList.add('hidden');
		}

		console.log('onDragLeave', { e, L: current });
	}

	return (
		<div
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
			style={{ width: '100vh', height: '100vh' }}
		>
			<h1 style={{ textAlign: 'center' }}> 映射 </h1>
			<div>hello</div>

			<div style={{ width: '100%', display: 'flex', overflow: 'hidden' }}>
				<div dangerouslySetInnerHTML={{ __html: state.makedown }} />
			</div>

			<div
				className="drag_box hidden"
				ref={(e) => {
					current.dragBox = e;
				}}
				onDrag={onFilesDrag}
			></div>
		</div>
	);
});
