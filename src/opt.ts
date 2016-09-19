import {
  Opt, BaseOpt,
  BaseGetter, BaseCommit, BaseAction, BasePlugin,
  RawGetter, RawMutation0, RawAction0,
} from './interface'
import {StoreImpl} from './store'

type BaseRawAction = RawAction0<{}, BaseGetter, BaseCommit, BaseAction, {}, {}>
interface RawActions {
  [k: string]: BaseRawAction
}

type BaseRawMutation = RawMutation0<{}, {}>
interface RawMutations {
  [k: string]: BaseRawMutation
}

type BaseRawGetter = RawGetter<{}, BaseGetter, {}>
interface RawGetters {
  [k: string]: BaseRawGetter
}

interface Modules {
  [k: string]: OptImpl
}

/** @internal */
export class OptImpl implements BaseOpt {

  /** @internal */ _state: {}
  /** @internal */ _getters: RawGetters = {}
  /** @internal */ _actions: RawActions = {}
  /** @internal */ _mutations: RawMutations = {}
  /** @internal */ _modules: Modules = {}
  /** @internal */ _plugins: BasePlugin[]

  constructor(s: {}) {
    this._state = s
  }

  getter(key: string, f: RawGetter<string, BaseGetter, {}>) {
    this._getters[key] = f
    return this
  }

  mutation(key: string, f: BaseRawMutation) {
    this._mutations[key] = f
    return this
  }

  action(key: string, f: BaseRawAction) {
    this._actions[key] = f
    return this
  }

  module(key: string, o: OptImpl) {
    this._modules[key] = o
    return this
  }

  plugin(...plugins: BasePlugin[]) {
    this._plugins = this._plugins.concat(plugins)
    return this
  }

  done() {
    return new StoreImpl(this)
  }
}

export function create(): Opt<never, never, never, never, never>
export function create<S>(s: S): Opt<S, never, never, never, never>
export function create(s = {}): BaseOpt {
  return new OptImpl(s)
}
