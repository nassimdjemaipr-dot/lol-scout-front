import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LegalNoticePage } from './LegalNoticePage';
import { PrivacyPolicyPage } from './PrivacyPolicyPage';
import { TermsPage } from './TermsPage';

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Pages légales', () => {
  it('les mentions légales identifient l éditeur et écartent toute affiliation à Riot', () => {
    wrap(<LegalNoticePage />);

    expect(screen.getByRole('heading', { name: /mentions légales/i })).toBeInTheDocument();
    // Le nom figure a la fois comme editeur et comme directeur de publication.
    expect(screen.getAllByText(/DJEMAI Nassim/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/ni affilié ni approuvé par Riot Games/i)).toBeInTheDocument();
  });

  it('la politique de confidentialité couvre les droits RGPD', () => {
    wrap(<PrivacyPolicyPage />);

    expect(
      screen.getByRole('heading', { name: /politique de confidentialité/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Effacement/)).toBeInTheDocument();
    expect(screen.getByText(/Rectification/)).toBeInTheDocument();
    expect(screen.getByText(/ne dépose aucun cookie/i)).toBeInTheDocument();
    expect(screen.getByText(/CNIL/)).toBeInTheDocument();
  });

  it('les CGU annoncent la règle de mot de passe réellement appliquée', () => {
    wrap(<TermsPage />);

    expect(
      screen.getByRole('heading', { name: /conditions générales/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/au moins douze caractères/i)).toBeInTheDocument();
  });
});
