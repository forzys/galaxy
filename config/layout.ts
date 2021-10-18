import { Settings as LayoutSettings } from '@ant-design/pro-layout'

const Settings: LayoutSettings & {
  pwa?: boolean
  logo?: string
} = {
  navTheme: 'light',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: '',
  headerTheme: 'dark',

  pwa: false,
  logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  iconfontUrl: '',

  headerHeight: 64,
  // splitMenus: true,
  footerRender: false,
  // menuRender: false,
  menuHeaderRender: false,

  // navTheme: 'light',
  // primaryColor: '#4c5583',
  // layout: 'mix',
  // contentWidth: 'Fluid',
  // fixedHeader: true,
  // fixSiderbar: false,
  // title: '',
  // pwa: false,
  // iconfontUrl: '',
  // // "menu": {
  // //   "locale": true
  // // },
  // headerHeight: 64,
  // splitMenus: true,
  // footerRender: false,
  // menuRender: false,
  // menuHeaderRender: false,
}

export default Settings
