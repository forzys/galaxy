import { Button, Result,message } from 'antd';
import React from 'react'; 
import { useUpdate,fontAnimate } from '@/common/common';

export default React.memo((props) => { 
  const [state, setState, { bridge,handle, current}] = useUpdate({});

  function onFilesDrag(e: any) {
	e.preventDefault();
	e.stopPropagation();
	const files = e.dataTransfer.files;
 
 
	if(files[0]?.path) {
		handle?.({
			handle:'Events.setWallpaper',
			name:'wallpaper',  
			path:files[0]?.path,
		}).then((res:any)=>{
			console.log({ res }) 
			message.success('success');
		})
	}
	 
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



	React.useLayoutEffect(()=>{
		fontAnimate({})
	},[])


	
 
 
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

			<h1 className='bubbling' style={{ textAlign: 'center',background:'#3498db' }}> 壁纸 </h1>

		
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
