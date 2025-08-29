import React from 'react';
import { XCircleIcon } from '../icons';

interface ConsolidatedViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  consolidatedText: string;
}

export const ConsolidatedViewModal: React.FC<ConsolidatedViewModalProps> = ({ isOpen, onClose, consolidatedText }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Resultados Consolidados</h2>
          <button onClick={onClose} className="p-2 text-dark-text-secondary hover:bg-gray-700 rounded-full">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>
        <textarea
          readOnly
          value={consolidatedText}
          className="w-full flex-1 bg-dark-bg text-dark-text-secondary p-4 rounded-md font-mono text-sm border border-dark-border focus:ring-brand-primary focus:border-brand-primary"
        />
        <button
          onClick={() => navigator.clipboard.writeText(consolidatedText)}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg"
        >
          Copiar Tudo
        </button>
      </div>
    </div>
  );
};
