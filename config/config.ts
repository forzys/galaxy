// config/config.ts

import { defineConfig } from 'umi';
import routes from './routes';
// import layout from './layout';

export default defineConfig({ 
  // layout: {
  //   // 支持任何不需要 dom 的
  //   // https://procomponents.ant.design/components/layout#prolayout
  //   // name: 'Ant Design',
  //   // locale: false,
  //   // layout: 'side',
  //   // ...layout,
  // },
  routes: routes,
  plugins: [],
  fastRefresh:{}, 
  publicPath:"./",
  outputPath:"build"
});
