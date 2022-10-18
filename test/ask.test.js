import Exchange from '../src/exchange.js'

export default doubt => {
  doubt['placing an ask as a maker on an empty orderbook should just insert']({
    because: Exchange({
      asks: [],
      bids: [],
    }).limit_order({ limit: 1, amount: 20, maker: 'john', type: 'sell' }),
    is: { asks: [{ limit: 1, amount: 20, maker: 'john' }], bids: [] },
  })

  doubt[
    'placing an ask as a maker on an existing orderbook should sort correctly'
  ]({
    because: Exchange({
      asks: [
        { limit: 3, amount: 1, maker: 'john' },
        { limit: 4, amount: 20, maker: 'john' },
        { limit: 7, amount: 10, maker: 'john' },
      ],
      bids: [],
    }).limit_order({ limit: 6, amount: 20, maker: 'john', type: 'sell' }),
    is: {
      asks: [
        { limit: 7, amount: 10, maker: 'john' },
        { limit: 6, amount: 20, maker: 'john' },
        { limit: 4, amount: 20, maker: 'john' },
        { limit: 3, amount: 1, maker: 'john' },
      ],
      bids: [],
    },
  })

  doubt[
    'placing an ask as a taker with an insufficient amount should simply eat the bid'
  ]({
    because: Exchange({
      asks: [],
      bids: [{ limit: 5, amount: 100, maker: 'bob' }],
    }).limit_order({ limit: 4, amount: 20, maker: 'john', type: 'sell' }),
    is: {
      asks: [],
      bids: [{ limit: 5, amount: 80, maker: 'bob' }],
    },
  })

  doubt[
    'placing an ask as a taker with a greater amount should execute bids and place a new ask'
  ]({
    because: Exchange({
      asks: [{ limit: 10, amount: 100, maker: 'bob' }],
      bids: [
        { limit: 8, amount: 5, maker: 'bob' },
        { limit: 5, amount: 100, maker: 'john' },
      ],
    }).limit_order({ limit: 7, amount: 20, maker: 'john', type: 'sell' }),
    is: {
      asks: [
        { limit: 10, amount: 100, maker: 'bob' },
        { limit: 7, amount: 15, maker: 'john' },
      ],
      bids: [{ limit: 5, amount: 100, maker: 'john' }],
    },
  })

  doubt['canceling an ask works correctly']({
    because: Exchange({
      asks: [{ limit: 8, amount: 100, id: 'hello' }],
      bids: [{ limit: 5, amount: 100, id: 'world' }],
    }).cancel_order('hello'),
    is: {
      asks: [],
      bids: [{ limit: 5, amount: 100, id: 'world' }],
    },
  })
}
