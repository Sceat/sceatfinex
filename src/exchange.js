import logger from './logger.js'

const log = logger(import.meta)

// this function is a higher-order mapping function
// that simply try to merge a limit order to an entire orderbook
const apply_order = order => observed_order => {
  const can_take =
    order.type === 'buy'
      ? order.limit > observed_order.limit
      : order.limit < observed_order.limit
  if (order.amount <= 0 || !can_take) return observed_order
  const credited_amount = Math.max(
    0,
    Math.min(order.amount, observed_order.amount)
  )
  // credit maker of amount (i did not implement accounts)
  log.info(
    { credited_amount, maker: observed_order.maker },
    'crediting account'
  )

  // exceptional use of a mutation, would be nice to remove
  order.amount -= observed_order.amount
  return { ...observed_order, amount: observed_order.amount - credited_amount }
}

// function filter
const positive_orders_only = order => order.amount > 0

// functional style way of acting on a state,
// it gives a few functions to manipulate the orderbook
const book = orders => ({
  // inserting an order
  insert: ({ type, ...order }) =>
    [...orders, order].sort(({ limit: l1 }, { limit: l2 }) => l2 - l1),
  // canceling an order
  cancel: id => orders.filter(order => order.id !== id),
  // merging the order
  apply: (order, can_take) =>
    orders.map(apply_order(order, can_take)).filter(positive_orders_only),
  empty: !orders.length,
  orders,
})

export default ({ asks, bids }) => {
  const wrapped_bids = book(bids)
  const wrapped_asks = book(asks)
  return {
    // place a limit order on a given book
    limit_order: order => {
      log.info(order, 'executing order')
      if (order.type === 'buy') {
        const { orders } = wrapped_asks
        if (wrapped_asks.empty || order.limit < orders.at(-1).limit)
          return {
            asks,
            bids: wrapped_bids.insert(order),
          }
        // this need to be called here as it's mutating `order`
        // this is a flaw in the design but not enough time
        const new_asks = wrapped_asks.apply(order)
        return {
          asks: new_asks,
          bids: order.amount > 0 ? wrapped_bids.insert(order) : bids,
        }
      }

      const { orders } = wrapped_bids
      if (wrapped_bids.empty || order.limit > orders[0].limit)
        return {
          asks: wrapped_asks.insert(order),
          bids,
        }

      // this need to be called here as it's mutating `order`
      // this is a flaw in the design but not enough time
      const new_bids = wrapped_bids.apply(order)
      return {
        asks: order.amount > 0 ? wrapped_asks.insert(order) : asks,
        bids: new_bids,
      }
    },
    cancel_order: id => ({
      asks: wrapped_asks.cancel(id),
      bids: wrapped_bids.cancel(id),
    }),
  }
}
