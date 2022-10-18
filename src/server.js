import { on } from 'events'

import { PeerRPCServer } from 'grenache-nodejs-http'
import Link from 'grenache-nodejs-link'
import { aiter } from 'iterator-helper'

import Exchange from './exchange.js'
import logger from './logger.js'

const log = logger(import.meta)
const link = new Link({
  grape: 'http://127.0.0.1:30001',
})

link.start()

// link.get('0cb84eca7dfcb251316518793c245b178a9f8943', (err, result) => {
//   if (err) console.error(err)
//   else console.dir({ result })
// })

// link.put({ v: JSON.stringify(orderbook) }, (err, hash) => {
//   if (err) console.error(err)
//   else console.dir({ hash })
//   if (hash) {
//     link.get(hash, (err, result) => {
//       if (err) console.error(err)
//       else console.dir({ result })
//     })
//   }
// })

const peer = new PeerRPCServer(link, { timeout: 300000 })
peer.init()

const server = peer.transport('server')
server.listen(5024 + Math.floor(Math.random() * 1000))
log.info({ port: server.port }, 'sceatfinex worker listening ☘️ ')
link.startAnnouncing('sceatfinex', server.port, { interval: 1000 })

const execute_request = ({ orderbook, type, data }) => {
  switch (type) {
    case 'order':
      return Exchange(orderbook).limit_order(data)
    case 'cancel':
      return Exchange(orderbook).cancel_order(data)
    default:
      return null
  }
}

await aiter(on(server, 'request'))
  .map(([rid, key, { type, data }, handler]) => ({ type, data, handler }))
  .reduce(
    (orderbook, { type, data, handler }) => {
      const updated_book = execute_request({ orderbook, type, data })
      if (updated_book) handler.reply(null, updated_book)
      else handler.reply(null, 'Unsuported request type')
      return updated_book ?? orderbook
    },
    {
      asks: [],
      bids: [],
    }
  )
