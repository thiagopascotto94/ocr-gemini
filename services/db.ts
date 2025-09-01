const DB_NAME = 'OcrHistoryDB';
const DB_VERSION = 3;
const STORE_NAME = 'extractions';
const CUSTOM_ACTIONS_STORE_NAME = 'customActions';


export interface HistoryEntry {
  id?: number;
  data: string; // Pode ser texto simples ou JSON.stringify(tabela)
  dataType: 'text' | 'table';
  imageDataUrl: string;
  timestamp: number;
  actionResults?: {
    name: string;
    prompt: string;
    result: string;
    timestamp: number;
  }[];
}

export interface CustomAction {
  id?: number;
  name: string;
  prompt: string;
}

const DEFAULT_ACTIONS: Omit<CustomAction, 'id'>[] = [
  { name: "Resumir", prompt: "Faça um resumo conciso do seguinte conteúdo:" },
  { name: "Pontos Principais", prompt: "Liste os pontos principais do seguinte conteúdo em formato de bullet points:" },
  { name: "Traduzir para Inglês", prompt: "Traduza o seguinte conteúdo para o inglês:" },
  { name: "Extrair E-mails", prompt: "Extraia todos os endereços de e-mail do seguinte texto. Se nenhum for encontrado, responda 'Nenhum e-mail encontrado'."},
  { name: "Organizar", prompt: "Extraia e estruture as informações técnicas e comerciais do produto a seguir. Limite a resposta aos dados **diretamente relevantes** para a ficha técnica e o uso comercial, como tipo de produto, materiais, características de proteção, normas técnicas, diferenciais, uso recomendado e acessórios.\n\nFormate a saída em Markdown, utilizando uma estrutura de tópicos clara e concisa."}
];

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Database error:", request.error);
      reject('Error opening database');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains(CUSTOM_ACTIONS_STORE_NAME)) {
        const actionStore = dbInstance.createObjectStore(CUSTOM_ACTIONS_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        // Adiciona ações padrão na primeira vez que o banco de dados é criado
        DEFAULT_ACTIONS.forEach(action => {
          actionStore.add(action);
        });
      }
    };
  });
};

// --- Funções de Histórico ---

export const addExtraction = async (entry: Omit<HistoryEntry, 'id'>): Promise<HistoryEntry> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(entry);

    request.onsuccess = () => {
        const newEntry = { ...entry, id: request.result as number };
        resolve(newEntry);
    };

    request.onerror = () => {
      console.error('Error adding extraction:', request.error);
      reject('Could not add extraction');
    };
  });
};

export const getAllExtractions = async (): Promise<HistoryEntry[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const sortedResults = request.result.sort((a, b) => b.timestamp - a.timestamp);
      resolve(sortedResults);
    };

    request.onerror = () => {
      console.error('Error fetching extractions:', request.error);
      reject('Could not fetch extractions');
    };
  });
};

export const deleteExtraction = async (id: number): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error('Error deleting extraction:', request.error);
      reject('Could not delete extraction');
    };
  });
};

export const addActionResult = async (
    entryId: number,
    actionResult: { name: string; prompt: string; result: string; timestamp: number }
): Promise<HistoryEntry> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(entryId);

        getRequest.onerror = () => {
            console.error('Error fetching entry:', getRequest.error);
            reject('Could not fetch entry to update');
        };

        getRequest.onsuccess = () => {
            const entry: HistoryEntry = getRequest.result;
            if (entry) {
                if (!entry.actionResults) {
                    entry.actionResults = [];
                }
                entry.actionResults.push(actionResult);

                const putRequest = store.put(entry);
                putRequest.onerror = () => {
                    console.error('Error updating entry:', putRequest.error);
                    reject('Could not update entry');
                };
                putRequest.onsuccess = () => {
                    resolve(entry);
                };
            } else {
                reject('Entry not found');
            }
        };
    });
};


// --- Funções de Ações Personalizadas ---

export const getCustomActions = async (): Promise<CustomAction[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CUSTOM_ACTIONS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(CUSTOM_ACTIONS_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      console.error('Error fetching custom actions:', request.error);
      reject('Could not fetch custom actions');
    };
  });
};

export const saveCustomAction = async (action: CustomAction): Promise<CustomAction> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CUSTOM_ACTIONS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(CUSTOM_ACTIONS_STORE_NAME);
    const request = store.put(action);
    let resultId: number;

    request.onsuccess = () => {
      resultId = request.result as number;
    };
    
    transaction.oncomplete = () => {
      resolve({ ...action, id: resultId });
    };

    transaction.onerror = () => {
      console.error('Transaction error saving custom action:', transaction.error);
      reject('Could not save custom action due to transaction error');
    };
  });
};

export const deleteCustomAction = async (id: number): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CUSTOM_ACTIONS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(CUSTOM_ACTIONS_STORE_NAME);
    store.delete(id);

    transaction.oncomplete = () => {
      resolve();
    };
    
    transaction.onerror = () => {
      console.error('Transaction error deleting custom action:', transaction.error);
      reject('Could not delete custom action due to transaction error');
    };
  });
};