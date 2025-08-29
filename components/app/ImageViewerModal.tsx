import React from 'react';
import { XCircleIcon } from '../icons';

interface ImageViewerModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen || !imageUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt="Visualização ampliada"
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 p-1 bg-dark-card text-dark-text-secondary hover:bg-gray-700 rounded-full shadow-lg"
          aria-label="Fechar visualizador"
        >
          <XCircleIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
