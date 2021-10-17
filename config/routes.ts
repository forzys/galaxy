export default [
  { exact: true, path: '/', component: 'index' },
  { path: '/hotspot', component: './hotspot/index.tsx' },
];

// export default [
//   {
//     path: '/playground',
//     name: 'Playground',
//     icon: 'FlagOutlined',
//     routes: [
//       {
//         path: '/playground/getting-started',
//         name: 'Getting started',
//         icon: 'FlagOutlined',
//         component: './playground/start',
//       },
//       {
//         path: '/playground/keyword-research',
//         name: 'Keyword research',
//         icon: 'iconKeywordplanner',
//         component: './playground/keyword/research',
//       },
//       {
//         path: '/playground/adspend-planner',
//         name: 'Ad spend planner',
//         icon: 'PayCircleOutlined',
//         component: './playground/adspend',
//       },
//       {
//         path: '/playground/bulk-keyword-research',
//         name: 'Bulk keyword research',
//         icon: 'ZoomInOutlined',
//         component: './playground/keyword/bulk',
//       },
//       {
//         path: '/playground/audience-research',
//         name: 'Audience research',
//         icon: 'team',
//         component: './playground/audience',
//       },
//       {
//         path: '/playground/keyword-manager',
//         name: 'Keyword manager',
//         icon: 'AppstoreOutlined',
//         component: './playground/keyword/manage',
//       },

//     ],
//   },
//   {
//     path: '/',
//     redirect: '/playground/getting-started',
//   },
//   {
//     component: './404',
//   },
// ]
