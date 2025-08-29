import { useState, useEffect, useCallback } from 'react';

// Nova função para limpar o texto de caracteres de formatação
const sanitizeTextForSpeech = (inputText: string | null): string => {
  if (!inputText) return '';

  // Remove a formatação semelhante a Markdown para uma melhor síntese de fala.
  const sanitizedText = inputText
    // Processa negrito/itálico com 2 caracteres primeiro
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Processa negrito/itálico com 1 caractere
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove marcadores de código em linha (crases)
    .replace(/`(.*?)`/g, '$1')
    // Remove tachado
    .replace(/~~(.*?)~~/g, '$1')
    // Remove cabeçalhos de markdown
    .replace(/^#+\s/gm, '')
    // Substitui links de markdown, mas mantém o texto do link
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

  return sanitizedText.trim();
};

export const useTTS = (text: string | null) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const ptVoices = availableVoices.filter(voice => voice.lang.startsWith('pt'));
        setVoices(ptVoices);
        if (ptVoices.length > 0) {
          // Tenta encontrar uma voz preferida ou usa a primeira
          const preferredVoice = ptVoices.find(v => v.name.includes('Google') && v.lang === 'pt-BR') || ptVoices[0];
          setSelectedVoice(preferredVoice);
        }
      };

      // Carrega as vozes imediatamente se já estiverem disponíveis
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        // Aguarda o evento `voiceschanged`
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const handleSpeechEnd = useCallback(() => {
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    // Função para parar a fala ao descarregar a página ou componente
    const cleanup = () => {
      window.speechSynthesis.cancel();
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [isSupported]);
  

  const play = useCallback(() => {
    if (!isSupported || isPlaying || !text) return;

    window.speechSynthesis.cancel(); // Cancela qualquer fala anterior

    const cleanText = sanitizeTextForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = 'pt-BR';
    }

    utterance.onend = handleSpeechEnd;
    utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        handleSpeechEnd(); // Garante que o estado seja redefinido em caso de erro
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [text, isPlaying, isSupported, handleSpeechEnd, selectedVoice]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, [isSupported]);

  const handleVoiceChange = (voiceName: string) => {
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
    }
  };

  return { play, stop, isPlaying, isSupported, voices, selectedVoice, handleVoiceChange };
};
