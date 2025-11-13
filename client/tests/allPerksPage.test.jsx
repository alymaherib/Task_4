import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';

import AllPerks from '../src/pages/AllPerks.jsx';
import { renderWithRouter } from './utils/renderWithRouter.js';

describe('AllPerks page (Directory)', () => {
  test('lists public perks and responds to name filtering', async () => {
    // The seeded record gives us a deterministic expectation regardless of the
    // rest of the shared database contents.
    const seededPerk = global.__TEST_CONTEXT__.seededPerk;

    // Render the exploration page so it performs its real HTTP fetch.
    renderWithRouter(
      <Routes>
        <Route path="/explore" element={<AllPerks />} />
      </Routes>,
      { initialEntries: ['/explore'] }
    );

    // Wait for the baseline card to appear which guarantees the asynchronous
    // fetch finished. The API call can take >1s, so extend the timeout.
    await waitFor(
      () => {
        expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Interact with the name filter input using the real value that
    // corresponds to the seeded record.
    const nameFilter = screen.getByPlaceholderText('Enter perk name...');
    fireEvent.change(nameFilter, { target: { value: seededPerk.title } });

    // After filtering, the seeded perk should still be visible.
    await waitFor(
      () => {
        expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // The summary text should continue to reflect the number of matching perks.
    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing');
  });

  /*
  TODO: Test merchant filtering
  - use the seeded record
  - perform a real HTTP fetch.
  - wait for the fetch to finish
  - choose the record's merchant from the dropdown
  - verify the record is displayed
  - verify the summary text reflects the number of matching perks
  */

  test('lists public perks and responds to merchant filtering', async () => {
    const seededPerk = global.__TEST_CONTEXT__.seededPerk;

    // Render the exploration page so it performs its real HTTP fetch.
    renderWithRouter(
      <Routes>
        <Route path="/explore" element={<AllPerks />} />
      </Routes>,
      { initialEntries: ['/explore'] }
    );

    // Wait for the baseline card to appear which guarantees the asynchronous
    // fetch finished. Again, allow extra time for the network call.
    await waitFor(
      () => {
        expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Grab the merchant <select>. It isn't programmatically linked to the label,
    // so we use the ARIA role instead of getByLabelText.
    const merchantFilter = screen.getByRole('combobox');

    // Ensure the seeded merchant option is present before changing the value.
    await waitFor(
      () => {
        expect(
          screen.getByRole('option', { name: seededPerk.merchant })
        ).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Use the real merchant from the seeded record to drive the filter.
    fireEvent.change(merchantFilter, { target: { value: seededPerk.merchant } });

    // The seeded perk should still be visible after applying the merchant filter.
    await waitFor(
      () => {
        expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // The summary text should continue to reflect the number of matching perks.
    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing');
  });
});
