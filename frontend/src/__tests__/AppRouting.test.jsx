import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Smoke test: root path should lead to Login when unauthenticated

test('root redirects to login when unauthenticated', async () => {
  localStorage.clear();
  sessionStorage.clear();
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );
  // Expect the Login form to be present (email field label)
  // Depending on your Login component markup, adjust the query below
  // Verify the login heading uniquely
  expect(await screen.findByText(/Login to Your Account/i)).toBeInTheDocument();
});
