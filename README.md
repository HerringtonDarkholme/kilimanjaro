Kilimanjaro
----

Awesome Vuex2.0 for TypeScript2.0

It provide a concise, idiomatic and type safe Vuex like API for TypeScript.


Example
----

```typescript
import {create} from 'kilimanjaro'

var rabbitHouse = create({
    cappuccino: 'coffee',
    hotCocoa: 'drink',
    'Thé des Alizés': 'tea',
    order: 0,
  })
  .getter('coffee', state => state.cappuccino)
  .mutation('pay_check', state => () => state.order += 1)
  .action('order', store => kind => {
    if (kind === 'tea') console.log('ordered tea!')
    store.commit('pay_check') // commit mutation without payload
  })

var sweetRabbitCafe = create({
    matcha: 'tea',
    anko: 'sweets',
    kilimanjaro: 'coffee',
    ankoAmount: 10,
    matchaAmount: 5,
  })
  // we need leave enough anko for matcha dessert!
  .getter('remainingAnko', state => state.ankoAmount - state.matchaAmount)
  .mutation('eat_sweet', state => n => state.ankoAmount -= n)
  .action('order_anko', store => n => {
    if (store.getters('remainingAnko') < n) return console.log('no enough anko!')
    store.commit('eat_sweet', n) // commit payload
  })

var allCoffeeShop = create()
  .module('rabbitHouse', rabbitHouse)
  .module('sweetRabbitCafe', sweetRabbitCafe)
  .action('order a rabbit', store => () => {
    // get all coffee from module
    store.getters('coffee')
    // commit mutations defined in module
    store.commit('pay_check')
    // dispatch returns a promise
    store.dispatch('eat_sweet', 2).then(() => console.log('done!'))
    // get sub state
    store.state.$('rabbitHouse')
  })


// components
import {Store, getHelper} from 'kilimanjaro'
import {Component} from 'av-ts'

const { getters, commit } = getHelper(rabbitHouse)

@Component
class Comp extends Vue {
  @Store coffee = getter('coffee')
  @Store payCheck = commit('pay_check')
}
```
