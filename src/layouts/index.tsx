import React, { useRef } from 'react';
import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { Button } from 'antd';
import { Link } from 'umi';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export default (props) => {
  console.log('-----', props);

  return (
    <ProLayout
      logo={() => <div style={{ width: 32, height: 32 }} />}
      title={false}
      collapsed={false}
      footerRender={() => <div />}
      collapsedButtonRender={() => <div />}
      menu={{
        request: async (params, menus) => {
          await waitTime(2000);
          return [
            {
              path: '/todo',
              name: 'todo',
              component: menus.filter((i) => i.path === '/todo'),
            },
            {
              path: '/wallpaper',
              name: 'wallpaper',
              component: menus.filter((i) => i.path === '/wallpaper'),
            },
          ];
        },
      }}
      // location={{
      //   pathname: '/welcome/welcome',
      // }}
      style={{ height: '100vh' }}
    >
      <PageContainer>{props.children}</PageContainer>
    </ProLayout>
  );
};
