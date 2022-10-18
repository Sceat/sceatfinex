import { pipeline, PassThrough } from 'stream'

import Doubt from '@hydre/doubt'
import reporter from 'tap-spec-emoji'

import test_bids from './bid.test.js'
import test_asks from './ask.test.js'

const through = new PassThrough()

pipeline(through, reporter(), process.stdout, () => {})

const doubt = Doubt({
  stdout: through,
  title: 'Testing is simple',
  calls: 10,
})

test_bids(doubt)
test_asks(doubt)
