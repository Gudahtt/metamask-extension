const path = require('path')

const fixtures = require('./fixtures')
const {Ganache} = require('./ganache')
const fixtureServer = new fixtures.FixtureServer()


async function runGanache () {
  fixtureServer.loadState(path.join(__dirname, 'fixtures', 'simple-send'), async ({ganacheOptions}) => {
    const ganache = new Ganache()
    await ganache.start(ganacheOptions)
  })
}

runGanache()
  .catch(console.error)
