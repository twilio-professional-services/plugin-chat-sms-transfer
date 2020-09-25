import React from 'react';
import { setUpComponents } from '../components';

import TransferButton from '../../components/TransferButton';
import { TaskCanvasHeader } from '@twilio/flex-ui';

jest.mock('@twilio/flex-ui', () => {
	return {
		TaskCanvasHeader: {
			Content: {
				add: jest.fn(),
			},
		},
	};
});

jest.mock('../../components/TransferButton', () => {
	return jest.fn();
});

describe('setUpComponents', () => {
	beforeEach(() => {
		setUpComponents();
	});

	it('calls add on TaskCanvasHeader', () => {
		expect(TaskCanvasHeader.Content.add).toHaveBeenCalledWith(
			<TransferButton key="chat-transfer-button" />,
			{
				sortOrder: 1,
				if: expect.any(Function),
			}
		);
	});
});
