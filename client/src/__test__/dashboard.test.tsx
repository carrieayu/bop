import React from 'react';
import { render } from '@testing-library/react';
import Dashboard from '../pages/dashboard/dashboard';
import { act } from 'react-dom/test-utils';

describe('Dashboard component', () => {
  it('renders without crashing', () => {
    act(() => {
        render(<Dashboard />);
    });
  });
});
