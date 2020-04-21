import React from 'react';
import { Actions, withTheme } from '@twilio/flex-ui';

class TransferButton extends React.PureComponent {
	render() {
		return (
			<button
				onClick={() => Actions.invokeAction('ShowDirectory')}
				style={{
					background: this.props.theme.colors.base2,
					color: this.props.theme.colors.base11,
					letterSpacing: '2px',
					textTransform: 'uppercase',
					fontWeight: 'bold',
					marginRight: '1em',
					padding: '0px 16px',
					height: '28px',
					fontSize: '10px',
					outline: 'none',
					borderRadius: '100px',
					alignSelf: 'center',
					borderWidth: 'initial',
					borderStyle: 'none',
					borderColor: 'initial',
				}}
			>
				Transfer
			</button>
		);
	}
}

export default withTheme(TransferButton);
