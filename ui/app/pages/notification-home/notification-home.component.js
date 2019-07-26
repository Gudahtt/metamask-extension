import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ProviderApproval from '../provider-approval'

import {
  RESTORE_VAULT_ROUTE,
  CONFIRM_TRANSACTION_ROUTE,
  CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE,
} from '../../helpers/constants/routes'

export default class NotificationHome extends PureComponent {
  static propTypes = {
    history: PropTypes.object,
    forgottenPassword: PropTypes.bool,
    suggestedTokens: PropTypes.object,
    unconfirmedTransactionsCount: PropTypes.number,
    providerRequests: PropTypes.array,
  }

  componentWillMount () {
    const {
      history,
      unconfirmedTransactionsCount = 0,
    } = this.props

    if (unconfirmedTransactionsCount > 0) {
      history.push(CONFIRM_TRANSACTION_ROUTE)
    }
  }

  componentDidMount () {
    const {
      history,
      suggestedTokens = {},
    } = this.props

    // suggested new tokens
    if (Object.keys(suggestedTokens).length > 0) {
      history.push(CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE)
    }
  }

  render () {
    const {
      forgottenPassword,
      providerRequests,
    } = this.props

    if (forgottenPassword) {
      return global.platform.openExtensionInBrowser(RESTORE_VAULT_ROUTE)
    }

    if (providerRequests && providerRequests.length > 0) {
      return (
        <ProviderApproval providerRequest={providerRequests[0]} />
      )
    }

    return (
      <div className="main-container">
        <div className="account-and-transaction-details">
        </div>
      </div>
    )
  }
}
