import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type SpeechRecognitionResultLike = { 0: { transcript: string }; isFinal: boolean };
type SpeechRecognitionEventLike = { results: ArrayLike<SpeechRecognitionResultLike> };
type SpeechRecognitionErrorLike = { error?: string };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Voice search via the Web Speech API. Calls `onResult` with the final transcript.
 * Toasts a clear message when unsupported or on error.
 */
export function useVoiceSearch(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const cbRef = useRef(onResult);
  cbRef.current = onResult;

  useEffect(() => () => recRef.current?.abort(), []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      toast.error("Voice search isn't supported in this browser");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new Ctor();
    rec.lang = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let got = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(" ").trim();
      if (text) {
        got = true;
        cbRef.current(text);
      }
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        toast.error("Microphone access was blocked. Allow it in your browser settings to use voice search.");
      } else if (e.error === "no-speech") {
        toast("We didn't hear anything. Please try again.");
      } else if (e.error !== "aborted") {
        toast.error("Voice search failed. Please try again.");
      }
      got = true;
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
      if (!got) toast("We didn't catch that. Please try again.");
    };
    try {
      recRef.current = rec;
      rec.start();
      setListening(true);
      toast("Listening…");
    } catch {
      recRef.current = null;
      setListening(false);
      toast.error("Voice search couldn't start. Please try again.");
    }
  }, [listening]);

  return { start, listening, supported: getCtor() !== null };
}
