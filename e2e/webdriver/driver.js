const {until, By} = require('selenium-webdriver')

class Driver {
  /**
   * @param {!ThenableWebDriver} driver a {@code WebDriver} instance
   * @param {number} timeout
   */
  constructor (driver, extensionUrl, timeout = 10000) {
    this.driver = driver
    this.extensionUrl = extensionUrl
    this.timeout = timeout
  }

  getHome () {
    return this.driver.get(`${this.extensionUrl}/home.html`)
  }

  getNotification () {
    return this.driver.get(`${this.extensionUrl}/notification.html`)
  }

  getPopup () {
    return this.driver.get(`${this.extensionUrl}/popup.html`)
  }

  /**
   * @param {string} selector the CSS selector to use
   * @return {Promise<any>}
   */
  findElement (selector) {
    return this.driver.wait(until.elementLocated(By.css(selector)), this.timeout)
  }

  /**
   * @param {string} selector the CSS selector to use
   * @return {Promise<void>}
   */
  async clickElement (selector) {
    const element = await this.findElement(selector)
    await element.click()
  }

  /**
   * @param {string} query the XPath selector to use
   * @return {Promise<void>}
   */
  async clickElementXPath (query) {
    const element = await this.driver.wait(until.elementLocated(By.xpath(query)), this.timeout)
    await element.click()
  }

  delay (time) {
    return new Promise(resolve => setTimeout(resolve, time))
  }

  async executeScript (script) {
    return this.driver.executeScript(script)
  }
}

module.exports = Driver
