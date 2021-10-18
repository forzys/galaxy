import React, { useRef } from 'react';
import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { Button } from 'antd';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export default (props) => {
    console.log('-----',props)
 
  return (
      <ProLayout
        // style={{
        //   height: '100vh',
        //   border: '1px solid #ddd',
        // }}
        // actionRef={actionRef}
        menu={{
          request: async (params,menus) => {
            await waitTime(2000);
            
            return [
                {path:'/todo',name:'todo',component: menus.filter(i=>i.path ==='/todo')},
                {path:'/wallpaper',name:'wallpaper',component: menus.filter(i=>i.path ==='/wallpaper')}
            ];
          },
        }}
        // location={{
        //   pathname: '/welcome/welcome',
        // }}
      >
        <PageContainer content="欢迎使用">
          Hello World
          <Button
            style={{
              margin: 8,
            }}
          
          >
            刷新菜单
          </Button>
          {props.children}
        </PageContainer>
      </ProLayout>
  );
};