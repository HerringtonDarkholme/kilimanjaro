import {
	Subscriber, RawGetter, CommitOption,
	WatchHandler, WatchOption,
} from './interface'
import {Opt, RawActions, RawGetters, RawMutations} from './opt'
import {State} from './state'
import devtoolPlugin from './devtool'
import applyMixin from './mixin'
import Vue = require('vue')

export interface ActionStore<S, G, M, A> {
  readonly dispatch: A
  readonly commit: M
  readonly getters: G
  readonly state: S
}

interface Getters {
  [k: string]: () => any
}

interface Mutations {
  [k: string]: Array<(t?: any, o?: CommitOption) => void>
}

interface Actions {
  [k: string]: Array<(t?: any) => Promise<any>>
}

export class Store<S, G, M, A, P> implements ActionStore<S, G, M, A> {
  readonly dispatch: A = ((k: string) => (arg?: any) => {
    let handlers = this._actions[k]
    return Promise.all(handlers.map(h => h(arg))).catch(err => {
        this._devtoolHook.emit('vuex:error', err)
        throw err
    })
  }) as any
  readonly commit: M = ((k: string) => (arg: any, opt: CommitOption) => {
  }) as any
  readonly getters: G = ((k: string) => this._vm[k]) as any

  get state(): S {
    return this._vm['state']
  }

  /** @internal */ _vm: Vue
  /** @internal */ _committing = false

  /** @internal */ _getters: Getters = {}
  /** @internal */ _mutations: Mutations = {}
  /** @internal */ _actions: Actions = {}

  /** @internal */ _devtoolHook: any


  private constructor(opt: Opt<S, G, M, A, P>) {
    let state = State.create(opt._state)
    installModules(this, opt, state)
    initVM(this, state)
    opt._plugins.concat(devtoolPlugin).forEach(p => p(this))
  }

  static create<S, G, M, A, P>(opt: Opt<S, G, M, A, P>) {
    return new Store(opt)
  }

  subscribe(fn: Subscriber<P, S>): () => void {
    return function() {
    }
  }

  private _watcherVM = new Vue()
  watch<R>(getter: RawGetter<S, R>, cb: WatchHandler<never, R>, options: WatchOption<never, R>): Function {
    return this._watcherVM.$watch(() => getter(this.state), cb, options)
  }

  replaceState(state: S): void {
    recursiveAssign(this._vm['state'], state)
  }

}

export type AnyStore = Store<{}, {}, {}, {}, {}>

let binded = false
export function install (_Vue: typeof Vue) {
  if (binded) {
    console.error(
      '[vuex] already installed. Vue.use(Vuex) should be called only once.'
    )
    return
  }
  applyMixin(Vue)
  binded = true
}

type AnyOpt = Opt<{}, {}, {}, {}, {}>

function installModules(store: AnyStore, opt: AnyOpt, state: State) {
  const modules = opt._modules
  for (let key of keysOf(modules)) {
    let moduleOpt = modules[key]
    let subState = state.avtsModuleState[key] = State.create(moduleOpt._state)
    installModules(store, moduleOpt, subState)
  }
  registerGetters(store, opt._getters, state)
  registerMutations(store, opt._mutations, state)
  registerActions(store, opt._actions, state)
}

function registerGetters(store: AnyStore, getters: RawGetters<{}>, state: State) {
  for (let key of keysOf(getters)) {
    store._getters[key] = () => getters[key](state)
  }
}

function registerMutations(store: AnyStore, mutations: RawMutations<{}>, state: State) {
  const _mutations = store._mutations
  for (let key of keysOf(mutations)) {
    _mutations[key] = _mutations[key] || []
    const mutation = mutations[key](state)
    _mutations[key].push(mutation)
  }
}

function registerActions(store: AnyStore, actions: RawActions<{}, {}, {}, {}>, state: State) {
  const _actions = store._actions
  for (let key of keysOf(actions)) {
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

function initVM(store: AnyStore, state: State) {
  // feed getters to vm as getters
  // this enable lazy-caching
  let computed = {}
  let wrappedGetters = store._getters
  for (let key of keysOf(wrappedGetters)) {
    computed[key] = wrappedGetters[key]
  }

  const silent = Vue.config.silent
  Vue.config.silent = false
  store._vm = new Vue({
    data: {state},
    computed: computed,
  })
  Vue.config.silent = silent

}

function keysOf(obj: any): string[] {
  return Object.keys(obj)
}

function recursiveAssign(o: Object, n: Object) {
  for (let key of keysOf(o)) {
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
