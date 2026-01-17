import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DietFitnessDashboard from '../pages/DietFitnessDashboard';

jest.mock('../services/api', () => ({
  dietAndFitnessApi: {
    getDashboardStats: jest.fn(() => Promise.resolve({ data: {
      startDate: '2025-09-20',
      endDate: '2025-09-26',
      calories: [], water: [], weight: [], workouts: []
    } })),
    getProfile: jest.fn(() => Promise.resolve({ data: {
      age: 30,
      gender: 'male',
      height_cm: 175,
      weight_kg: 70,
      activity_level: 'moderate',
      dietary_preference: 'none',
      goal: 'general'
    } }))
  }
}));

test('renders Diet & Fitness report with Back button', async () => {
  render(
    <MemoryRouter>
      <DietFitnessDashboard />
    </MemoryRouter>
  );
  expect(await screen.findByText(/Diet & Fitness Report/i)).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText(/Back/i)).toBeInTheDocument();
  });
});
