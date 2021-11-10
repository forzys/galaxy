
const url = require('url')

const piercedIndex = list => {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Document</title>
		<style>
			ul,li{
				list-style:none;
			}
			li{
				display:flex;
				align-items:center;
				padding:10px 0;
			}
			.app{
				width:60vw;
				height:80vh;
				box-shadow:0 0.5em 1em rgba(0,0,0,0.45);
				margin:8vh auto;
				text-align:center;
				overflow:auto;
			}
			li>div{
				margin:10px;
			}
			::-webkit-scrollbar {
				width: 0;
				height: 0;
				opacity: 0;
				display: none;
				visibility: hidden;
				background: transparent;
			}
		</style>
	</head>
	<body>
		<div class='app'>
			<h1>当前 0-100条映射数据 </h1>
			<ul>
			${list
				.map((i) => {
					return `
						<li key=${i.remote}>
							<div>${i.name} :</div>
							<div>${i.path}</div>
							<div><a href='/${i.remote}'>${i.remote}</a></div>
						</li>
					`;
				})
				.join('')}
			</ul>
		</div>
	</body>
</html>`;
}

module.exports = {
	piercedIndex
}



