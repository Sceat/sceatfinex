import { PeerRPCClient } from 'grenache-nodejs-http'
import Link from 'grenache-nodejs-link'

const request = {
  type: 'order',
  data: {
    limit: 6,
    amount: 100,
    maker: 'bob',
    id: 'xxx-xxx',
    type: 'buy',
  },
  //   type: 'cancel',
  //   data: 'xxx-xxx',
}

const link = new Link({
  grape: 'http://127.0.0.1:30001',
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()
peer.request('sceatfinex', request, { timeout: 10000 }, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(-1)
  }
  console.log(data)
})
