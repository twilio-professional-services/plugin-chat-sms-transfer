import React from 'react';
import { shallow } from 'enzyme';
import { Actions } from '@twilio/flex-ui';

import { TransferButtonComponent } from '..';

jest.mock('@twilio/flex-ui', () => {
  return {
    Actions: {
      invokeAction: jest.fn(),
    },
    QueuesStats: {
      setFilter: jest.fn(),
    },
    SidePanel: jest.fn(),
    withTheme: jest.fn(),
  };
});

describe('Chat Transfer Button', () => {
  let subject;
  let props;

  beforeEach(() => {
    props = {
      theme: {
        colors: {
          base11: '#000',
          base2: '#ccc',
        },
      },
    };
    subject = shallow(<TransferButtonComponent {...props} />);
  });

  it('calls show directory when clicked', () => {
    subject.simulate('click');
    expect(Actions.invokeAction).toHaveBeenCalledWith('ShowDirectory');
  });
});
