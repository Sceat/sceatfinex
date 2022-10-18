import Exchange from '../src/exchange.js'

export default doubt => {
  doubt['placing a bid as a maker on an empty orderbook should just insert']({
    because: Exchange({
      asks: [],
      bids: [],
    }).limit_order({ limit: 1, amount: 20, maker: 'john', type: 'buy' }),
    is: { asks: [], bids: [{ limit: 1, amount: 20, maker: 'john' }] },
  })

  doubt[
    'placing a bid as a maker on an existing orderbook should sort correctly'
  ]({
    because: Exchange({
      asks: [],
      bids: [
        { limit: 7, amount: 10, maker: 'john' },
        { limit: 4, amount: 20, maker: 'john' },
        { limit: 3, amount: 1, maker: 'john' },
      ],
    }).limit_order({ limit: 6, amount: 20, maker: 'john', type: 'buy' }),
    is: {
      asks: [],
      bids: [
        { limit: 7, amount: 10, maker: 'john' },
        { limit: 6, amount: 20, maker: 'john' },
        { limit: 4, amount: 20, maker: 'john' },
        { limit: 3, amount: 1, maker: 'john' },
      ],
    },
  })

  doubt[
    'placing a bid as a taker with an insufficient amount should simply eat the ask'
  ]({
    because: Exchange({
      asks: [{ limit: 5, amount: 100, maker: 'bob' }],
      bids: [],
    }).limit_order({ limit: 10, amount: 20, maker: 'john', type: 'buy' }),
    is: {
      asks: [{ limit: 5, amount: 80, maker: 'bob' }],
      bids: [],
    },
  })

  doubt[
    'placing a bid as a taker with a greater amount should execute asks and place a new bid'
  ]({
    because: Exchange({
      asks: [
        { limit: 9, amount: 100, maker: 'bob' },
        { limit: 5, amount: 5, maker: 'bob' },
      ],
      bids: [{ limit: 2, amount: 100, maker: 'bob' }],
    }).limit_order({ limit: 7, amount: 20, maker: 'john', type: 'buy' }),
    is: {
      asks: [{ limit: 9, amount: 100, maker: 'bob' }],
      bids: [
        { limit: 7, amount: 15, maker: 'john' },
        { limit: 2, amount: 100, maker: 'bob' },
      ],
    },
  })

  doubt['canceling a bid works correctly']({
    because: Exchange({
      asks: [{ limit: 8, amount: 100, id: 'hello' }],
      bids: [{ limit: 5, amount: 100, id: 'world' }],
    }).cancel_order('world'),
    is: {
      asks: [{ limit: 8, amount: 100, id: 'hello' }],
      bids: [],
    },
  })
}
