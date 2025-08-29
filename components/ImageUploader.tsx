import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { UploadIcon, XCircleIcon, CropIcon, CameraIcon } from './icons';

interface ImageUploaderProps {
  onImageChange: (files: File[], options?: { openCropper?: boolean }) => void;
  imageUrls: string[];
  onClearAll: () => void;
  onRemoveImage: (index: number) => void;
  onCropImage: (index: number) => void;
  disabled: boolean;
  isReadOnly?: boolean;
  selectedIndices: number[];
  onSelectionChange: (indices: number[]) => void;
  onImageClick?: (url: string) => void;
}

export const ImageUploader = forwardRef<{ triggerFileInput: () => void }, ImageUploaderProps>(({ 
  onImageChange, 
  imageUrls, 
  onClearAll, 
  onRemoveImage, 
  onCropImage,
  disabled, 
  isReadOnly = false,
  selectedIndices,
  onSelectionChange,
  onImageClick
}, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length) {
      onImageChange(files);
    }
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isReadOnly || disabled) return;
    const files = Array.from(event.dataTransfer.files || []);
    if (files.length) {
      onImageChange(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const triggerFileInput = () => {
    if (!isReadOnly && !disabled) {
      fileInputRef.current?.click();
    }
  };

  useImperativeHandle(ref, () => ({
    triggerFileInput,
  }));

  const handleToggleSelection = (index: number) => {
    const newSelection = selectedIndices.includes(index)
      ? selectedIndices.filter(i => i !== index)
      : [...selectedIndices, index];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectionChange(imageUrls.map((_, i) => i));
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  const handleScreenCapture = async () => {
    if (disabled || isReadOnly) return;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const track = stream.getVideoTracks()[0];
      const video = document.createElement('video');
      video.srcObject = stream;
      
      video.onloadedmetadata = () => {
        video.play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          track.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        track.stop();
        video.srcObject = null;

        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], `captura-tela-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onImageChange([file], { openCropper: true });
          }
        }, 'image/jpeg', 0.95);
      };
    } catch (err) {
      console.error("Erro na captura de tela:", err);
    }
  };

  return (
    <div className="w-full">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp, application/pdf"
            disabled={disabled || isReadOnly}
            multiple
        />
      {imageUrls.length > 0 ? (
        <div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-4">
                {imageUrls.map((url, index) => (
                    <div key={index} className="relative group w-full aspect-square rounded-lg overflow-hidden border-2 border-dark-border">
                        <img 
                            src={url} 
                            alt={`Pré-visualização ${index + 1}`} 
                            className={`w-full h-full object-cover transition-opacity ${selectedIndices.includes(index) || isReadOnly ? '' : 'opacity-50'} ${onImageClick ? 'cursor-zoom-in' : ''}`}
                            onClick={onImageClick ? () => onImageClick(url) : undefined}
                        />
                        {!isReadOnly && (
                            <>
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => onCropImage(index)}
                                        disabled={disabled}
                                        className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        aria-label="Cortar imagem"
                                    >
                                        <CropIcon className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => onRemoveImage(index)}
                                        disabled={disabled}
                                        className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                                        aria-label="Remover imagem"
                                    >
                                        <XCircleIcon className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="absolute top-2 left-2">
                                    <input 
                                        type="checkbox"
                                        checked={selectedIndices.includes(index)}
                                        onChange={() => handleToggleSelection(index)}
                                        className="h-6 w-6 rounded text-brand-primary bg-dark-card border-dark-border focus:ring-brand-primary"
                                        aria-label={`Selecionar imagem ${index + 1}`}
                                        disabled={disabled}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            {!isReadOnly ? (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                        <button onClick={handleSelectAll} disabled={disabled} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                            Selecionar Todos
                        </button>
                        <button onClick={handleDeselectAll} disabled={disabled} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                            Limpar Seleção ({selectedIndices.length})
                        </button>
                    </div>
                    <button onClick={triggerFileInput} disabled={disabled} className="w-full sm:w-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                        Selecionar Outros
                    </button>
                    <button onClick={onClearAll} disabled={disabled} className="w-full sm:w-auto px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                        Limpar Tudo
                    </button>
                </div>
            ) : (
                <div className="flex justify-center mt-4">
                    <button 
                        onClick={onClearAll} 
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        Limpar Visualização
                    </button>
                </div>
            )}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center gap-4">
            <div
                onClick={triggerFileInput}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`w-full aspect-video border-2 border-dashed border-dark-border rounded-lg flex flex-col items-center justify-center text-center p-4 transition-colors ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-brand-primary hover:bg-gray-800/20'}`}
                aria-disabled={disabled}
            >
                <UploadIcon className="w-12 h-12 text-dark-text-secondary mb-2" />
                <p className="font-semibold text-dark-text">Clique para fazer o upload ou arraste e solte</p>
                <p className="text-sm text-dark-text-secondary">PNG, JPG, WEBP ou PDF (até 10 arquivos/páginas)</p>
            </div>
             <div className="text-center text-dark-text-secondary">ou</div>
             <button
                onClick={handleScreenCapture}
                disabled={disabled}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                aria-label="Capturar tela"
                >
                <CameraIcon className="w-6 h-6" />
                <span>Capturar Tela</span>
             </button>
        </div>
      )}
    </div>
  );
});