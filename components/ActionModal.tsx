import React, { useState, useEffect } from 'react';
import { CustomAction } from '../services/db';
import { XCircleIcon, PencilIcon, TrashIcon, CheckIcon } from './icons';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actions: CustomAction[];
  onSaveAction: (action: CustomAction) => Promise<void>;
  onDeleteAction: (id: number) => Promise<void>;
}

export const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, actions, onSaveAction, onDeleteAction }) => {
  const [editingAction, setEditingAction] = useState<CustomAction | null>(null);
  const [newAction, setNewAction] = useState({ name: '', prompt: '' });

  useEffect(() => {
    // Reseta o formulário ao abrir/fechar o modal
    if (!isOpen) {
      setEditingAction(null);
      setNewAction({ name: '', prompt: '' });
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (editingAction && editingAction.name && editingAction.prompt) {
      await onSaveAction(editingAction);
      setEditingAction(null);
    }
  };

  const handleAddNew = async () => {
    if (newAction.name && newAction.prompt) {
      await onSaveAction(newAction as CustomAction);
      setNewAction({ name: '', prompt: '' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta ação?')) {
        await onDeleteAction(id);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-dark-border">
          <h2 className="text-2xl font-bold">Gerenciar Ações Personalizadas</h2>
          <button onClick={onClose} className="p-2 text-dark-text-secondary hover:bg-gray-700 rounded-full">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto">
            {actions.map(action => (
                <div key={action.id} className="bg-dark-bg p-4 rounded-lg">
                    {editingAction?.id === action.id ? (
                        <div className="space-y-3">
                             <input
                                type="text"
                                value={editingAction.name}
                                onChange={(e) => setEditingAction({ ...editingAction, name: e.target.value })}
                                placeholder="Nome da Ação"
                                className="w-full bg-gray-700 text-white p-2 rounded-md border border-dark-border focus:ring-brand-primary focus:border-brand-primary"
                            />
                            <textarea
                                value={editingAction.prompt}
                                onChange={(e) => setEditingAction({ ...editingAction, prompt: e.target.value })}
                                placeholder="Prompt para a IA"
                                rows={3}
                                className="w-full bg-gray-700 text-white p-2 rounded-md border border-dark-border focus:ring-brand-primary focus:border-brand-primary"
                            />
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setEditingAction(null)} className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded-md">Cancelar</button>
                                <button onClick={handleSave} className="px-3 py-1 text-sm bg-brand-primary hover:bg-brand-secondary rounded-md flex items-center gap-1"><CheckIcon className="w-4 h-4" /> Salvar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-lg">{action.name}</h3>
                                <p className="text-sm text-dark-text-secondary font-mono bg-gray-900/50 p-2 rounded-md mt-1">{action.prompt}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => setEditingAction(action)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-md"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDelete(action.id!)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-md"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>

        <div className="p-6 border-t border-dark-border mt-auto">
            <h3 className="text-xl font-bold mb-3">Adicionar Nova Ação</h3>
            <div className="space-y-3">
                <input
                    type="text"
                    value={newAction.name}
                    onChange={(e) => setNewAction({ ...newAction, name: e.target.value })}
                    placeholder="Nome da Ação (ex: Extrair E-mails)"
                    className="w-full bg-gray-700 text-white p-2 rounded-md border border-dark-border focus:ring-brand-primary focus:border-brand-primary"
                />
                <textarea
                    value={newAction.prompt}
                    onChange={(e) => setNewAction({ ...newAction, prompt: e.target.value })}
                    placeholder="Prompt para a IA (ex: Extraia todos os endereços de e-mail do texto a seguir)"
                    rows={3}
                    className="w-full bg-gray-700 text-white p-2 rounded-md border border-dark-border focus:ring-brand-primary focus:border-brand-primary"
                />
                <button 
                    onClick={handleAddNew}
                    className="w-full px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg"
                >
                    Adicionar Ação
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
