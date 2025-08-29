
import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon, DownloadIcon, PlayIcon, StopIcon } from './icons';
import { useTTS } from '../hooks/useTTS';
import { CustomAction, HistoryEntry } from '../services/db';

// Informa ao TypeScript sobre a variável global XLSX injetada pelo script CDN
declare const XLSX: any;

export interface ExtractedTable {
    headers: string[];
    rows: (string | number)[][];
}

interface ResultCardProps {
  id?: string | number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  fileName?: string;
  error: string | null;
  extractedText: string | null;
  extractedTable: ExtractedTable | null;
  imageSrc?: string;
  onAction: (id: string | number, title: string, prompt: string, content: string) => void;
  isActionLoading?: boolean;
  actionResult?: string | null;
  customActions: CustomAction[];
  actionResults?: HistoryEntry['actionResults'];
}

const LoadingSkeleton: React.FC = () => (
    <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-600 rounded w-3/4"></div>
        <div className="h-4 bg-gray-600 rounded w-full"></div>
        <div className="h-4 bg-gray-600 rounded w-5/6"></div>
        <div className="h-4 bg-gray-600 rounded w-1/2"></div>
    </div>
);

const tableToTsv = (table: ExtractedTable): string => {
    const header = table.headers.join('\t');
    const body = table.rows.map(row => row.join('\t')).join('\n');
    return `${header}\n${body}`;
};

