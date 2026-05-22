import { render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '../App.jsx';
import { AuthProvider } from '../providers/AuthProvider.jsx';

describe('App smoke', () => {
  it('renderiza sem quebrar', () => {
    render(
      <StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </StrictMode>,
    );

    expect(document.title).toBeTruthy();
  });
});
