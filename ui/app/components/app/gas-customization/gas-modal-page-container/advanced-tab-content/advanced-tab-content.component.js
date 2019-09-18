import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Loading from '../../../../ui/loading-screen'
import GasPriceChart from '../../gas-price-chart'
import AdvancedGasInputs from '../../advanced-gas-inputs'

export default class AdvancedTabContent extends Component {
  static contextTypes = {
    t: PropTypes.func,
  }

  static propTypes = {
    updateCustomGasPrice: PropTypes.func,
    updateCustomGasLimit: PropTypes.func,
    customModalGasPriceInHex: PropTypes.string,
    customModalGasLimitInHex: PropTypes.string,
    gasEstimatesLoading: PropTypes.bool,
    millisecondsRemaining: PropTypes.number,
    transactionFee: PropTypes.string,
    timeRemaining: PropTypes.string,
    gasChartProps: PropTypes.object,
    insufficientBalance: PropTypes.bool,
    customPriceIsSafe: PropTypes.bool,
    isSpeedUp: PropTypes.bool,
    isEthereumNetwork: PropTypes.bool,
  }

  renderDataSummary (transactionFee, timeRemaining) {
    return (
      <div className="advanced-tab__transaction-data-summary">
        <div className="advanced-tab__transaction-data-summary__titles">
          <span>{ this.context.t('newTransactionFee') }</span>
          <span>~{ this.context.t('transactionTime') }</span>
        </div>
        <div className="advanced-tab__transaction-data-summary__container">
          <div className="advanced-tab__transaction-data-summary__fee">
            {transactionFee}
          </div>
          <div className="advanced-tab__transaction-data-summary__time-remaining">{timeRemaining}</div>
        </div>
      </div>
    )
  }

  render () {
    const { t } = this.context
    const {
      updateCustomGasPrice,
      updateCustomGasLimit,
      timeRemaining,
      customModalGasPriceInHex,
      customModalGasLimitInHex,
      insufficientBalance,
      gasChartProps,
      gasEstimatesLoading,
      customPriceIsSafe,
      isSpeedUp,
      transactionFee,
      isEthereumNetwork,
    } = this.props

    return (
      <div className="advanced-tab">
        { this.renderDataSummary(transactionFee, timeRemaining) }
        <div className="advanced-tab__fee-chart">
          <AdvancedGasInputs
            updateCustomGasPrice={updateCustomGasPrice}
            updateCustomGasLimit={updateCustomGasLimit}
            customGasPrice={customModalGasPriceInHex}
            customGasLimit={customModalGasLimitInHex}
            insufficientBalance={insufficientBalance}
            customPriceIsSafe={customPriceIsSafe}
            isSpeedUp={isSpeedUp}
          />
          { isEthereumNetwork
            ? <div>
              <div className="advanced-tab__fee-chart__title">{ t('liveGasPricePredictions') }</div>
              {!gasEstimatesLoading
                ? <GasPriceChart {...gasChartProps} updateCustomGasPrice={updateCustomGasPrice} />
                : <Loading />
              }
              <div className="advanced-tab__fee-chart__speed-buttons">
                <span>{ t('slower') }</span>
                <span>{ t('faster') }</span>
              </div>
            </div>
            : <div className="advanced-tab__fee-chart__title">{ t('chartOnlyAvailableEth') }</div>
          }
        </div>
      </div>
    )
  }
}
