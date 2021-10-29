import React from 'react';
import './loading.css';

const loading: any = {
	1: (
		<div className="loading1">
			<span className="top" />
			<span className="bottom" />
		</div>
	),
	2: (
		<div className="loading2">
			<span />
			<span />
			<span />
			<span />
			<span />
		</div>
	),
	3: <div className="loading3" />,
	4: (
		<div className="loading4">
			<div className="spinner" />
			<div className="hourHand" />
			<div className="dot" />
		</div>
	),
};

export default React.memo((props: any) => {
	const spining = React.useMemo(() => {
		return loading[props.index || 1];
	}, [props.index]);

	return props.loading ? spining : props.children;
});
