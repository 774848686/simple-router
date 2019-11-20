class VueRouter {
  constructor (options) {
    const { routes= [], mode='hash' } = options;
    this.routers = routes;
    this.mode = mode;
    // 将路由表进行map成一个{'/home':Home,'/about':About}数组
    this.routersMap = this._createMap(routes);
    this.history = {current: null};
    this._init();
  }
  _createMap (routers) {
    return routers.reduce((memo, current) => {
      memo[current.path] = current.component;
      return memo;
    }, {})
  }
  _bind () {
    window.addEventListener('load', () => {
      if (this.mode === 'hash') {
        location.hash ? '' : location.hash = '/';
        this.history.current = location.hash.slice(1);
        window.addEventListener('hashchange', () => {
          this.history.current = location.hash.slice(1);
        });
      }else {
        location.pathname ? '' : location.pathname = '/';
        this.history.current = location.pathname;
        window.addEventListener('popstate', () => {
          this.history.current = location.pathname;
        })
      }
    })
  }
  _init () {
    this._bind();
  }
}
VueRouter.install = function (Vue, opts) {
  // 进行this.$router和this.$route的绑定
  // 其中的this指向的是这个组件，
  Vue.mixin({
    // 通过这个mixin 进行各个组件的实例挂载
    beforeCreate() {
      if (this.$options && this.$options.router) {
        this._root = this; // 把当前实例挂载在_root上面
        this._router = this.$options.router; // 把router 挂载在_router上 
        Vue.util.defineReactive(this, 'history', this._router.history); //vue 内部实现的双向绑定方法 通过Object.definePropty set get
      }else {
        this._root = this.$parent._root; // vue组件渲染顺序是父--->子---->孙 即可在每个组件上取到父_root 给自己_root实现每个组件共享router实例
      }
      Object.defineProperty(this, '$router', {
        get() {
          return this._root._router;
        }
      })
      Object.defineProperty(this, '$route', {
        get() {
          return {
            current: this._root._router.history.current
          }
        }
      })
    }
  })
  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        default: ''
      }
    },
    render(h) {
      let mode = this._root._router.mode;
      return <a href={mode === 'hash' ? `#${this.to}` : this.to}>
               {this.$slots.default}
             </a>
    }
  })
  Vue.component('router-view', {
    render(h) {
      // 通过数据双向绑定进行视图更新
      let current = this._self._root._router.history.current;
      let routersMap = this._self._root._router.routersMap;
      return h(routersMap[current]);
    }
  });
}
export default VueRouter;
