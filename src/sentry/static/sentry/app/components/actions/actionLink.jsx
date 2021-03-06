import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import Confirm from 'app/components/confirm';

export default class ActionLink extends React.Component {
  static propTypes = {
    shouldConfirm: PropTypes.bool,
    message: PropTypes.node,
    className: PropTypes.any,
    onAction: PropTypes.func.isRequired,
    title: PropTypes.string,
    confirmLabel: PropTypes.string,
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    shouldConfirm: false,
    disabled: false,
  };

  render() {
    const {
      shouldConfirm,
      message,
      className,
      title,
      onAction,
      confirmLabel,
      disabled,
      children,
    } = this.props;
    const testId = title
      ? 'action-link-' + title.toLowerCase().replace(/ /g, '-')
      : 'action-link';

    if (shouldConfirm && !disabled) {
      return (
        <Confirm message={message} confirmText={confirmLabel} onConfirm={onAction}>
          <a className={className} title={title} aria-label={title}>
            {' '}
            {children}
          </a>
        </Confirm>
      );
    } else {
      return (
        <a
          data-test-id={testId}
          aria-label={title}
          className={classNames(className, {disabled})}
          onClick={disabled ? undefined : onAction}
          disabled={disabled}
        >
          {children}
        </a>
      );
    }
  }
}
