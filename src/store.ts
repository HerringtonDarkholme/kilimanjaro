import {
  VueGetter, CommitOption,
  WatchHandler, WatchOption, Unsubscription,
  BaseStore, BaseSubscriber, BaseHelper,
  MutationHandler0, F01,
} from './interface'
import OptImpl, {ActDefs, RawGetters, MutateDefs} from './opt'
import State from './state'
import devtoolPlugin from './devtool'
import Vue = require('vue')
import {createMap} from 'av-ts/dist/src/util'

const dispatchImpl = (store: StoreImpl) => (type: string, payload?: {}) => {
  let handlers = store._actions[type]
  if (!handlers) {
    console.error(`unknown action type: ${type}`)
    return null as any
  }
  return Promise.all(handlers.map(h => h(payload))).catch(err => {
    store._devtoolHook && store._devtoolHook.emit('vuex:error', err)
    throw err
  })
}

const commitImpl = (store: StoreImpl) => (type: string, payload?: {}, opt?: CommitOption) => {
  const mutation = {type, payload}
  let handlers = store._mutations[type]
  if (!handlers) {
    console.error(`unknown action type: ${type}`)
    return
  }
  handlers.forEach(h => h(payload))

  if (!opt || !opt.silent) {
    store._subscribers.forEach(s => s(mutation, store.state))
  }
}

const getterImpl = (store: StoreImpl) => (key: string) => store._vm[key]

/** @internal */
export default class StoreImpl implements BaseStore {

   _vm: Vue

   _getters = createMap<() => {}>()
   _mutations = createMap<MutationHandler0<{}>[]>()
   _actions = createMap<F01<{}, {} | Promise<{}>>[]>()
   _subscribers: BaseSubscriber[] = []
   _helper: BaseHelper

   _devtoolHook?: {emit: Function}

  readonly dispatch = dispatchImpl(this)
  readonly commit = commitImpl(this)
  readonly getters = getterImpl(this)

  get state() {
    return this._vm['state']
  }

  /** @internal */ constructor(opt: OptImpl) {
    let state = new State(opt._state)
    installModules(this, opt, state)
    initVM(this, state)
    opt._plugins.concat(devtoolPlugin).forEach(p => p(this))
  }

  subscribe(fn: BaseSubscriber): Unsubscription {
    const subs = this._subscribers
    if (subs.indexOf(fn) < 0) {
      subs.push(fn)
    }
    return () => {
      const i = subs.indexOf(fn)
      if (i > -1) {
        subs.splice(i, 1)
      }
    }
  }

  private _watcherVM = new Vue()
  watch<R>(getter: VueGetter<{}, R>, cb: WatchHandler<never, R>, options: WatchOption<never, R>): Function {
    return this._watcherVM.$watch(() => getter(this.state), cb, options)
  }

  replaceState(state: {}): void {
    recursiveAssign(this._vm['state'], state)
  }

}


function installModules(store: StoreImpl, opt: OptImpl, state: State) {
  const modules = opt._modules
  for (let key in modules) {
    let moduleOpt = modules[key]
    let subState = state.avtsModuleState[key] = new State(moduleOpt._state)
    installModules(store, moduleOpt, subState)
  }
  registerGetters(store, opt._getters, state)
  registerMutations(store, opt._mutations, state)
  registerActions(store, opt._actions, state)
}

function registerGetters(store: StoreImpl, getters: RawGetters, state: State) {
  for (let key in getters) {
    store._getters[key] = () => getters[key](state, store.getters)
  }
}

function registerMutations(store: StoreImpl, mutations: MutateDefs, state: State) {
  const _mutations = store._mutations
  for (let key in mutations) {
    _mutations[key] = _mutations[key] || []
    const mutation = mutations[key](state)
    _mutations[key].push(mutation)
  }
}

function registerActions(store: StoreImpl, actions: ActDefs, state: State) {
  const _actions = store._actions
  for (let key in actions) {
    _actions[key] = _actions[key] || []
    const action = actions[key]({
      state: state,
      getters: store.getters,
      commit: store.commit,
      dispatch: store.dispatch,
    })
    _actions[key].push(action)
  }
}

function initVM(store: StoreImpl, state: State) {
  // feed getters to vm as getters
  // this enable lazy-caching
  const silent = Vue.config.silent
  Vue.config.silent = false
  store._vm = new Vue({
    data: {state},
    computed: store._getters,
  })
  Vue.config.silent = silent

}

function recursiveAssign(o: Object, n: Object) {
  for (let key of Object.keys(o)) {
    let oVal = o[key]
    let nVal = n[key]
    if (isObj(oVal) && isObj(nVal)) {
      recursiveAssign(oVal, nVal)
    } else {
      o[key] = n[key]
    }
  }
}

function isObj(o: any) {
  return o !== null && typeof o === 'object'
}
