# sceatfinex

> A simplified distributed exchange

## Preface and thought process

This test was interesting, thanks for proposing it. I tried to respect the given tool/lib usage and indicated timespan (8h).
When it comes to build such project i would separate concerns in multiples independant services. Here i built the main one which
is the orderbook system. Then there would be accounts, client apis, etc..

As for distribution, i would delegate it to a robust and atomic system like redis. While it is fun to build ourselve with stuff like zeromq,
i believe it's overhead. I didn't managed to understand the grenache tool enough to have a working distribution but here was my ideas:

- Storing a default orderbook in the DHT
  - and yet i'm not sur how grenache link can be used as it simply gives back a hash with no deterministic query
  - which means i would need a pub/sub on top to inform other nodes of the hash so that they can sync up
- Inform others nodes of new entries each time an order is sent
  - using a service which handle atomic operations is recommended, otherwise i'd implement a lock system
- A main reducer in the service would listen to both request **and** orderbook updates so that each nodes remains up to date
  - in `server.js` i use an async iterator in which you can combine multiple sources of events
  - this is solving concurrency and allows a single state (like with transactions)

## Usage

As per the instructions, boot 2 nodes

```
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

Then boot a server instance

> distribution doesn't work in this poc, so only one instance

```
npm run start:server
```

Write a request and start the client to send it to the server.
In the `client.js` file you can switch between the 2 order types

```js
const request = {
  type: 'order', // order, cancel
  data: {
    limit: 6,
    amount: 100,
    maker: 'bob', // just to log the crediting process
    id: 'xxx-xxx', // a id which would be generated in production
    type: 'buy', // buy, sell
  },
  //   type: 'cancel',
  //   data: 'xxx-xxx',
}
```

The server will respond with the new orderbook state,

```
{
  asks: [],
  bids: [ { limit: 6, amount: 100, maker: 'bob', id: 'xxx-xxx' } ]
}
```

Feel free to play with different combination.
