// Browser Speech Recognition & Synthesis Service

// Declare SpeechRecognition interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

class SpeechService {
  private recognition: any = null;
  private isListeningState: boolean = false;
  private isSpeakingState: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = false;
          this.recognition.lang = 'en-US';
        } catch (e) {
          console.warn('SpeechRecognition initialization warning:', e);
        }
      }
    }
  }

  /**
   * Check if Speech-to-text is supported in this browser
   */
  public isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public isSpeechRecognitionSupported(): boolean {
    return this.isRecognitionSupported();
  }

  /**
   * Check if Text-to-speech is supported in this browser
   */
  public isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  /**
   * Start listening for voice query
   */
  public startListening(
    param1:
      | ((transcript: string) => void)
      | {
          onResult: (transcript: string, isFinal?: boolean) => void;
          onError?: (error: string) => void;
          onEnd?: () => void;
        },
    param2?: (error: string) => void,
    param3?: () => void
  ): void {
    let onResult: (transcript: string, isFinal?: boolean) => void;
    let onError: (error: string) => void;
    let onEnd: () => void;

    if (typeof param1 === 'object') {
      onResult = param1.onResult;
      onError = param1.onError || (() => {});
      onEnd = param1.onEnd || (() => {});
    } else {
      onResult = param1;
      onError = param2 || (() => {});
      onEnd = param3 || (() => {});
    }

    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      this.isListeningState = true;

      this.recognition.onresult = (event: any) => {
        const transcript =
          event.results?.[0]?.[0]?.transcript || '';
        const isFinal = event.results?.[0]?.isFinal ?? true;
        this.isListeningState = false;
        onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        this.isListeningState = false;
        console.warn('Speech Recognition error:', event.error);
        if (event.error === 'no-speech') {
          onError('No speech was detected. Please try speaking clearly into your microphone.');
        } else if (event.error === 'not-allowed') {
          onError('Microphone access was denied. Please allow microphone permissions in browser settings.');
        } else {
          onError(`Voice input error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isListeningState = false;
        onEnd();
      };

      this.recognition.start();
    } catch (err: any) {
      this.isListeningState = false;
      onError(err?.message || 'Could not start voice recognition.');
    }
  }

  /**
   * Stop listening
   */
  public stopListening(): void {
    if (this.recognition && this.isListeningState) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Stop recognition error:', e);
      }
    }
    this.isListeningState = false;
  }

  public isListening(): boolean {
    return this.isListeningState;
  }

  /**
   * Speak text out loud using browser SpeechSynthesis
   */
  public speak(text: string, onEnd?: () => void, onError?: (err: any) => void): void {
    if (!this.isSynthesisSupported()) {
      if (onError) onError('Speech synthesis is not supported on this browser.');
      return;
    }

    try {
      this.stopSpeaking();

      // Clean markdown tags for natural speech
      const cleanText = text
        .replace(/[#*_`]/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        this.isSpeakingState = true;
      };

      utterance.onend = () => {
        this.isSpeakingState = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        this.isSpeakingState = false;
        if (onError) onError(e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.isSpeakingState = false;
      if (onError) onError(e);
    }
  }

  /**
   * Stop currently speaking audio
   */
  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Cancel speech synthesis error:', e);
      }
    }
    this.isSpeakingState = false;
  }

  public isSpeaking(): boolean {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return this.isSpeakingState;
  }
}

export const speechService = new SpeechService();
