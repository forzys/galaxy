export default [
	{ exact: true, path: '/', redirect: '/home' },
	{ exact: true, path: '/home', name: 'home', component: './home' },
	{ exact: true, path: '/hotspot', name: 'hotspot', component: './hotspot' },
	{
		exact: true,
		path: '/wallpaper',
		name: 'wallpaper',
		component: './wallpaper',
	},
	{ exact: true, path: '/pierced', name: 'pierced', component: './pierced' },
	{ exact: true, path: '/todo', name: 'todo', component: './todo' },
];
