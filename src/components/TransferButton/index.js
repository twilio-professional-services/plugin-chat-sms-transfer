import React from 'react';
import { Actions, withTheme } from '@twilio/flex-ui';

import { StyledButton } from './styles';

export class TransferButtonComponent extends React.PureComponent {
  render() {
    return (
      <StyledButton
        color={this.props.theme.colors.base11}
        background={this.props.theme.colors.base2}
        onClick={() => Actions.invokeAction('ShowDirectory')}
      >
        Transfer
      </StyledButton>
    );
  }
}

export default withTheme(TransferButtonComponent);
