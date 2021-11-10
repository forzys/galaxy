import { Button, Card } from 'antd';
import React from 'react';
import { history } from 'umi';
import { Icons, useUpdate } from '@/common/common';

export default React.memo((props) => {
	console.log({ props });
	const [state, setState] = useUpdate({});

	return (
		<div>
			Todo
			<Button onClick={() => history.push('/')}> GoBack</Button>

			<div style={{marginTop: 30 }}> </div>

			<Card 
				className='todo_custom' 
				title={
					<div style={{ display:'flex' }} > 
						<div style={{ flex:1 }} className='progress'> 已完成： 11/33 </div>
						<div className='task'> </div> 
						<div style={{ flex:1 }}></div>
					</div>
				} 
				style={{ width: 500 }} 
				extra={ <Button className='close' icon={Icons.Close} />  }
			>

			</Card>
		</div>
	);
});
