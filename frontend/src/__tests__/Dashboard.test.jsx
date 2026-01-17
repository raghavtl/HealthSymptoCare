import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

// Mock chart component to avoid canvas context errors in JSDOM
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="df-line">Mocked Line</div>
}));

jest.mock('../services/api', () => ({
  wellnessLogsApi: {
    getByUserId: jest.fn(() => Promise.resolve({ data: [
      { date: '2025-09-20', water_intake: 6, sleep_hours: 7, mood: 'happy', energy_level: 7 },
      { date: '2025-09-21', water_intake: 8, sleep_hours: 6, mood: 'neutral', energy_level: 6 },
      { date: '2025-09-22', water_intake: 7, sleep_hours: 8, mood: 'very-happy', energy_level: 8 },
      { date: '2025-09-23', water_intake: 5, sleep_hours: 5.5, mood: 'sad', energy_level: 5 },
      { date: '2025-09-24', water_intake: 9, sleep_hours: 7.5, mood: 'happy', energy_level: 8 },
      { date: '2025-09-25', water_intake: 6, sleep_hours: 6.5, mood: 'neutral', energy_level: 6 },
      { date: '2025-09-26', water_intake: 8, sleep_hours: 7, mood: 'happy', energy_level: 7 },
    ] }))
  }
}));

beforeEach(() => {
  // Simulate authenticated user so Dashboard fetches logs
  localStorage.setItem('user', JSON.stringify({ id: 1, username: 'test' }));
  localStorage.setItem('token', 'fake');
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test('renders Wellness Dashboard heading and combined chart container', async () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Wellness Dashboard/i)).toBeInTheDocument();

  // Combined chart title should be present when df stats load
  await waitFor(() => {
    expect(screen.getByText(/Wellness Logs Overview/i)).toBeInTheDocument();
  });
});
