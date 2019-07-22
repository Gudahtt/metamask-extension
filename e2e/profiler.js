#!/usr/bin/env node

const { Key } = require('selenium-webdriver')
const get = require('lodash.get')
const { withFixtures } = require('./')

const DEFAULT_NUM_RUNS = 10

function collectMetrics () {
  const results = {
    paint: null,

  }

  performance.getEntriesByType('paint').forEach((paintEntry) => {
    if (!results.paint) {
      results.paint = {}
    }
    results.paint[paintEntry.name] = paintEntry.startTime
  })

  performance.getEntriesByType('navigation').forEach((navigationEntry) => {
    if (!results.navigation) {
      results.navigation = []
    }
    results.navigation.push({
      domContentLoaded: navigationEntry.domContentLoadedEventEnd,
      load: navigationEntry.loadEventEnd,
      domInteractive: navigationEntry.domInteractive,
      redirectCount: navigationEntry.redirectCount,
      type: navigationEntry.type,
    })
  })

  return results
}

async function measurePage (pageName) {
  let metrics
  await withFixtures('simple-send', async ({driver}) => {
    await driver.getHome()
    await driver.findElement('#password').sendKeys('password')
    await driver.findElement('#password').sendKeys(Key.ENTER)
    if (pageName === 'home') {
      await driver.getHome()
    } else if (pageName === 'notification') {
      await driver.getNotification()
    } else if (pageName === 'popup') {
      await driver.getPopup()
    }
    await driver.delay(1000)
    metrics = await driver.executeScript(collectMetrics)
  })
  return metrics
}

function calculateResult (calc) {
  return (result) => {
    const calculatedResult = {}
    for (const key of Object.keys(result)) {
      calculatedResult[key] = calc(result[key])
    }
    return calculatedResult
  }
}
const calculateSum = (array) => array.reduce((sum, val) => sum + val)
const calculateAverage = (array) => calculateSum(array) / array.length
const minResult = calculateResult((array) => Math.min(...array))
const maxResult = calculateResult((array) => Math.max(...array))
const averageResult = calculateResult(array => calculateAverage(array))
const standardDeviationResult = calculateResult((array) => {
  const average = calculateAverage(array)
  const squareDiffs = array.map(value => Math.pow(value - average, 2))
  return Math.sqrt(calculateAverage(squareDiffs))
})

async function main () {
  const pages = ['notification']
  const results = {}
  for (const pageName of pages) {
    const runResults = []
    for (let i = 0; i < DEFAULT_NUM_RUNS; i += 1) {
      runResults.push(await measurePage(pageName))
    }

    if (runResults.some(result => result.navigation.lenth > 1)) {
      throw new Error(`Multiple navigations not supported`)
    } else if (runResults.some(result => result.navigation[0].type !== 'navigate')) {
      throw new Error(`Navigation type ${runResults.find(result => result.navigation[0].type !== 'navigate').navigation[0].type} not supported`)
    }

    const result = {
      firstPaint: runResults.map(result => get(result, 'paint["first-paint"]')),
      domContentLoaded: runResults.map(result => get(result, 'navigation[0].domContentLoaded')),
      load: runResults.map(result => get(result, 'navigation[0].load')),
      domInteractive: runResults.map(result => get(result, 'navigation[0].domInteractive')),
    }

    results.pageName = {
      min: minResult(result),
      max: maxResult(result),
      average: averageResult(result),
      standardDeviation: standardDeviationResult(result),
    }
  }
  console.log(JSON.stringify(results, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
