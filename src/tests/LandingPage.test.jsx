import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

const setViewport = (width) => {
  act(() => {
    window.innerWidth = width;
    window.dispatchEvent(new Event('resize'));
  });
};

describe('LandingPage mobile navigation', () => {
  const originalWidth = window.innerWidth;

  afterEach(() => {
    setViewport(originalWidth);
  });

  test('shows mobile navigation toggle on small screens', () => {
    setViewport(500);

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument();
  });

  test('mobile menu uses real section links instead of placeholder href', async () => {
    setViewport(500);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /toggle menu/i }));

    const expectedAnchors = ['#Identity', '#Economic', '#Governance', '#Multimedia', '#Registry'];
    const menuLinks = screen.getAllByRole('link').slice(0, expectedAnchors.length);

    expectedAnchors.forEach((anchor, index) => {
      expect(menuLinks[index]).toHaveAttribute('href', anchor);
      expect(document.querySelector(anchor)).not.toBeNull();
    });
  });
});
