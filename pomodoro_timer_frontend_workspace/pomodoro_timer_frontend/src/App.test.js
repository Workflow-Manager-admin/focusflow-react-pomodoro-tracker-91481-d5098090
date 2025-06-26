import { render, screen } from '@testing-library/react';
import App from './App';

// Test Pomodoro renders
test('renders Pomofocus main UI', () => {
  render(<App />);
  const header = screen.getByText(/Pomofocus/i);
  expect(header).toBeInTheDocument();
  const modes = screen.getByRole("button", { name: /Pomodoro/i });
  expect(modes).toBeInTheDocument();
});
