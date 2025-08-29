
import React from 'react';
import { ResultCard, ExtractedTable } from '../ResultCard';
import { DocumentDuplicateIcon } from '../icons';
import { CustomAction, HistoryEntry } from '../../services/db';

export interface BatchResultItem {
    id: number | string;
    imageSrc: string;
    fileName: string;
    text?: string;
    table?: ExtractedTable;
    error?: string;
    isActionLoading?: boolean;
    actionResult?: string;
    actionResults?: HistoryEntry['actionResults'];
    status?: 'pending' | 'processing' | 'completed' | 'failed';
}

interface ResultsSectionProps {
    isLoading: boolean;
    batchResults: BatchResultItem[];
    error: string | null;
    statusMessage: string | null;
    onConsolidate: () => void;
    onAction: (id: string | number, title: string, prompt: string, content: string) => void;
    customActions: CustomAction[];
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
    isLoading,
    batchResults,
    error,
    statusMessage,
    onConsolidate,
    onAction,
    customActions
}) => {
    // Exibe um erro global se existir, tipicamente para erros de upload/configuração
    if (error && !isLoading && batchResults.length === 0) {
        return <ResultCard error={error} extractedText={null} extractedTable={null} onAction={() => {}} customActions={[]} />;
    }
    
    // Não renderiza nada se não houver resultados nem carregamento
    if (batchResults.length === 0) {
        return null;
    }
    
    return (
        <div className="w-full space-y-4">
            {statusMessage && (
                <div className="w-full p-4 text-center bg-dark-card border border-dark-border rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p>{statusMessage}</p>
                    {!isLoading && batchResults.length > 1 && batchResults.some(r => r.status === 'completed') && (
                        <button
                            onClick={onConsolidate}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-primary/80 hover:bg-brand-primary text-white rounded-md transition-colors whitespace-nowrap"
                        >
                            <DocumentDuplicateIcon className="w-5 h-5" />
                            Consolidar Resultados
                        </button>
                    )}
                </div>
            )}

            {batchResults.map(item => (
                <ResultCard
                    key={item.id}
                    id={item.id}
                    status={item.status}
                    error={item.error || null}
                    extractedText={item.text || null}
                    extractedTable={item.table || null}
                    imageSrc={item.imageSrc}
                    fileName={item.fileName}
                    onAction={onAction}
                    isActionLoading={item.isActionLoading}
                    actionResult={item.actionResult}
                    customActions={customActions}
                    actionResults={item.actionResults}
                />
            ))}
        </div>
    );
};
