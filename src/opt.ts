import {
  Opt, BaseOpt,
  BaseGetters, BaseCommit, BaseDispatch, BasePlugin,
  GetDef, MutateDef0, ActDef0,
} from './interface'
import {StoreImpl} from './store'

type BaseActDef = ActDef0<{}, BaseGetters, BaseCommit, BaseDispatch, {}, {}>
/** @internal */
export interface ActDefs {
  [k: string]: BaseActDef
}

type BaseMutateDef = MutateDef0<{}, {}>
/** @internal */
export interface MutateDefs {
  [k: string]: BaseMutateDef
}

type BaseRawGetter = GetDef<{}, BaseGetters, {}>
/** @internal */
export interface RawGetters {
  [k: string]: BaseRawGetter
}

interface Modules {
  [k: string]: OptImpl
}

/** @internal */
export class OptImpl implements BaseOpt {

  _state: {}
  _getters: RawGetters = {}
  _actions: ActDefs = {}
  _mutations: MutateDefs = {}
  _modules: Modules = {}
  _plugins: BasePlugin[] = []

  constructor(s: {}) {
    this._state = s
  }

  getter(key: string, f: GetDef<string, BaseGetters, {}>) {
    this._getters[key] = f
    return this
  }

  mutation(key: string, f: BaseMutateDef) {
    this._mutations[key] = f
    return this
  }

  action(key: string, f: BaseActDef) {
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
