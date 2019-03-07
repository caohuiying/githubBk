# keep-alive

- 在Vue构建的单页面应用（SPA）中，路由模块一般使用`vue-router`。`vue-router`不保存被切换组件的状态，
它进行`push`或者`replace`时，旧组件会被销毁，而新组件会被新建，走一遍完整的生命周期。
但有时候，我们有一些需求，比如跳转到详情页面时，需要保持列表页的滚动条的深度，等返回的时候依然在这个位置，这样可以提高用户体验。
在Vue中，对于这种“页面缓存”的需求，我们可以使用`keep-alive`组件来解决这个需求。

- `keep-alive`是个抽象组件（或称为功能型组件），实际上不会被渲染在DOM树中。
它的作用是在内存中缓存组件（不让组件销毁），等到下次再渲染的时候，还会保持其中的所有状态，并且会触发`activated`钩子函数。
因为缓存的需要通常出现在页面切换时，所以常与`router-view`一起出现：

``` md
<keep-alive>
    <router-view />
</keep-alive>
```

可以使用`keep-aliv`e组件的`include/exclude`属性。
`include`属性表示要缓存的组件名（即组件定义时的`name`属性），
接收的类型为`string`、`RegExp`或`string`数组；
`exclude`属性有着相反的作用，匹配到的组件不会被缓存。
假如可能出现在同一`router-view`的N个页面中，我只想缓存列表页和详情页，那么可以这样写：

``` md
<keep-alive :include="['Home', 'User']">
  <router-view />
</keep-alive>
```

## vue实现前进刷新，后退不刷新

希望实现前进刷新、后退不刷新的效果。即加载过的界面能缓存起来（返回不用重新加载），关闭的界面能被销毁掉（再进入时重新加载）。

例如对a->b->c 前进（b,c）刷新，c->b->a 后退（b,a）不刷新

知道路由是前进还是后退就好了，

这样的话我就能在后退的时候让`from`路由的`keepAlive`置为`false` ，

`to`路由的`keepAlive`置为`ture`，就能在再次前进时，重新加载之前这个`keepAlive`被置为`false`的路由了

但是这个需要结合鈎子函数来实现

``` vue
// App.vue
<div class="app">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
</div>
```
下面在`router/index.js`即我们的路由文件中，定义`meta`信息：

``` js
// list是我们的搜索结果页面
{      
    path: '/list',  
    name: 'List',      
    component: resolve => require(['@/pages/list'], resolve),    
    meta: {        
        isUseCache: false,  // 这个字段的意思稍后再说      
        keepAlive: true  // 通过此字段判断是否需要缓存当前组件  
    }    
}
```


说这之前，先简单说一下和缓存相关的`vue钩子函数`。

设置了`keepAlive`缓存的组件：

第一次进入：`beforeRouterEnter` ->`created`->…->`activated`->…->`deactivated`

后续进入时：`beforeRouterEnter` ->`activated`->`deactivated`

可以看出，只有第一次进入该组件时，才会走`created`钩子，而需要缓存的组件中`activated`是每次都会走的钩子函数。

所以，我们要在这个钩子里面去判断，当前组件是需要使用缓存的数据还是重新刷新获取数据。思路有了，下面我们来实现

``` js
// list组价的activated钩子
activated() {
    // isUseCache为false时才重新刷新获取数据
    // 因为对list使用keep-alive来缓存组件，所以默认是会使用缓存数据的         
    if(!this.$route.meta.isUseCache){            
        this.list = []; // 清空原有数据
        this.onLoad(); // 这是我们获取数据的函数
    } 
}
```

这里的`isUseCache` 其实就是我们用来判断是否需要使用缓存数据的字段，我们在`list`的路由的`meta`中已经默认设置为`false`，所以第一次进入`list`时是获取数据的。

当我们从详情页返回时，我们把`list`页面路由的`isUseCache`设置成`true`，这样我们在返回`list`页面时会使用缓存数据

``` js
// 详情页面的beforeRouteLeave钩子函数
beforeRouteLeave (to, from, next) {        
    if (to.name == 'List') {
        to.meta.isUseCache = true;    
    }        
    next();
}
```

我们这里是在即将离开`detail`页面前判断是否返回的列表页。

如果是返回`list`页面，则把`list`页面路由的`isUseCache`字段设置成`true`。为什么这样设置呢？

因为我们对`list`组件使用的`keep-alive`进行缓存组件，其默认就是使用缓存的。

而我们又在`list`组件的`actived`钩子函数中进行了判断：

只有在`list`页面的`isUseCache==false`时才会清空原有数据并重新获取数据。

所以此处设置`isUseCache`为`true`，此时返会`list`页面是不会重新获取数据的，而是使用的缓存数据。

`detail`返回`list`可以缓存数据了，那么`search`前往`list`页面时怎么让`lis`t页面不使用缓存数据而是获取新数据呢？我们重新回到`list`的`activated`钩子中：

