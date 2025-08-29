import React from 'react';
import { ImageUploader } from '../ImageUploader';
import { TableIcon, CogIcon } from '../icons';

interface UploadSectionProps {
  imageUploaderRef: React.RefObject<{ triggerFileInput: () => void }>;
  onImageChange: (files: File[], options?: { openCropper?: boolean }) => void;
  imageUrls: string[];
  onClearAll: () => void;
  onRemoveImage: (index: number) => void;
  onCropImage: (index: number) => void;
  disabled: boolean;
  isReadOnly: boolean;
  selectedIndices: number[];
  onSelectionChange: (indices: number[]) => void;
  onImageClick?: (url: string) => void;
  extractAsTable: boolean;
  setExtractAsTable: (value: boolean) => void;
  onManageActions: () => void;
  onExtract: () => void;
  buttonText: string;
  error: string | null;
  selectedImageCount: number;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  imageUploaderRef,
  onImageChange,
  imageUrls,
  onClearAll,
  onRemoveImage,
  onCropImage,
  disabled,
  isReadOnly,
  selectedIndices,
  onSelectionChange,
  onImageClick,
  extractAsTable,
  setExtractAsTable,
  onManageActions,
  onExtract,
  buttonText,
  error,
  selectedImageCount
}) => {
  return (
    <div className="w-full p-6 bg-dark-card border border-dark-border rounded-2xl shadow-lg">
      <ImageUploader
        ref={imageUploaderRef}
        onImageChange={onImageChange}
        imageUrls={imageUrls}
        onClearAll={onClearAll}
        onRemoveImage={onRemoveImage}
        onCropImage={onCropImage}
        disabled={disabled}
        isReadOnly={isReadOnly}
        selectedIndices={selectedIndices}
        onSelectionChange={onSelectionChange}
        onImageClick={onImageClick}
      />
      <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
        <div className="flex items-center justify-center flex-grow flex-wrap gap-4">
          <label htmlFor="table-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" id="table-toggle" className="sr-only" checked={extractAsTable} onChange={() => setExtractAsTable(!extractAsTable)} disabled={disabled} />
              <div className="block bg-dark-border w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${extractAsTable ? 'transform translate-x-6 bg-brand-primary' : ''}`}></div>
            </div>
            <div className="ml-3 text-dark-text-secondary flex items-center gap-2">
              <TableIcon className="w-5 h-5" />
              <span>Extrair como Tabela</span>
            </div>
          </label>
          <button
            onClick={onManageActions}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            aria-label="Gerenciar ações personalizadas"
          >
            <CogIcon className="w-5 h-5" />
            Gerenciar Ações
          </button>
        </div>
        <button
          onClick={onExtract}
          disabled={selectedImageCount === 0 || disabled}
          className="px-8 py-3 w-full sm:w-auto bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-light"
        >
          {buttonText}
        </button>
      </div>
      {error && <p className="mt-4 text-center text-red-400">{error}</p>}
    </div>
  );
};
