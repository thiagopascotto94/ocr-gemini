# OCR com Gemini

Uma aplicação web moderna e poderosa para extrair texto e tabelas de imagens e PDFs usando a API do Google Gemini. A aplicação é totalmente executada no navegador, garantindo a privacidade dos seus dados.

## ✨ Funcionalidades

- **Extração de Texto Precisa**: Converte imagens de documentos, notas ou capturas de tela em texto editável com alta fidelidade, alimentado pelo modelo `gemini-2.5-flash`.
- **Reconhecimento de Tabelas**: Extrai dados estruturados de tabelas em imagens diretamente para um formato de tabela (JSON), que pode ser baixado como `.xlsx`.
- **Múltiplos Métodos de Upload**:
    - **Upload de Arquivos**: Suporte para múltiplos arquivos `PNG`, `JPG`, `WEBP` e `PDF`.
    - **Arrastar e Soltar (Drag & Drop)**: Solte seus arquivos diretamente na interface.
    - **Colar da Área de Transferência**: Cole uma imagem diretamente na página com `Ctrl+V`.
    - **Captura de Tela**: Use a ferramenta de captura de tela integrada para selecionar uma área do seu monitor.
- **Processamento em Lote**: Envie e processe até 10 imagens ou páginas de PDF de uma só vez.
- **Ferramentas de Imagem**: Corte e ajuste suas imagens antes da extração para focar na área de interesse.
- **Ações com IA**: Vá além da extração. Utilize prompts para:
    - Resumir o texto extraído.
    - Traduzir para outros idiomas.
    - Listar os pontos principais.
    - Criar e salvar suas próprias ações personalizadas.
- **Leitura em Voz Alta (Text-to-Speech)**: Ouça o texto extraído com vozes nativas do navegador.
- **Exportação de Dados**: Baixe os resultados como arquivos `.txt` ou `.xlsx` (para tabelas).
- **Histórico Local**: Suas extrações são salvas localmente no seu navegador usando IndexedDB, para que você possa revisitá-las a qualquer momento.
- **Interface Intuitiva**: Um design moderno, responsivo e com tema escuro, construído com Tailwind CSS.
- **Atalhos de Teclado**: Aumente sua produtividade com atalhos para upload (`Ctrl+U`), extração (`Ctrl+Enter`) e limpeza (`Esc`).
- **Privacidade em Primeiro Lugar**: Toda a conversão e processamento de imagens ocorrem no navegador. As imagens são enviadas diretamente para a API do Google Gemini e não são armazenadas em nenhum servidor intermediário.

## 🚀 Como Usar

1.  **Abra a aplicação** no seu navegador.
2.  **Adicione uma imagem ou PDF** usando um dos métodos disponíveis:
    - Clique em "Clique para fazer o upload" ou na área pontilhada.
    - Arraste e solte os arquivos na área designada.
    - Use o botão "Capturar Tela".
    - Cole uma imagem da sua área de transferênica (`Ctrl+V`).
3.  **Selecione as imagens** que deseja processar. Por padrão, todas as imagens carregadas são selecionadas.
4.  (Opcional) Se a sua imagem contém uma tabela, ative a opção **"Extrair como Tabela"**.
5.  Clique no botão **"Extrair..."**.
6.  Aguarde o processamento. Os resultados aparecerão abaixo da área de upload.
7.  Use as ferramentas disponíveis no card de resultado: **Copiar**, **Download**, **Ouvir** ou execute uma **Ação Personalizada**.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **API de IA**: [Google Gemini API (`@google/genai`)](https://ai.google.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Armazenamento Local**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- **Processamento de PDF**: [pdf.js](https://mozilla.github.io/pdf.js/)
- **Corte de Imagem**: [react-image-crop](https://github.com/DominicTobias/react-image-crop)
- **Exportação para Excel**: [SheetJS (xlsx)](https://sheetjs.com/)

## ⚙️ Configuração e Execução Local

Para executar este projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/ocr-com-gemini.git
    cd ocr-com-gemini
    ```

2.  **Configure sua Chave de API do Gemini:**
    A aplicação requer uma chave de API do Google Gemini para funcionar. Ela deve ser fornecida através de uma variável de ambiente do seu sistema de build (ex: Vite, Webpack) ou da plataforma de hospedagem (ex: Vercel, Netlify).

    - O código-fonte espera que a chave esteja disponível em `process.env.API_KEY`.
    - **Exemplo com Vite:** Crie um arquivo chamado `.env.local` na raiz do projeto.
    - Adicione sua chave de API ao arquivo, prefixada com `VITE_` para que o Vite a exponha ao cliente:
      ```
      VITE_API_KEY=SUA_CHAVE_DE_API_AQUI
      ```
    - Você pode obter uma chave de API no [Google AI Studio](https://aistudio.google.com/app/apikey).

3.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    # ou
    yarn dev
    ```

5.  Abra seu navegador e acesse `http://localhost:5173` (ou a porta indicada no terminal).

## 📂 Estrutura do Projeto

```
/src
├── components/       # Componentes React reutilizáveis
│   ├── app/          # Componentes de layout principais
│   ├── ActionModal.tsx
│   ├── HistorySection.tsx
│   ├── icons.tsx
│   ├── ImageCropModal.tsx
│   ├── ImageUploader.tsx
│   ├── LandingPage.tsx
│   └── ResultCard.tsx
├── hooks/            # Hooks customizados
│   └── useTTS.ts
├── services/         # Módulos de lógica de negócios
│   ├── db.ts         # Interação com IndexedDB
│   ├── geminiService.ts # Comunicação com a API Gemini
│   └── pdfService.ts   # Processamento de PDF
├── App.tsx           # Componente principal da aplicação
└── index.tsx         # Ponto de entrada da aplicação
```

## 👤 Autor

Desenvolvido por **Thiago Pascotto**.