``` js
// list组价的activated钩子
activated() {
    // isUseCache为false时才重新刷新获取数据
    // 因为对list使用keep-alive来缓存组件，所以默认是会使用缓存数据的         
    if(!this.$route.meta.isUseCache){            
      this.list = []; // 清空原有数据
      this.onLoad(); // 这是我们获取数据的函数
      this.$route.meta.isUseCache = false;   
    } 
}
```

我们加了一行`this.$route.meta.isUseCache=false`;也就是从`detail`返回`list`后，将`list`的`isUseCache`字段为`false`，

而从`detail`返回`list`前，我们设置了`list`的`isUseCache`为`true`。

所以，只有从`detail`返回`list`才使用缓存数据，而其他页面进入`list`是重新刷新数据的。

至此，一个前进刷新、后退返回的功能基本完成了


## 场景还原实际

比如，如果这个详情页是个订单详情，那么在订单详情页可能会有删除订单的操作。
那么删除订单操作后会返回订单列表页，是需要列表页重新刷新的。
那么我们需要此时在订单详情页进行是否要刷新的判断。简单改造一下详情页：

``` js
data () {    
    return {
        isDel: false  // 是否进行了删除订单的操作       
    }
},
beforeRouteLeave (to, from, next) {        
    if (to.name == 'List') {
        // 根据是否删除了订单的状态，进行判断list是否需要使用缓存数据
        to.meta.isUseCache = !this.isDel;                
    }        
    next();    
},
methods: {        
    deleteOrder () {       
        // 这里是一些删除订单的操作

        // 将状态变为已删除订单
        // 所以beforeRouteLeave钩子中就会将list组件路由的isUseCache设置为false    
        // 所以此时再返回list时，list是会重新刷新数据的 
        this.isDel = true; 
        this.$router.go(-1)
    }
}
```

## 用Vuex来实现后退功能

然后在一篇博客中看到是用Vuex来写的，所以这边也自己demo了下：

就是下面的代码了：

实现条件缓存：全局的`include`数组

只需要将B动态地从`include`数组中增加/删除就行了

在`Vuex`中定义一个全局的缓存数组，待传给`include`：

``` js
export default {
  namespaced: true,
  state: {
    keepAliveComponents: [] // 缓存数组
  },
  mutations: {
    keepAlive (state, component) {
      // 注：防止重复添加（当然也可以使用Set）
      !state.keepAliveComponents.includes(component) && state.keepAliveComponents.push(component)
    },
    noKeepAlive (state, component) {
      const index = state.keepAliveComponents.indexOf(component)
      index !== -1 && state.keepAliveComponents.splice(index, 1)
    }
  }
}
```

在父页面中定义`keep-alive`，并传入全局的缓存数组：

``` vue
// App.vue

<div class="app">
  <!--传入include数组-->
  <keep-alive :include="keepAliveComponents">
    <router-view></router-view>
  </keep-alive>
</div>

export default {
  computed: {
    ...mapState({
      keepAliveComponents: state => state.global.keepAliveComponents
    })
  }
}
```

缓存：在路由配置页中，约定使用`meta`属性`keepAlive`，值为`true`表示组件需要缓存。

在全局路由钩子`beforeEach`中对该属性进行处理，这样一来，每次进入该组件，都进行缓存：

``` js
const router = new Router({
  routes: [
    {
      path: '/A/B',
      name: 'B',
      component: B,
      meta: {
        title: 'B页面',
        keepAlive: true // 这里指定B组件的缓存性
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  // 在路由全局钩子beforeEach中，根据keepAlive属性，统一设置页面的缓存性
  // 作用是每次进入该组件，就将它缓存
  if (to.meta.keepAlive) {
    store.commit('global/keepAlive', to.name)
  }
})
```

取消缓存的时机：对缓存组件使用路由的组件层钩子`beforeRouteLeave`。

因为B->A->B时不需要缓存B，所以可以认为：当B的下一个页面不是C时取消B的缓存，那么下次进入B组件时B就是全新的：

``` js
export default {
  name: 'B',
  created () {
      // ...设置滚动条在最顶部
  },
  beforeRouteLeave (to, from, next) {
    // 如果下一个页面不是详情页（C），则取消列表页（B）的缓存
    if (to.name !== 'C') {
        this.$store.commit('global/noKeepAlive', from.name)
    }
    next()
  }
}
```

因为B的条件缓存，是B自己的职责，所以最好把该业务逻辑写在B的内部，而不是A中，这样不至于让组件之间的跳转关系变得混乱。

一个需要注意的细节：因为`keep-alive`组件的`include`数组操作的对象是组件名、而不是路由名，

因此我们定义每一个组件时，都要显式声明`name`属性，否则缓存不起作用。而且，一个显式的`name`对`Vue devtools`有提示作用。
