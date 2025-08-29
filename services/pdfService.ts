import * as pdfjsLib from 'pdfjs-dist';

// Configura o worker para a biblioteca pdf.js a partir de um CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs';

/**
 * Converte um arquivo PDF em um array de arquivos de imagem, um para cada página.
 * @param file O arquivo PDF a ser convertido.
 * @returns Uma promessa que resolve para um array de objetos de arquivo de imagem.
 */
export const convertPdfToImages = async (file: File): Promise<File[]> => {
  const images: File[] = [];
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(data).promise;
  const numPages = pdf.numPages;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    // Aumenta a escala para uma melhor qualidade de imagem e resultados de OCR
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Não foi possível obter o contexto do canvas');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // FIX: The TypeScript error indicates that the 'canvas' property is required in the RenderParameters. This is likely due to mismatched type definitions for the pdfjs-dist version in use.
    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.95)
    );

    if (blob) {
      images.push(new File([blob], `${file.name}-pagina-${i}.jpeg`, { type: 'image/jpeg' }));
    }
  }

  return images;
};
