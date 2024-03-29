import React from 'react';
import Loading from '@/components/activeLoading';
import { Redirect } from 'umi';

import { useUpdate } from '@/common/common';

export default React.memo(() => {
	const [state, setState, { electron }] = useUpdate({ loading: true });

	React.useEffect(() => {
		setTimeout(() => {
			setState({ loading: false });
		}, 2 * 1000);
	}, []);

	return (
		<div style={{ width: '100vh', height: '100vh', margin: '30% auto' }}>
			{state.loading ? (
				<Loading index={3} loading={state.loading} />
			) : (
				<Redirect to="/home" />
			)}
		</div>
	);
});
