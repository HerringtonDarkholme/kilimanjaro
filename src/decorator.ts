import Vue = require('vue')
import {$$Prop} from 'av-ts/dist/src/interface'
import {Component} from 'av-ts'
import {
  Store, BG, BC, BD, BP, BCH, BDH,
  Helper,
} from './interface'
import {StoreImpl} from './store'

const VUEX_PROP = '$$Vuex' as $$Prop

const GetterKey = '__isgetter'


export function Vuex(target: Vue, key: string): void {
  let vuexProps = target[VUEX_PROP] = target[VUEX_PROP] || []
  vuexProps.push(key)
}

// we return a fake getter in helper to achieve a good API surface
// at compile time, helper.getters(key) return a value T
// at runtime, helper.getters(key) return a function that return value T
// so @Vuex getter = getters(key) will resolve to T at type level
// while on value level vuex decorator can wrap it in vue's `computed` field
export function getHelper<G extends BG, CH extends BCH, DH extends BDH>(store: Store<{}, G, BC, BD, BP, CH, DH>): Helper<G, CH, DH> {
  if (store._helper) return store._helper
  const impl: StoreImpl = store as any
  return impl._helper = ({
    getters(k: string) {
      let getter = impl._getters[k]
      getter[GetterKey] = true // a flag to distinguish between methods and computed
      return getter
    },
    commit: store.commit,
    dispatch: store.dispatch,
  } as any)
}

Component.register(VUEX_PROP, function(target, instance, optionsToWrite) {
  let vuexProps: string[] = target[VUEX_PROP]
  for (let key of vuexProps) {
    let handler = instance[key]
    if (handler[GetterKey]) {
      optionsToWrite.computed![key] = handler
    } else if (typeof handler === 'function'){
      optionsToWrite.methods![key] = handler
    }
    delete instance[key]
  }
})
