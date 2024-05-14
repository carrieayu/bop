import React from 'react';
import { render } from '@testing-library/react';
import LoginForm from '../pages/login/login';
import { act } from 'react-dom/test-utils';

describe('Login component', () => {
  it('renders without crashing', () => {
    act(() => {
        render(<LoginForm onSubmit={() => {}} />);
    });
  });
});
