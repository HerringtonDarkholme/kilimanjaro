import {create} from '../src/opt'

var rabbitHouse = create({
    cappuccino: 'coffee',
    hotCocoa: 'drink',
    'Thé des Alizés': 'tea',
    order: 0,
  })
  .getter('coffee', state => state.cappuccino)
  .mutation('pay_check0', state => () => state.order += 1)
  .mutation('pay_check', state => (n?: number) => state.order += 1)
  .mutation('pay_check1', state => (n: number) => state.order += 1)
  .mutation('pay_check2', state => (n = 2) => state.order += 1)
  .action('order', store => (kind?: string) => {
    if (kind === 'tea') console.log('ordered tea!')
    store.commit('pay_check')() // just call thunk for mutation without payload
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
  .mutation('eat_sweet', state => (n: number) => state.ankoAmount -= n)
  .action('order_anko', store => (n: number) => {
    if (store.getters('remainingAnko') < n) return console.log('no enough anko!')
    store.commit('eat_sweet', n) // commit payload
  })
  .action('order0', store => () => {})
  .action('order1', store => (kind: string) => {})
  .action('order2', store => (kind = 'coffee') => {})

var allCoffeeShop = create()
  .module('rabbitHouse', rabbitHouse)
  .module('sweetRabbitCafe', sweetRabbitCafe)
  .action('order a rabbit', store => () => {
    // get all coffee from module
    store.getters('coffee')
    // commit mutations defined in module
    store.commit('pay_check')()
    // dispatch returns a promise
    store.dispatch('order_anko', 2).then(() => console.log('done!'))
    // get sub state
    store.state.$('rabbitHouse')
  })
  .plugin(s => {
    s.subscribe(cmt => {
      switch (cmt.type) {
        case 'eat_sweet':
          cmt.payload == 123
          break
      }
    })
  })
  .done()


var commit = allCoffeeShop.commit
var dispatch = allCoffeeShop.dispatch


//should compile
commit('pay_check', undefined, {silent: true})
commit('pay_check', 123)
commit('pay_check', 123, {silent: false})
commit('pay_check0')
commit('pay_check0', undefined, {silent: true})
commit('pay_check1', 123)
commit('pay_check2')
commit('pay_check2', 123)

dispatch('order', 'string')
dispatch('order')
dispatch('order0')
dispatch('order1', '123')
dispatch('order2')
dispatch('order2', '123')

// should not compile
commit('pay_check0', 123)
// commit('pay_check', '123')
// commit('pay_check', {silent: true})
// commit('pay_check1')
// commit('pay_check1', '123')
// commit('pay_check2', '123')

dispatch('order0', 'ss')
// dispatch('order', 123)
// dispatch('order1')
// dispatch('order1', 123)
// dispatch('order2', 123)
