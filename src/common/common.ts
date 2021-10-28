import React, { useEffect } from 'react';
import { request, history } from 'umi'; 

const MD5 = require('./core/md5.ts');
const filesave = require('./core/filesave');
const isReact = Symbol.for('react.element')
 

export function isElectron() {
    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
    }

    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
        return true;
    }

    // Detect the user agent when the `nodeIntegration` option is set to false
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
    }

    return false;
}

// module.exports = isElectron;

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

	if (typeof props === 'function') {
		return onGetHtmlString(props?.());
	}

	if (typeof props === 'object' && props?.$$typeof === isReact) {
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
			const isEval = columns[j].eval && columns[j].eval(index[col.dataIndex], index);
			const isRender = !isEval && columns[j].render && columns[j].render(index[col.dataIndex], index);
			const isIndex = !isRender && index[col.dataIndex];
			const value = isEval || isRender || isIndex || '';
			text += `"${value}"`;
			text += ',';
		}
	}
	let blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
	filesave.saveAs(blob, name);
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

	if (value.split('.').length > 1){
		return value.replace(/(\d)(?=(\d{3})+\.)/g, re ? '$1,' : '$1');
	}
	
	return re ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : value;
}

export function useUpdate(props:any = {}) {
	const ref = React.useRef();
	const _self: any = React.useRef({});
	const [, setUpdate] = React.useState(null);
	const { current: state } = React.useRef(props);

	function forceUpdate(condition: any, input: boolean | undefined) {
		if (_self?.current?.timer){
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

	const params = React.useMemo(() => ({
		ref, request, router: history, 
		electron: (window as any).electron, 
		bridge: (window as any).electronBridge,
	}), []);

	useEffect(() => {
		return () => {
			if(_self.current.timer){
				clearTimeout(_self.current.timer);
			}
		};
	}, []);

	return [state, forceUpdate, params];
}


// export function translate(keyword: string, option = {}) {
//   let now = Date.now();
//   if (!keyword.length) return Promise.resolve({ success: false });
//   const params = {
//     q: keyword,
//     appid: '20210823000924725',
//     salt: now,
//     from: 'zh',
//     to: 'en',
//     sign: '',
//     callback: 'callback_',
//     ...option,
//   };
//   let _str = params.appid + params.q + params.salt + 'diaPQ5osiX1iM96daNIF';
//   params.sign = MD5(_str);
//   params.callback = 'callback_' + params.salt;
//   let query: any[] = [];

//   for (let key in params) {
//     query[query.length] =
//       encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
//   }

//   return new Promise((solve) => {
//     window[params.callback] = function (data: any) {
//       window[params.callback] = null;
//       solve(data);
//     };

//     let _query = query.join('&').replace(/%20/g, '+');
//     asyncLoad(`https://fanyi-api.baidu.com/api/trans/vip/translate?${_query}`);

//     setTimeout(() => {
//       if (window[params.callback]) {
//         window[params.callback] = null;
//         solve({ success: false });
//       }
//     }, 6000);
//   });
// }

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


