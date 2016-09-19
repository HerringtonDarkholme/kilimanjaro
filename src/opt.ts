import {
  Opt, BaseOpt,
  BaseGetter, BaseCommit, BaseDispatch, BasePlugin,
  GetDef, MutateDef0, ActDef0,
} from './interface'
import {StoreImpl} from './store'

type BaseActDef = ActDef0<{}, BaseGetter, BaseCommit, BaseDispatch, {}, {}>
interface ActDefs {
  [k: string]: BaseActDef
}

type BaseMutateDef = MutateDef0<{}, {}>
interface MutateDefs {
  [k: string]: BaseMutateDef
}

type BaseRawGetter = GetDef<{}, BaseGetter, {}>
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
  /** @internal */ _actions: ActDefs = {}
  /** @internal */ _mutations: MutateDefs = {}
  /** @internal */ _modules: Modules = {}
  /** @internal */ _plugins: BasePlugin[]

  constructor(s: {}) {
    this._state = s
  }

  getter(key: string, f: GetDef<string, BaseGetter, {}>) {
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
