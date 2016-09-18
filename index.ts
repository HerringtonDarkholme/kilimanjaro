import applyMixin from './src/mixin'
import Vue = require('vue')

let binded = false
export function install (_Vue: typeof Vue) {
  if (binded) {
    console.error(
      '[vuex] already installed. Vue.use(Vuex) should be called only once.'
    )
    return
  }
  applyMixin(_Vue)
  binded = true
}

export {Vuex} from './src/decorator'
export {create} from './src/opt'
