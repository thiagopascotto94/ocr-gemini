import React from 'react';
import { DocumentTextIcon } from '../icons';

export const AppHeader: React.FC = () => (
  <header className="w-full max-w-4xl text-center mb-8 relative">
    <div className="flex items-center justify-center gap-4 mb-2">
      <DocumentTextIcon className="w-12 h-12 text-brand-primary" />
      <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
        OCR com Gemini
      </h1>
    </div>
    <p className="text-lg text-dark-text-secondary">
      Extraia texto e tabelas de imagens com o poder da IA generativa.
    </p>
  </header>
);
