




import { Button,Input } from 'antd';
import React from 'react'; 
import { micromark } from 'micromark'
import { useUpdate } from '@/common/common';
 
 
export default React.memo((props) => {
	const [state, setState, { router, electron,bridge }] = useUpdate({});


	console.log({ electron,bridge })
    
    
	function onNewWindow(){
		bridge?.onWindowNewCreate?.('_home',{ title: 'Home Test Window'})?.then((res:any)=>{
			console.log({ res }) 
		})
	}

	React.useEffect(()=>{ 
		// https://openapi.beta.phyzi.cn/release_notes?page=1&per_page=3
		bridge.request('/release_notes?page=1&per_page=3',{hostname:'openapi.beta.phyzi.cn'})
		.then((res:any)=>{
			const { list } = res?.data
			const makedown = micromark(list[0]?.content,{allowDangerousHtml:true})
			// console.log({ makedown })
			setState({ makedown })
		})
	},[])


	function onReadLocalMd(e: any){
		const { files } = e.target 
		const reader = new FileReader();
		reader.onload = function (_e) { 
			const text:any = _e?.target?.result 
			const makedown = micromark(text, { 
				allowDangerousHtml:true, 
				extensions: [{ 
					 
				}]
			}) 
		  	setState({ makedown }) 
		} 
		reader.readAsText(files[0])
	} 


	return (
		<div>
  
			<div style={{ marginBottom: 24}}>
				{/* <Button onClick={() => router.push('/')}> Home </Button> */}
				<Button.Group>
					<Button onClick={onNewWindow}> +New </Button>
					
					<Button>
						本地 Makedown 
						<input type="file" onChange={onReadLocalMd} value={state.value} multiple={false} />
					</Button> 
				</Button.Group> 
			</div>
			  
			<div style={{width:'100%',display:'flex',overflow:'hidden'}}>
				<div dangerouslySetInnerHTML={{__html: state.makedown}} />
			</div>
 
		</div>
	);
});
