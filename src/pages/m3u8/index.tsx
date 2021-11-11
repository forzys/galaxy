import { Button,Card, Spin, Input,message } from 'antd';
import React from 'react';
import { Icons, useUpdate } from '@/common/common';




export default React.memo((props) => {
	const [state, setState, { router, electron, handle, parserM3U8,  }] = useUpdate({});

	React.useEffect(() => {
        state.parser = new parserM3U8.Parser()
        state.parser.addParser({
            expression: /#EXTINF/g,
            customType: 'info',  
            segment: true,
            dataParser: (line:any) => {
                return line?.split(',')?.pop()
            }
          })
	}, [])
    function onReadLocalM3U8(e:any){
        const { files } = e.target 
        state.fileList = []
        Array.from({ length: 1 }).forEach((_,index)=>{
          const reader = new FileReader();
          reader.onload = function (fa:any) {
            const txt = fa?.target?.result
            state?.parser.push(txt)
            state?.parser.end();
            // console.log(state?.parser?.manifest)
            const m3u8List = state?.parser?.manifest?.segments
            let list = m3u8List.slice(0, 100) 
            setState({ list })

          }
          reader.readAsText(files[index]);
        })
      }

    function onParser(){ 
        // var parser = new m3u8Parser.Parser();
        // parser.push(manifest);
        // parser.end();
        // var parsedManifest = parser.manifest;
    }


    console.log({  state })
    
	return (
		<Spin spinning={!!state?.loading}>
			<h1 style={{ textAlign: 'center' }}>m3u8 在线</h1>
			<div style={{ marginBottom: 24, display:'flex',alignItems:'center' }}>
                <label style={{width: 50}}> 地址 </label>
				<Input
                    type='file'
                    placeholder='输入M3U8地址'
                    onChange={onReadLocalM3U8} 
                    style={{maxWidth: 550}}
                />
			</div>

            <Card style={{width: 400, height: 600, overflow:'auto'}} title={<div style={{fontSize: 14}}>播放列表</div>}>
                    {
                        state?.list?.map((i:any)=>{
                            return (
                                <div key={i.uri}>{i?.custom?.info}</div>
                            )
                        })
                    }

            </Card>
		</Spin>
	);
});
