import React from 'react';
import { DocumentTextIcon, TableIcon, SparklesIcon, UploadIcon, KeyIcon, ClipboardIcon } from './icons';

interface LandingPageProps {
  onStart: () => void;
}

const features = [
  {
    icon: <DocumentTextIcon className="w-8 h-8 text-brand-light" />,
    title: 'Extração de Texto Precisa',
    description: 'Converta imagens de documentos, notas ou capturas de tela em texto editável com alta fidelidade.'
  },
  {
    icon: <TableIcon className="w-8 h-8 text-brand-light" />,
    title: 'Reconhecimento de Tabelas',
    description: 'Extraia dados estruturados de tabelas em imagens diretamente para um formato organizado, pronto para uso.'
  },
  {
    icon: <UploadIcon className="w-8 h-8 text-brand-light" />,
    title: 'Suporte a Múltiplos Arquivos e PDF',
    description: 'Processe várias imagens ou páginas de um documento PDF de uma só vez, agilizando seu trabalho.'
  },
  {
    icon: <ClipboardIcon className="w-8 h-8 text-brand-light" />,
    title: 'Cole da Área de Transferência',
    description: 'Tirou um print? Cole (Ctrl+V) diretamente na página para um upload instantâneo e sem esforço.'
  },
  {
    icon: <KeyIcon className="w-8 h-8 text-brand-light" />,
    title: 'Atalhos para Produtividade',
    description: 'Use atalhos de teclado (Ctrl+U, Ctrl+Enter, Esc) para fazer upload, extrair e limpar, minimizando o uso do mouse.'
  },
  {
    icon: <SparklesIcon className="w-8 h-8 text-brand-light" />,
    title: 'Ações com IA',
    description: 'Vá além da extração. Peça para a IA resumir, traduzir, ou realizar ações personalizadas com o texto extraído.'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <main className="w-full max-w-5xl flex flex-col items-center text-center py-10">
        
        {/* Hero Section */}
        <header className="mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <DocumentTextIcon className="w-16 h-16 text-brand-primary" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text mb-4">
            Transforme Imagens em Texto, Grátis e Instantaneamente
          </h1>
          <p className="text-lg sm:text-xl text-dark-text-secondary max-w-3xl mx-auto mb-8">
            Utilize o poder da IA do Gemini para extrair textos e tabelas de qualquer imagem ou PDF. Rápido, preciso e totalmente gratuito.
          </p>
          <button
            onClick={onStart}
            className="px-10 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold text-lg rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-light"
          >
            Tente Agora
          </button>
        </header>

        {/* Features Section */}
        <section className="w-full">
          <h2 className="text-3xl sm:text-4xl font-bold mb-10">Funcionalidades Poderosas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-dark-card border border-dark-border rounded-2xl p-6 text-left flex flex-col items-start gap-4 hover:border-brand-primary transition-colors">
                <div className="bg-brand-primary/10 p-3 rounded-full">
                    {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-dark-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mt-20">
            <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-lg text-dark-text-secondary mb-8">Dê vida aos seus documentos e imagens agora mesmo.</p>
            <button
                onClick={onStart}
                className="px-10 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold text-lg rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-light"
            >
                Iniciar Extração
            </button>
        </section>
      </main>

      <footer className="w-full max-w-4xl text-center mt-12 py-6 border-t border-dark-border text-dark-text-secondary text-sm">
        <p>Desenvolvido com React, Tailwind CSS e a API do Google Gemini por Thiago Pascotto</p>
      </footer>
    </div>
  );
};