# axios 的使用


1.安装axios

``` bash
 npm install axios -S
```

2.axios 配置

``` js
import axios from 'axios';

//如果使用vue-cli 2版本 可以直接在Config文件中配置

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_URL:'http://baseURl',
  NEWS_BANNER_LIST:'',
})

//配置基本URL
axios.defaults.baseURL = process.env.BASE_URL 

//设置超时时间
axios.defaults.timeout = 25000

//http request 拦截器
axios.interceptors.request.use(
    config => {
        const token = Cache.getToken() ; // 注意使用的时候需要引入cookie方法，推荐js-cookie
        config.data = JSON.stringify(config.data);
        config.headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        if (token.length > 0) {
          config.params = { 'accessToken': token }
        }
        return config;
    },
    error => {
        return Promise.reject(err);
    }
);


//http response 拦截器
axios.interceptors.response.use(
    response => {
        if (response.data.errCode == 2) {
            router.push({
                path: "/login",
                querry: {
                    redirect: router.currentRoute.fullPath
                } //从哪个页面跳转
            })
        }
        return response;
    },
    error => {
        return Promise.reject(error)
    }
)

```

## 封装ajax 请求

``` js
/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function post(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.post(url, data)
            .then(response => {
                resolve(response.data);
            }, err => {
                reject(err)
            })
    })
}

/**
 * 封装patch请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function patch(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.patch(url, data)
            .then(response => {
                resolve(response.data);
            }, err => {
                reject(err)
            })
    })
}

/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function put(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.put(url, data)
            .then(response => {
                resolve(response.data);
            }, err => {
                reject(err)
            })
    })
}

```

## 如若使用JSONP

axios本身不支持jsonp的
首先需要按照jsonp一个插件

```bash
npm install jsonp -S

```

在统一封装ajax的页面引入

``` js
import originJSONP from 'jsonp';
```

```js

/**
 * 封装jsonp请求
 * @param url
 * @param option
 * @returns {Promise}
 */

export function jsonp(url,option){
  return new Promise(function(resolve,reject){
		originJSONP(url,option,function(err,res){
				if(!err){
					resolve(res);
				}else{
					reject(err)
				}
		})
	})
}
```

## axios封装成服务实例

``` js
import axios from "axios";
import Config from "@/config/config";
import store from "@/vuex/store";
import _ from 'lodash';

//请求预处理
let requestPreConfig = null;
//请求预处理出现错误
let requestError = null;
//响应预处理
let responsePreProcess = null;
//响应错误
let responseError = null;
//服务实例
let instance = null;

let getInstance = () => {
  if (!instance) {
    // console.log('new axios instance');
    instance = axios.create({
      timeout: 25000,
      baseURL: Config.mobileBaseUri
    });
    //请求预处理
    instance.interceptors.request.use(function (config) {
      if (requestPreConfig) {
        requestPreConfig(config);
      }
      //针对IE浏览器缓存ajax请求的问题添加随机时间戳
      let random = `timestamp=${new Date().getTime()}`;
      if (config.url.indexOf('?') === -1) {
        random = `?` + random;
      } else {
        random = `&` + random;
      }
      config.url = config.url.concat(random);

      if (store.getters.getToken.length > 0) {
        config.headers['XMCAS'] = store.getters.getToken;
      }
      return config;
    }, function (error) {
      if (requestError) {
        requestError(error);
      }
      return Promise.reject(error);
    });
    //响应预处理
    instance.interceptors.response.use(function (response) {
        if (response.headers && _.toLower(response.headers['content-type']) === 'application/octet-stream') {
          //二进制流直接结束,返回流数据 
          if (responsePreProcess) {
            responsePreProcess(true);
          }
          return Promise.resolve(response.data);
        }

        // console.log(JSON.stringify(response.data));
        if (response.data.code === 0) {
          if (responsePreProcess) {
            responsePreProcess(response.data.data);
          }
          return Promise.resolve(response.data.data);
        } else {
          let error = `${response.data.message}`;
          if (responseError) {
            responseError(response.data.code, error)
          }
          return Promise.reject(error);
        }
      }, function (error) {
        if (responseError) {
          responseError(error.response.status, error.message)
        }
        return Promise.reject(error.message);
      }
    );
  }
  return instance;
};

const defaultPageSize = 20;

let module = {
  setRequestPreConfigCallBack: (callback) => {
    requestPreConfig = callback;
  },
  setRequestErrorCallBack: (callback) => {
    requestError = callback;
  },
  setResponsePreProcessCallback: (callback) => {
    responsePreProcess = callback;
  },
  setResponseErrorCallback: (callback) => {
    responseError = callback;
  },
  //分页查询
  findByPage: (uri, page) => {
    if (uri.indexOf('?') > 0) {
      uri = uri.concat(`&page=${page}&pageSize=${defaultPageSize}`)
    } else {
      uri = uri.concat(`?page=${page}&pageSize=${defaultPageSize}`)
    }
    return getInstance().get(uri);
  },

  //分页查询
  findByPageSize: (uri, page, pageSize) => {
    if (uri.indexOf('?') > 0) {
      uri = uri.concat(`&page=${page}&pageSize=${pageSize}`)
    } else {
      uri = uri.concat(`?page=${page}&pageSize=${pageSize}`)
    }
    return getInstance().get(uri);
  },

  //分页查询
  findByParam: (uri, page, param) => {
    if (uri.indexOf('?') > 0) {
      uri = uri.concat(`&page=${page}&pageSize=${defaultPageSize}`)
    } else {
      uri = uri.concat(`?page=${page}&pageSize=${defaultPageSize}`)
    }
    return getInstance().post(uri, param);
  },

  get: (uri) => {
    return getInstance().get(uri);
  },

  post: (uri, param) => {
    return getInstance().post(uri, param);
  },

  put: (uri, param) => {
    return getInstance().put(uri, param);
  },

  remove: (uri) => {
    return getInstance().delete(uri);
  },

  getFile: (uri, name) => {
    getInstance().get(uri, {responseType: 'blob'}).then(data => {
      require("downloadjs")(data, name);
    });
  },
  upLoadFile(uri,param,config){
    return getInstance().post(uri, param,config);
  }
};

export default module;

```

然后可以单独新建一个`api`文件夹，统一管理ajax页面

``` js
import HttpServer from '../server-config';

const API = {
  getInitTree() {//初始化tree顶级结构
    return HttpServer.get(`login/initOrg`);
  },
};

export default API;

```