import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecipeLibrary from '../../dietfitness/RecipeLibrary';

jest.mock('../../../services/api', () => ({
  dietAndFitnessApi: {
    listRecipes: jest.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Veggie Bowl', is_veg: 1, calories: 480, protein_g: 20, carbs_g: 60, fat_g: 16 },
        { id: 2, name: 'Veggie Bowl', is_veg: 1, calories: 480, protein_g: 20, carbs_g: 60, fat_g: 16 },
        { id: 3, name: 'Chicken Wrap', is_veg: 0, calories: 520, protein_g: 30, carbs_g: 55, fat_g: 14 }
      ]
    }),
    getRecipe: jest.fn().mockResolvedValue({ data: { id: 1, name: 'Veggie Bowl', description: 'Yum' } })
  }
}));

describe('RecipeLibrary', () => {
  test('deduplicates repeated recipes and applies filters', async () => {
    render(<RecipeLibrary />);

    // initial load resolves
    await waitFor(() => expect(screen.getAllByText(/Veggie Bowl/i).length).toBe(1));

    // set a calorie filter, this triggers debounced search; no error just inputs exist
    fireEvent.change(screen.getByPlaceholderText(/Min cal/i), { target: { value: '400' } });
    fireEvent.change(screen.getByPlaceholderText(/Max cal/i), { target: { value: '600' } });

    // After debounce the list still shows deduped results
    await waitFor(() => expect(screen.getAllByText(/Veggie Bowl/i).length).toBe(1));
  });
});
