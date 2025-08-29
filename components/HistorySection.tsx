
import React from 'react';
import { HistoryEntry } from '../services/db';
import { HistoryIcon, TableIcon, TrashIcon, SparklesIcon } from './icons';

interface HistorySectionProps {
  history: HistoryEntry[];
  onView: (entry: HistoryEntry) => void;
  onDelete: (id: number) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ history, onView, onDelete }) => {
  return (
    <div className="w-full max-w-4xl mt-8">
      <div className="flex items-center gap-3 mb-4">
        <HistoryIcon className="w-8 h-8 text-brand-light" />
        <h2 className="text-2xl font-bold">Histórico de Extrações</h2>
      </div>
      {history.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-lg p-8 text-center text-dark-text-secondary">
          <p>Nenhuma extração foi salva ainda.</p>
          <p className="text-sm">Faça uma nova extração para vê-la aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
            {history.map((entry) => (
            <div key={entry.id} className="bg-dark-card border border-dark-border rounded-lg p-4 flex items-start sm:items-center gap-4 transition-all hover:border-brand-primary">
                <div className="relative">
                    <img 
                        src={entry.imageDataUrl} 
                        alt="Miniatura da imagem" 
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md bg-dark-bg"
                    />
                    {entry.actionResults && entry.actionResults.length > 0 && (
                        <div className="absolute top-1 left-1 bg-yellow-500/80 p-1 rounded-full backdrop-blur-sm" title="Esta extração possui ações de IA">
                            <SparklesIcon className="w-4 h-4 text-white" />
                        </div>
                    )}
                    {entry.dataType === 'table' && (
                        <div className="absolute bottom-1 right-1 bg-brand-secondary/80 p-1 rounded-full backdrop-blur-sm">
                            <TableIcon className="w-4 h-4 text-white" />
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm text-dark-text-secondary mb-1">
                        {new Date(entry.timestamp).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-dark-text-secondary text-sm font-mono truncate">
                        {entry.dataType === 'table' ? '[Tabela] ' : ''}
                        {entry.data || 'Nenhum texto extraído.'}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 ml-auto">
                    <button
                        onClick={() => onView(entry)}
                        className="px-3 py-1.5 text-sm bg-brand-primary/80 hover:bg-brand-primary text-white rounded-md transition-colors whitespace-nowrap"
                        aria-label="Visualizar extração"
                    >
                        Ver
                    </button>
                    <button
                        onClick={() => onDelete(entry.id!)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                        aria-label="Excluir extração"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};