const ActionResponse: React.FC<{ content: string | null }> = ({ content }) => {
    const [isCopied, setIsCopied] = useState(false);
    const { play, stop, isPlaying, isSupported, voices, selectedVoice, handleVoiceChange } = useTTS(content);

    if (!content) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-semibold text-dark-text">Resposta da IA</h4>
                <div className="flex items-center gap-2">
                    {isSupported && (
                      <>
                        {voices.length > 0 && (
                            <select
                                value={selectedVoice?.name || ''}
                                onChange={(e) => handleVoiceChange(e.target.value)}
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-brand-primary focus:border-brand-primary h-full px-2 py-1.5"
                                aria-label="Selecionar voz"
                            >
                                {voices.map(voice => (
                                    <option key={voice.name} value={voice.name}>
                                        {voice.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <button
                            onClick={isPlaying ? stop : play}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                            aria-label={isPlaying ? 'Parar leitura' : 'Ler texto em voz alta'}
                        >
                            {isPlaying ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                            <span>{isPlaying ? 'Parar' : 'Ouvir'}</span>
                        </button>
                      </>
                    )}
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                        >
                        {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                        {isCopied ? 'Copiado!' : 'Copiar'}
                    </button>
                </div>
            </div>
            <div className="w-full bg-dark-bg rounded-lg p-4 max-h-60 overflow-y-auto">
                 <p className="whitespace-pre-wrap font-sans text-dark-text-secondary">{content}</p>
            </div>
        </div>
    );
};

const ActionHistoryItem: React.FC<{ action: NonNullable<HistoryEntry['actionResults']>[0] }> = ({ action }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(action.result);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-dark-bg/50 p-3 rounded-lg">
            <div className="flex justify-between items-start mb-2 gap-2">
                <div>
                    <h4 className="text-md font-semibold text-brand-light">{action.name}</h4>
                    <span className="text-xs text-dark-text-secondary">{new Date(action.timestamp).toLocaleString('pt-BR')}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                    aria-label="Copiar resultado da ação"
                >
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                    {isCopied ? 'Copiado' : 'Copiar'}
                </button>
            </div>
            <div className="w-full bg-dark-bg rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="whitespace-pre-wrap font-sans text-dark-text-secondary">{action.result}</p>
            </div>
        </div>
    );
};


export const ResultCard: React.FC<ResultCardProps> = ({ id, status, fileName, error, extractedText, extractedTable, imageSrc, onAction, isActionLoading, actionResult, customActions, actionResults }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { play, stop, isPlaying, isSupported, voices, selectedVoice, handleVoiceChange } = useTTS(extractedText);

  const handleCopy = () => {
    let textToCopy: string | null = null;
    if (extractedTable) {
        textToCopy = tableToTsv(extractedTable);
    } else if (extractedText) {
        textToCopy = extractedText;
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  const handleDownload = () => {
    if (extractedTable) {
        // Lógica para download de XLSX
        const worksheet = XLSX.utils.aoa_to_sheet([extractedTable.headers, ...extractedTable.rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dados Extraídos");
        XLSX.writeFile(workbook, "extracao_tabela.xlsx");

    } else if (extractedText) {
        // Lógica para download de TXT
        const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'extracao.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  };

  const isLoading = status === 'processing' || status === 'pending';
  const hasActionableContent = status === 'completed' && !error && (!!extractedText || !!extractedTable);
  const contentForAction = extractedTable ? JSON.stringify(extractedTable, null, 2) : extractedText || '';
  const copyButtonText = isCopied ? 'Copiado!' : (extractedTable ? 'Copiar Tabela' : 'Copiar');

  return (
    <div className="w-full p-6 bg-dark-card border border-dark-border rounded-2xl shadow-lg relative">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-y-2">
            <div className="flex items-center gap-4">
              {imageSrc && <img src={imageSrc} alt="Miniatura" className="w-16 h-16 object-cover rounded-md bg-dark-bg" />}
              <div>
                <h2 className="text-xl font-semibold">Resultado do OCR</h2>
                {fileName && <p className="text-sm text-dark-text-secondary truncate max-w-xs">{fileName}</p>}
              </div>
            </div>
            {hasActionableContent && (
                <div className="flex items-center gap-2 flex-wrap">
                    {isSupported && extractedText && (
                        <>
                           {voices.length > 0 && (
                                <select
                                    value={selectedVoice?.name || ''}
                                    onChange={(e) => handleVoiceChange(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-brand-primary focus:border-brand-primary h-full px-2 py-1.5"
                                    aria-label="Selecionar voz"
                                >
                                    {voices.map(voice => (
                                        <option key={voice.name} value={voice.name}>
                                            {voice.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <button
                                onClick={isPlaying ? stop : play}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-brand-light"
                                aria-label={isPlaying ? 'Parar leitura' : 'Ler texto em voz alta'}
                            >
                                {isPlaying ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                                <span>{isPlaying ? 'Parar' : 'Ouvir'}</span>
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-brand-light"
                        aria-label={extractedTable ? 'Baixar como XLSX' : 'Baixar como TXT'}
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-brand-light"
                    >
                        {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                        {copyButtonText}
                    </button>
                </div>
            )}
        </div>
      
      <div className="w-full min-h-[100px] bg-dark-bg rounded-lg overflow-y-auto max-h-96">
        {isLoading && (
            <div className="p-4">
                <LoadingSkeleton />
                <p className="mt-2 text-center text-dark-text-secondary">{status === 'pending' ? 'Aguardando na fila...' : 'Processando...'}</p>
            </div>
        )}
        {status === 'failed' && error && <p className="text-red-400 p-4">{error}</p>}
        
        {status === 'completed' && extractedTable ? (
            <div className="overflow-x-auto p-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-700/50">
                            {extractedTable.headers.map((header, i) => (
                                <th key={i} className="p-3 text-sm font-semibold text-dark-text border-b-2 border-dark-border">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {extractedTable.rows.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-700/30 transition-colors">
                                {row.map((cell, j) => (
                                    <td key={j} className="p-3 text-sm text-dark-text-secondary border-b border-dark-border">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            status === 'completed' && extractedText && <p className="whitespace-pre-wrap font-mono text-dark-text-secondary p-4">{extractedText}</p>
        )}
      </div>

      {hasActionableContent && (
        <div className="mt-6 border-t border-dark-border pt-4">
            <h3 className="text-lg font-semibold mb-3 text-dark-text">Ações Personalizadas</h3>
            <div className="flex flex-wrap gap-2">
                {customActions.map(action => (
                     <button
                        key={action.id}
                        onClick={() => onAction(id || 'single-result', action.name, action.prompt, contentForAction)}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {action.name}
                    </button>
                ))}
            </div>
        </div>
      )}

      {(isActionLoading || actionResult) && (
        <div className="mt-6 border-t border-dark-border pt-4">
          {isActionLoading && <LoadingSkeleton />}
          {!isActionLoading && actionResult && <ActionResponse content={actionResult} />}
        </div>
      )}

      {hasActionableContent && actionResults && actionResults.length > 0 && (
          <div className="mt-6 border-t border-dark-border pt-4">
              <h3 className="text-lg font-semibold mb-3 text-dark-text">Histórico de Ações</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {actionResults.slice().reverse().map((action, index) => (
                      <ActionHistoryItem key={index} action={action} />
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};
