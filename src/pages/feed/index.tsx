import { Button, Spin, Input,message } from 'antd';
import Icon from '@ant-design/icons'
import React from 'react';
import { Icons, useUpdate } from '@/common/common';

export default React.memo((props) => {
	const [state, setState, { router, electron, handle, parserRss }] = useUpdate({});
  
	function onSubscribe(rssUrl:any){  
        rssUrl && setState({ loading: true }).then(()=>{
            handle({ handle:'request',  url: rssUrl, type:'xml'}).then((res:any)=>{
                // ?page=3
                // console.log( { res })
                if(res?.success){
                    state?.parser?.parseString?.(res.data)?.then((feed:any)=>{
                        console.log({ feed })
                    })
                }else{
                    message.error('地址无效')
                }
                setState({ loading: false })
            }) 
        }) 
    }

	React.useEffect(() => {
        state.parser = new parserRss()
	}, [])
    
	return (
		<Spin spinning={!!state?.loading}>
			<h1 style={{ textAlign: 'center' }}>RSS 订阅</h1>
			<div style={{ marginBottom: 24, display:'flex',alignItems:'center' }}>
                <label style={{width: 50}}> 地址 </label>
				<Input.Search
                    enterButton={<Button style={{padding:'3px 7px'}} icon={Icons?.Feed} />}
                    placeholder='输入RSS地址'
                    onSearch={onSubscribe}
                    style={{maxWidth: 550}}
                />
			</div>
 
		</Spin>
	);
});
