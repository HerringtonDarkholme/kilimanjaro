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
    store.commit('eat_sweet')(n) // commit payload
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
    store.dispatch('order_anko')(2).then(() => console.log('done!'))
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

var payCheck = commit('pay_check')
var payCheck0 = commit('pay_check0')
var payCheck1 = commit('pay_check1')
var payCheck2 = commit('pay_check2')

var order = dispatch('order')
var order0 = dispatch('order0')
var order1 = dispatch('order1')
var order2 = dispatch('order2')

//should compile
payCheck(undefined, {silent: true})
payCheck(123)
payCheck(123, {silent: false})
payCheck0()
payCheck0(undefined, {silent: true})
payCheck1(123)
payCheck2()
payCheck2(123)

order('string')
order()
order0()
order1('123')
order2()
order2('123')

// should not compile
payCheck0(123)
// payCheck('123')
// payCheck({silent: true})
// payCheck1()
// payCheck1('123')
// payCheck2('123')

order0('ss')
// order(123)
// order1()
// order1(123)
// order2(123)
