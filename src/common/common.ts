import React, { useEffect } from 'react';
import { request, history } from 'umi'; 
import Icons from './icon';
  
const md5 = require('./core/md5.ts');
const filesave = require('./core/filesave'); 
const parserRss = require('./core/rss-parser')
const parserM3U8 = require('./core/m3u8-parser')
const videoJs = require('./core/video')

export { Icons };
  


export function filterSize(size: number) {
	if (!size) return '';
	if (size < Math.pow(1024, 1)) return size + ' B';
	if (size < Math.pow(1024, 2))
		return (size / Math.pow(1024, 1)).toFixed(2) + ' KB';
	if (size < Math.pow(1024, 3))
		return (size / Math.pow(1024, 2)).toFixed(2) + ' MB';
	if (size < Math.pow(1024, 4))
		return (size / Math.pow(1024, 3)).toFixed(2) + ' GB';
	return (size / Math.pow(1024, 4)).toFixed(2) + ' TB';
}

export const pagination = {
	total: 0,
	current: 1,
	pageSize: 10,
	size: 'small',
	showSizeChanger: true,
	showQuickJumper: true,
	showTotal: (total: any) => `Total: ${total}  `,
	pageSizeOptions: ['5', '10', '20', '50', '100'],
};

export function onGetHtmlString(props: any): any {
	if (typeof props === 'string') {
		return props?.trim?.();
	}
	if (typeof props === 'number') {
		return props
	}

	if (typeof props === 'function') {
		return onGetHtmlString(props?.());
	}

	if (typeof props === 'object' && props?.$$typeof === Symbol.for('react.element')) {
		if (typeof props?.props?.children === 'string') {
			return props?.props?.children?.trim?.();
		} 
		if (Array.isArray(props?.props?.children)) {
			let _temp = '';
			for (let i = 0; i < props?.props?.children?.length; i += 1) {
				_temp += onGetHtmlString(props?.props?.children[i]);
			}
			return _temp;
		}
	}
	if (Array.isArray(props)) {
		let _temp = '';
		for (let i = 0; i < props?.length; i += 1) {
			_temp += onGetHtmlString(props?.[i]);
		}
		return _temp;
	}
	return '';
}

export function exportList(props: any) {
	const { columns = [], lists = [], name = 'list.csv' } = props || {};
	const titles = columns.map((i: any) => onGetHtmlString(i.title)).join(',');
	let text = titles as string;
	for (const i in lists) {
		const index = lists[i];
		text += '\n';
		for (let j in columns) {
			const col = columns[j];
			const isEval =
				columns[j].eval && columns[j].eval(index[col.dataIndex], index);
			const isRender =
				!isEval &&
				columns[j].render &&
				columns[j].render(index[col.dataIndex], index);
			const isIndex = !isRender && index[col.dataIndex];
			const value = isEval || isRender || isIndex || '';
			text += `"${value}"`;
			text += ',';
		}
	}
	let blob = new Blob(['\uFEFF' + text], {
		type: 'text/plain;charset=utf-8',
	});
	filesave.saveAs(blob, name);
}

function uuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		/* eslint-disable no-bitwise */
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export function byteLength(str: string = '') {
	let count = 0;
	for (let i = 0, l = str.length; i < l; i += 1) {
		count += str.charCodeAt(i) <= 128 ? 1 : 2;
	}
	return count;
}

export function numberFormat(num = '', decimals = 2, re = 1) {
	if (num === '' || num === null || Number.isNaN(+num)) {
		return num;
	}
	let value = String(Number(num));
	value = (+num).toFixed(+decimals);
	if (value.split('.').length > 1) {
		return value.replace(/(\d)(?=(\d{3})+\.)/g, re ? '$1,' : '$1');
	}
	return re ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : value;
}

export function useUpdate(props: any = {}) {
	const ref = React.useRef();
	const { current } = React.useRef({});
	const _self: any = React.useRef({});
	const [, setUpdate] = React.useState(null);
	const { current: state } = React.useRef(props);

	function forceUpdate(condition: any, input: boolean | undefined) {
		if (_self?.current?.timer) {
			_self?.current?.timer?.();
		}
		if (typeof condition === 'object') {
			Object.keys(condition).forEach((con) => {
				state[con] = condition[con];
			});
		}
		if (typeof condition === 'function') {
			const _state = condition(state);
			forceUpdate(_state, _state === state);
		}
		if (typeof input === 'undefined' || !!input === true) {
			setUpdate([] as never);
		}
		return new Promise((resolve) => {
			resolve(state);
		});
	}

	forceUpdate.sleep = function (condition: any, dely: number = 700) {
		_self.current.now = Date.now();
		return forceUpdate(condition, true).then(() => {
			_self.current.timer = function () {
				while (_self?.current?.timer) {
					if (Date.now() - _self.current.now >= dely) {
						_self.current.timer = null;
						break;
					}
				}
			};
		});
	};

	forceUpdate.timeout = function (condition: any, dely: number = 200) {
		return new Promise((resolve) => {
			forceUpdate(condition, true).then((_s) => {
				setTimeout(() => {
					resolve(_s);
				}, dely);
			});
		});
	};

	const params = React.useMemo(
		() => ({
			request,
			current,
			md5,
			uuid,videoJs,
			parserM3U8,
			ref, parserRss,
			router: history,
			filterSize,
			electron: (window as any).electron, 
			common: (window as any).commonRender,
			handle: (window as any).electronHandle,
		}),
		[],
	);

	useEffect(() => {
		return () => {
			if (_self.current.timer) {
				clearTimeout(_self.current.timer);
			}
		};
	}, []);

	return [state, forceUpdate, params];
}

function asyncLoad(url: string) {
	return new Promise((resolve) => {
		const result = {
			success: false,
		};
		const scriptElement = document.createElement('script');
		scriptElement.async = true;
		scriptElement.type = 'text/javascript';
		scriptElement.onload = function (e) {
			// console.log('外部资源加载成功',e)
			result.success = true;
			resolve(result);
			scriptElement.remove();
		};
		scriptElement.onerror = function (e) {
			// console.log('外部资源加载失败',e)
			resolve(result);
			scriptElement.remove();
		};
		scriptElement.src = url;
		document.head.appendChild(scriptElement);
	});
}

// 没有 op 将 tree 变成 object 类型方便取值查找
// op 中传入 id  找到 tree 中对应id的值
export function treeLoop(treeList: any, options: any): any {
	const { key = 'key', id, leafs = !options } = options || {};
	if (!Array.isArray(treeList)) return {};

	if (leafs && typeof id === 'undefined') {
		const params = typeof leafs === 'object' ? leafs : {};

		for (let i = 0; i < treeList.length; i += 1) {
			const { children, ...leaf } = treeList[i] || {};
			params[leaf[key]] = leaf;
			treeLoop(children, { ...options, leafs: params }); // 传入已展开叶子
		}
		return params;
	}

	if (!leafs && typeof id !== 'undefined') {
		const find = treeList.find((item) => item[key] === id); // 寻找当前层树节点
		if (find) return find;
		let childrenFind = null; // 遍历后续树节点
		for (let i = 0; i < treeList.length; i += 1) {
			const children = (treeList[i] || {}).children;
			childrenFind = treeLoop(children, options);
			if (childrenFind) break;
		}
		return childrenFind;
	}

	return null;
}
