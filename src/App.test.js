import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders casino slot machine game', () => {
  render(<App />);
  const casinoTitle = screen.getByText(/Vegas Casino/i);
  expect(casinoTitle).toBeInTheDocument();
});

test('renders spin button', () => {
  render(<App />);
  const spinButton = screen.getByText(/SPIN!/i);
  expect(spinButton).toBeInTheDocument();
});

test('renders game balance', () => {
  render(<App />);
  const balance = screen.getByText(/Balance:/i);
  expect(balance).toBeInTheDocument();
});

test('renders paytable', () => {
  render(<App />);
  const paytable = screen.getByText(/PAYTABLE/i);
  expect(paytable).toBeInTheDocument();
});

test('can adjust bet amount', () => {
  render(<App />);
  const increaseBetButton = screen.getByText(/\+\$10/i);
  const betAmount = screen.getByText('$10');
  
  expect(increaseBetButton).toBeInTheDocument();
  expect(betAmount).toBeInTheDocument();
});
