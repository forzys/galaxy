




import { Button } from 'antd';
import React from 'react'; 
import { micromark } from 'micromark'
import { useUpdate } from '@/common/common';

  
// const { ipcRenderer } = window.require('electron');
// const electron =  window.require('electron')


export default React.memo((props) => {
	const [state, setState,{ router }] = useUpdate({});

    // console.log({ electron })
    

	return (
		<div>
			
			<Button onClick={() => router.push('/')}> Home </Button>
		</div>
	);
});
