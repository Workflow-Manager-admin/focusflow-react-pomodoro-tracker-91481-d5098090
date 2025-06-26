import { render, screen } from '@testing-library/react';
import App from './App';

// Test Pomodoro renders
test('renders Pomodoro FocusFlow main UI', () => {
  render(<App />);
  const header = screen.getByText(/Pomodoro FocusFlow/i);
  expect(header).toBeInTheDocument();
  const modes = screen.getByRole("button", { name: /Pomodoro/i });
  expect(modes).toBeInTheDocument();
});
