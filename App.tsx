
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { extractTextFromImage, generateFollowUp } from './services/geminiService';
import { HistorySection } from './components/HistorySection';
import { addExtraction, getAllExtractions, deleteExtraction, HistoryEntry, getCustomActions, saveCustomAction, deleteCustomAction, CustomAction, addActionResult } from './services/db';
import { ImageCropModal } from './components/ImageCropModal';
import { convertPdfToImages } from './services/pdfService';
import { ActionModal } from './components/ActionModal';
import { LandingPage } from './components/LandingPage';

import { AppHeader } from './components/app/AppHeader';
import { UploadSection } from './components/app/UploadSection';
import { ResultsSection, BatchResultItem } from './components/app/ResultsSection';
import { ConsolidatedViewModal } from './components/app/ConsolidatedViewModal';
import { ImageViewerModal } from './components/app/ImageViewerModal';
import { AppFooter } from './components/app/AppFooter';


const createImagePreview = (file: File, maxWidth: number = 800, maxHeight: number = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
  
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * (maxWidth / width));
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * (maxHeight / height));
              height = maxHeight;
            }
          }
  
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Could not get canvas context'));
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedImageIndices, setSelectedImageIndices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConvertingPdf, setIsConvertingPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [extractAsTable, setExtractAsTable] = useState<boolean>(false);
  const [batchResults, setBatchResults] = useState<BatchResultItem[]>([]);
  const [croppingState, setCroppingState] = useState<{
    isOpen: boolean;
    image: { index: number; url: string } | null;
  }>({ isOpen: false, image: null });
  const [customActions, setCustomActions] = useState<CustomAction[]>([]);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isConsolidatedViewOpen, setIsConsolidatedViewOpen] = useState(false);
  const imageUploaderRef = useRef<{ triggerFileInput: () => void }>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const items = await getAllExtractions();
      setHistory(items);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const loadCustomActions = async () => {
    try {
      const actions = await getCustomActions();
      setCustomActions(actions);
    } catch(err) {
      console.error("Failed to load custom actions:", err);
    }
  };


  useEffect(() => {
    loadHistory();
    loadCustomActions();
     // Registra o Service Worker
     console.log("Iniciando registro serviceworker");
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registrado com sucesso no escopo:', registration.scope);
            }).catch(error => {
                console.log('Falha no registro do ServiceWorker:', error);
            });
        });
    }
  }, []);

  useEffect(() => {
    // Solicita permissão para notificações assim que o app principal é carregado
    if (!showLanding && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
  }, [showLanding]);


  const handleImageChange = async (newFiles: File[], options?: { openCropper?: boolean }) => {
    setError(null);

    const MAX_FILES = 10;
    const currentTotalFiles = imageFiles.length;
    const spaceAvailable = MAX_FILES - currentTotalFiles;

    if (spaceAvailable <= 0) {
      setError(`O limite de ${MAX_FILES} arquivos já foi atingido.`);
      return;
    }

    setIsConvertingPdf(true);
    try {
      const processedFiles: File[] = [];
      let limitReached = false;

      // Pegue apenas o número de arquivos que cabem
      const filesToAdd = newFiles.slice(0, spaceAvailable);

      for (const file of filesToAdd) {
        if (file.type === 'application/pdf') {
          const imageFilesFromPdf = await convertPdfToImages(file);
          for (const imageFile of imageFilesFromPdf) {
            if (processedFiles.length < spaceAvailable) {
              processedFiles.push(imageFile);
            } else {
              limitReached = true;
              break;
            }
          }
           if (limitReached) break;
        } else {
          processedFiles.push(file);
        }
      }

      if (processedFiles.length > 0) {
        const newUrls = processedFiles.map(f => URL.createObjectURL(f));
        const newFileIndices = Array.from({ length: processedFiles.length }, (_, i) => currentTotalFiles + i);
        
        setImageFiles(prev => [...prev, ...processedFiles]);
        setImageUrls(prev => [...prev, ...newUrls]);
        setSelectedImageIndices(prev => [...prev, ...newFileIndices]);

        // Abre o cropper automaticamente se a opção for passada (e for um único arquivo)
        if (options?.openCropper && processedFiles.length === 1) {
            const newImageIndex = currentTotalFiles;
            // Precisamos passar a URL diretamente porque o estado pode não ter sido atualizado ainda
            handleOpenCropper(newImageIndex, newUrls[0]);
        }
      }
      
      if (newFiles.length > spaceAvailable) {
        setError(`Limite de ${MAX_FILES} arquivos atingido. Alguns arquivos não foram adicionados.`);
      }

    } catch (err) {
      console.error("Error processing files:", err);
      setError("Falha ao processar o arquivo. Tente novamente.");
    } finally {
      setIsConvertingPdf(false);
    }
  };

  const handleExtractionError = (err: any) => {
    console.error("Extraction error:", err);
    const errorMessage = err.message || 'Falha ao extrair dados.';
    setError(errorMessage);
  };

  const handleExtractText = useCallback(async () => {
    if (selectedImageIndices.length === 0) {
      setError("Por favor, selecione uma ou mais imagens para processar.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setBatchResults([]);
    
    const filesToProcess = selectedImageIndices.map(index => ({
      file: imageFiles[index],
      index,
    }));

    setStatusMessage(`Preparando miniaturas para ${filesToProcess.length} arquivo(s)...`);

    // Gera pré-visualizações como data: URLs para garantir que não expirem.
    const previews = await Promise.all(
        filesToProcess.map(({ file }) => createImagePreview(file, 128, 128))
    );

    const initialResults: BatchResultItem[] = filesToProcess.map(({ file, index }, i) => ({
      id: `pending-${file.name}-${index}`,
      imageSrc: previews[i], // Usa a data: URL estável
      fileName: file.name,
      status: 'pending',
    }));
    setBatchResults(initialResults);

    setStatusMessage(`Iniciando processamento de ${filesToProcess.length} arquivo(s)...`);

    let successCount = 0;
    let errorCount = 0;
    const newHistoryEntries: HistoryEntry[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
        const { file, index } = filesToProcess[i];
        const pendingId = `pending-${file.name}-${index}`;
        
        setBatchResults(prev => prev.map(item => 
            item.id === pendingId ? { ...item, status: 'processing' } : item
        ));
        setStatusMessage(`Processando ${i + 1} de ${filesToProcess.length}: ${file.name}`);

        try {
            const { data: resultData } = await extractTextFromImage(file, extractAsTable);
            // Gera uma pré-visualização de maior qualidade para o banco de dados.
            const imagePreview = await createImagePreview(file);
            
            const newEntryData: Omit<HistoryEntry, 'id'> = {
                data: resultData,
                dataType: extractAsTable ? 'table' : 'text',
                imageDataUrl: imagePreview,
                timestamp: Date.now()
            };

            const savedEntry = await addExtraction(newEntryData);
            newHistoryEntries.unshift(savedEntry);
            successCount++;

            const resultItem: Partial<BatchResultItem> = {
                id: savedEntry.id!,
                status: 'completed',
            };

            if (extractAsTable) {
                try {
                    resultItem.table = JSON.parse(resultData);
                } catch {
                    resultItem.status = 'failed';
                    resultItem.error = "Falha ao analisar dados da tabela.";
                    errorCount++;
                    successCount--;
                }
            } else {
                resultItem.text = resultData;
            }

            setBatchResults(prev => prev.map(item =>
                item.id === pendingId ? { ...item, ...resultItem } : item
            ));

        } catch (err: any) {
            handleExtractionError(err);
            errorCount++;

            setBatchResults(prev => prev.map(item =>
                item.id === pendingId ? { 
                    ...item, 
                    status: 'failed', 
                    error: err.message || 'Falha ao extrair dados.' 
                } : item
            ));

            if (err.message && err.message.includes("A chave da API do Gemini não está configurada")) {
                setBatchResults([]);
                setIsLoading(false);
                setStatusMessage(null);
                return;
            }
        }
    }

    setHistory(prev => [...newHistoryEntries, ...prev]);
    setIsLoading(false);
    
    const finalStatusMessage = `Processamento concluído. ${successCount} com sucesso, ${errorCount} com falha.`;
    setStatusMessage(finalStatusMessage);

    // Envia uma notificação se a permissão foi concedida
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Extração Concluída', {
            body: finalStatusMessage,
            icon: '/vite.svg' 
        });
    }

  }, [imageFiles, extractAsTable, selectedImageIndices]);
  
  const handleReset = () => {
    imageUrls.forEach(url => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImageUrls([]);
    setSelectedImageIndices([]);
    setError(null);
    setIsLoading(false);
    setBatchResults([]);
    setStatusMessage(null);
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
    URL.revokeObjectURL(imageUrls[indexToRemove]);
    setImageFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setImageUrls(prevUrls => prevUrls.filter((_, index) => index !== indexToRemove));
    setSelectedImageIndices(prev => prev.filter(i => i !== indexToRemove).map(i => (i > indexToRemove ? i - 1 : i)));
  };


  const handleDeleteHistoryItem = async (id: number) => {
    try {
      await deleteExtraction(id);
      setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const handleViewHistoryItem = (entry: HistoryEntry) => {
    handleReset();
    setImageUrls([entry.imageDataUrl]);

    const batchItem: BatchResultItem = {
      id: entry.id!,
      imageSrc: entry.imageDataUrl,
      fileName: `Histórico #${entry.id}`,
      actionResults: entry.actionResults || [],
      status: 'completed',
    };

    if (entry.dataType === 'table') {
      try {
        const tableData = JSON.parse(entry.data);
        batchItem.table = tableData;
      } catch(e) {
        console.error("Failed to parse table data from history:", e);
        batchItem.error = "Não foi possível carregar os dados da tabela do histórico.";
        batchItem.status = 'failed';
      }
    } else {
      batchItem.text = entry.data;
    }
    
    setBatchResults([batchItem]);
    setError(null);
    setIsLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCropper = (index: number, urlOverride?: string) => {
    const imageUrl = urlOverride || imageUrls[index];
    if (!imageUrl) {
        console.error("URL da imagem não encontrada para o índice:", index);
        return;
    }
    setCroppingState({
      isOpen: true,
      image: { index, url: imageUrl },
    });
  };
  
  const handleCloseCropper = () => {
    setCroppingState({ isOpen: false, image: null });
  };
  
  const handleConfirmCrop = (croppedImageFile: File) => {
    if (croppingState.image === null) return;
  
    const { index } = croppingState.image;
  
    const newImageFiles = [...imageFiles];
    newImageFiles[index] = croppedImageFile;
    setImageFiles(newImageFiles);
  
    const newImageUrls = [...imageUrls];
    URL.revokeObjectURL(newImageUrls[index]);
    newImageUrls[index] = URL.createObjectURL(croppedImageFile);
    setImageUrls(newImageUrls);
  
    handleCloseCropper();
  };

  const handlePerformAction = async (id: string | number, title: string, prompt: string, content: string) => {
    if (typeof id !== 'number') return; // Ações são apenas para itens com ID de banco de dados
    
    const fullPrompt = `${prompt}\n\n---\n\n${content}`;

    setBatchResults(prev => prev.map(item => 
        item.id === id ? { ...item, isActionLoading: true, actionResult: null } : item
    ));
    
    try {
        const result = await generateFollowUp(fullPrompt);
        
        const newActionResult = { name: title, prompt, result, timestamp: Date.now() };
        const updatedEntry = await addActionResult(id, newActionResult);

        setBatchResults(prev => prev.map(item => 
            item.id === id ? { 
              ...item, 
              isActionLoading: false, 
              actionResult: result,
              actionResults: updatedEntry.actionResults
            } : item
        ));
        
        // Sincroniza o estado do histórico com o banco de dados atualizado
        setHistory(prevHistory => prevHistory.map(entry => 
            entry.id === id ? updatedEntry : entry
        ));

    } catch (err: any) {
        handleExtractionError(err);
        const errorMessage = err.message || 'Ocorreu um erro ao processar sua solicitação.';
        
        setBatchResults(prev => prev.map(item => 
            item.id === id ? { ...item, isActionLoading: false, actionResult: errorMessage } : item
        ));
    }
  };

  const handleSaveAction = async (action: CustomAction) => {
    try {
        const savedAction = await saveCustomAction(action);
        // Se a ação já tinha um id, é uma edição
        if (action.id) {
            setCustomActions(prev => 
                prev.map(a => (a.id === savedAction.id ? savedAction : a))
            );
        } else { // Senão, é uma nova ação
            setCustomActions(prev => [...prev, savedAction]);
        }
    } catch (err) {
        console.error("Falha ao salvar a ação:", err);
        setError("Não foi possível salvar a ação personalizada.");
    }
  };

  const handleDeleteAction = async (actionId: number) => {
    try {
        await deleteCustomAction(actionId);
        // Atualização otimista da UI: remove a ação do estado local.
        // Isso fornece feedback instantâneo e assume que a exclusão no DB foi bem-sucedida.
        setCustomActions(prev => prev.filter(action => action.id !== actionId));
    } catch (err) {
        console.error("Falha ao deletar a ação:", err);
        setError("Não foi possível deletar a ação personalizada.");
        // Opcional: recarregar do banco de dados em caso de falha para garantir a consistência
        loadCustomActions();
    }
  };

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (showLanding) return;
      const items = event.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            // Renomeia o arquivo para ter um nome mais descritivo
            const renamedFile = new File([file], `colado-${Date.now()}.${file.type.split('/')[1] || 'png'}`, { type: file.type });
            files.push(renamedFile);
          }
        }
      }

      if (files.length > 0) {
        event.preventDefault();
        handleImageChange(files);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (showLanding) return;

        const activeElement = document.activeElement;
        const isTyping = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT');

        if (event.ctrlKey && event.key.toLowerCase() === 'u') {
          event.preventDefault();
          imageUploaderRef.current?.triggerFileInput();
        } else if (event.ctrlKey && event.key === 'Enter') {
          if (!isTyping && selectedImageIndices.length > 0 && !isLoading && !isConvertingPdf) {
            event.preventDefault();
            handleExtractText();
          }
        } else if (event.key === 'Escape') {
          if (isImageViewerOpen) {
            event.preventDefault();
            handleCloseImageViewer();
          } else if (!isTyping && !isActionModalOpen && !isConsolidatedViewOpen && !croppingState.isOpen && (imageFiles.length > 0 || batchResults.length > 0)) {
            event.preventDefault();
            handleReset();
          }
        }
      };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleExtractText, isActionModalOpen, isConsolidatedViewOpen, croppingState.isOpen, imageFiles.length, batchResults.length, selectedImageIndices.length, isLoading, isConvertingPdf, isImageViewerOpen, showLanding]);

  const consolidatedText = useMemo(() => {
    if (batchResults.length <= 1) return '';
    return batchResults
      .filter(result => result.status === 'completed')
      .map(result => {
        const header = `--- INÍCIO: ${result.fileName} ---`;
        const footer = `--- FIM: ${result.fileName} ---\n\n`;
        let content = '';
        if (result.error) {
          content = `Erro: ${result.error}`;
        } else if (result.table) {
          content = JSON.stringify(result.table, null, 2);
        } else {
          content = result.text || 'Nenhum texto extraído.';
        }
        return `${header}\n${content}\n${footer}`;
      })
      .join('');
  }, [batchResults]);

  const handleOpenImageViewer = (url: string) => {
    setViewerImageUrl(url);
    setIsImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
      setIsImageViewerOpen(false);
      setViewerImageUrl(null);
  };


  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }


  const isReadOnly = batchResults.length > 0 && imageFiles.length === 0;
  
  let buttonText = 'Extrair Texto';
  if (isConvertingPdf) buttonText = 'Convertendo PDF...';
  else if (isLoading) buttonText = 'Extraindo...';
  else if (selectedImageIndices.length > 0) {
    buttonText = `Extrair de ${selectedImageIndices.length} selecionada(s)`;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <AppHeader />

      <main className="w-full max-w-4xl flex flex-col items-center gap-8">
        <UploadSection
          imageUploaderRef={imageUploaderRef}
          onImageChange={handleImageChange}
          imageUrls={imageUrls}
          onClearAll={handleReset}
          onRemoveImage={handleRemoveImage}
          onCropImage={handleOpenCropper}
          disabled={isLoading || isConvertingPdf}
          isReadOnly={isReadOnly}
          selectedIndices={selectedImageIndices}
          onSelectionChange={setSelectedImageIndices}
          onImageClick={isReadOnly ? handleOpenImageViewer : undefined}
          extractAsTable={extractAsTable}
          setExtractAsTable={setExtractAsTable}
          onManageActions={() => setIsActionModalOpen(true)}
          onExtract={handleExtractText}
          buttonText={buttonText}
          error={error}
          selectedImageCount={selectedImageIndices.length}
        />
        
        <ResultsSection 
            isLoading={isLoading}
            batchResults={batchResults}
            error={error}
            statusMessage={statusMessage}
            onConsolidate={() => setIsConsolidatedViewOpen(true)}
            onAction={handlePerformAction}
            customActions={customActions}
        />
      </main>

      <HistorySection 
        history={history}
        onView={handleViewHistoryItem}
        onDelete={handleDeleteHistoryItem}
      />

      <ImageCropModal
        isOpen={croppingState.isOpen}
        imageUrl={croppingState.image?.url || null}
        onConfirm={handleConfirmCrop}
        onCancel={handleCloseCropper}
      />

      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        actions={customActions}
        onSaveAction={handleSaveAction}
        onDeleteAction={handleDeleteAction}
      />
      
      <ConsolidatedViewModal 
        isOpen={isConsolidatedViewOpen}
        onClose={() => setIsConsolidatedViewOpen(false)}
        consolidatedText={consolidatedText}
      />

      <ImageViewerModal 
        isOpen={isImageViewerOpen}
        imageUrl={viewerImageUrl}
        onClose={handleCloseImageViewer}
      />

      <AppFooter />
    </div>
  );
};

export default App;