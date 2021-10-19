import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';
import { useUpdate } from '@/common/common';

export default React.memo((props) => {
	// console.log({ props });
	const [state, setState] = useUpdate({});

	return (
		<div>
			Hotspot
			<Button onClick={() => history.push('/')}> GoBack</Button>
		</div>
	);
});
