import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import debounce from 'lodash.debounce'

const GAS_EDIT_TYPE = {
  GAS_PRICE: 'GAS_PRICE',
  GAS_LIMIT: 'GAS_LIMIT',
}

export default class AdvancedGasInputs extends Component {
  static contextTypes = {
    t: PropTypes.func,
  }

  static propTypes = {
    updateCustomGasPrice: PropTypes.func,
    updateCustomGasLimit: PropTypes.func,
    customGasPrice: PropTypes.number,
    customGasLimit: PropTypes.number,
    insufficientBalance: PropTypes.bool,
    customPriceIsSafe: PropTypes.bool,
    isSpeedUp: PropTypes.bool,
    showGasPriceInfoModal: PropTypes.func,
    showGasLimitInfoModal: PropTypes.func,
  }

  constructor (props) {
    super(props)
    this.state = {
      gasPrice: this.props.customGasPrice,
      gasLimit: this.props.customGasLimit,
    }
    this.changeGasPrice = debounce(this.changeGasPrice, 500)
    this.changeGasLimit = debounce(this.changeGasLimit, 500)
  }

  componentDidUpdate (prevProps) {
    const { customGasPrice: prevCustomGasPrice, customGasLimit: prevCustomGasLimit } = prevProps
    const { customGasPrice, customGasLimit } = this.props
    const { gasPrice, gasLimit } = this.state

    if (customGasPrice !== prevCustomGasPrice && customGasPrice !== gasPrice) {
      this.setState({ gasPrice: customGasPrice })
    }
    if (customGasLimit !== prevCustomGasLimit && customGasLimit !== gasLimit) {
      this.setState({ gasLimit: customGasLimit })
    }
  }

  onChangeGasLimit = (e) => {
    this.setState({ gasLimit: e.target.value })
    this.changeGasLimit({ target: { value: e.target.value } })
  }

  changeGasLimit = (e) => {
    if (e.target.value < 21000) {
      this.setState({ gasLimit: 21000 })
      this.props.updateCustomGasLimit(21000)
    } else {
      this.props.updateCustomGasLimit(Number(e.target.value))
    }
  }

  onChangeGasPrice = (e) => {
    this.setState({ gasPrice: e.target.value })
    this.changeGasPrice({ target: { value: e.target.value } })
  }

  changeGasPrice = (e) => {
    this.props.updateCustomGasPrice(Number(e.target.value))
  }

  gasInputError ({ type, insufficientBalance, customPriceIsSafe, isSpeedUp, value }) {
    const { t } = this.context
    let errorText
    let errorType
    let isInError = true


    if (insufficientBalance) {
      errorText = t('insufficientBalance')
      errorType = 'error'
    } else if (type === GAS_EDIT_TYPE.GAS_PRICE && isSpeedUp && value === 0) {
      errorText = t('zeroGasPriceOnSpeedUpError')
      errorType = 'error'
    } else if (type === GAS_EDIT_TYPE.GAS_PRICE && !customPriceIsSafe) {
      errorText = t('gasPriceExtremelyLow')
      errorType = 'warning'
    } else {
      isInError = false
    }

    return {
      isInError,
      errorText,
      errorType,
    }
  }

  gasInput ({ type, value, onChange, insufficientBalance, customPriceIsSafe, isSpeedUp }) {
    const {
      isInError,
      errorText,
      errorType,
    } = this.gasInputError({ type, insufficientBalance, customPriceIsSafe, isSpeedUp, value })

    return (
      <div className="advanced-gas-inputs__gas-edit-row__input-wrapper">
        <input
          className={classnames('advanced-gas-inputs__gas-edit-row__input', {
            'advanced-gas-inputs__gas-edit-row__input--error': isInError && errorType === 'error',
            'advanced-gas-inputs__gas-edit-row__input--warning': isInError && errorType === 'warning',
          })}
          type="number"
          value={value}
          onChange={onChange}
        />
        <div className={classnames('advanced-gas-inputs__gas-edit-row__input-arrows', {
          'advanced-gas-inputs__gas-edit-row__input--error': isInError && errorType === 'error',
          'advanced-gas-inputs__gas-edit-row__input--warning': isInError && errorType === 'warning',
        })}>
          <div
            className="advanced-gas-inputs__gas-edit-row__input-arrows__i-wrap"
            onClick={() => onChange({ target: { value: value + 1 } })}
          >
            <i className="fa fa-sm fa-angle-up" />
          </div>
          <div
            className="advanced-gas-inputs__gas-edit-row__input-arrows__i-wrap"
            onClick={() => onChange({ target: { value: Math.max(value - 1, 0) } })}
          >
            <i className="fa fa-sm fa-angle-down" />
          </div>
        </div>
        { isInError
          ? <div className={`advanced-gas-inputs__gas-edit-row__${errorType}-text`}>
            { errorText }
          </div>
          : null }
      </div>
    )
  }

  infoButton (onClick) {
    return <i className="fa fa-info-circle" onClick={onClick} />
  }

  renderGasEditRow (gasInputArgs) {
    const { type } = gasInputArgs
    const label = type === GAS_EDIT_TYPE.GAS_PRICE ?
      this.context.t('gasPrice') :
      this.context.t('gasLimit')

    return (
      <div className="advanced-gas-inputs__gas-edit-row">
        <div className="advanced-gas-inputs__gas-edit-row__label">
          { label }
          { this.infoButton(() => gasInputArgs.infoOnClick()) }
        </div>
        { this.gasInput(gasInputArgs) }
      </div>
    )
  }

  render () {
    const {
      insufficientBalance,
      customPriceIsSafe,
      isSpeedUp,
      showGasPriceInfoModal,
      showGasLimitInfoModal,
    } = this.props

    return (
      <div className="advanced-gas-inputs__gas-edit-rows">
        { this.renderGasEditRow({
          type: GAS_EDIT_TYPE.GAS_PRICE,
          value: this.state.gasPrice,
          onChange: this.onChangeGasPrice,
          insufficientBalance,
          customPriceIsSafe,
          showGWEI: true,
          isSpeedUp,
          infoOnClick: showGasPriceInfoModal,
        }) }
        { this.renderGasEditRow({
          type: GAS_EDIT_TYPE.GAS_LIMIT,
          value: this.state.gasLimit,
          onChange: this.onChangeGasLimit,
          insufficientBalance,
          customPriceIsSafe,
          infoOnClick: showGasLimitInfoModal,
        }) }
      </div>
    )
  }
}
