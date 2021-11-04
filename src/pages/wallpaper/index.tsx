import { Button, Result,message } from 'antd';
import React from 'react'; 
import { useUpdate } from '@/common/common';

export default React.memo((props) => { 
  const [state, setState, { bridge, current}] = useUpdate({});

  function onFilesDrag(e: any) {
	e.preventDefault();
	e.stopPropagation();
	const files = e.dataTransfer.files;
	console.log({files})

	

	if(files[0]?.path) bridge
	?.onSetWallpaper?.({ wallpaper: files[0]?.path })
	?.then((result: any) => {
		message.success('success'); 
	}); 
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
		<h1 style={{ textAlign: 'center' }}> 壁纸 </h1>

	  
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
