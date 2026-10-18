import { useState, useRef, useCallback, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Custom hook for capturing voice audio via browser MediaRecorder API
 * with simultaneous real-time SpeechRecognition (live STT into textareas)
 * and audio object URL playback support.
 */
export function useMediaRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBase64, setAudioBase64] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioMime, setAudioMime] = useState('audio/webm');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const onTranscriptRef = useRef(null);
  const optionsRef = useRef({});
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const startRecording = useCallback(async (options = {}) => {
    setError(null);
    setAudioBase64(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    setLiveTranscript('');
    finalTranscriptRef.current = '';
    chunksRef.current = [];
    optionsRef.current = options;
    onTranscriptRef.current = typeof options === 'function' ? options : options?.onTranscript;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);

      // Select supported mime type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }
      setAudioMime(mimeType.split(';')[0]);

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.onloadend = async () => {
          const result = reader.result;
          if (typeof result === 'string') {
            const base64Data = result.split(',')[1];
            setAudioBase64(base64Data);

            // If browser SpeechRecognition was not supported or returned empty text,
            // fall back to backend Gemini 2.5 Flash transcription automatically!
            if (!finalTranscriptRef.current.trim() && base64Data) {
              const context = optionsRef.current?.context || 'emergency';
              try {
                setIsTranscribing(true);
                const transcribed = await api.transcribeAudio(base64Data, mimeType.split(';')[0], context);
                if (transcribed) {
                  setLiveTranscript(transcribed);
                  finalTranscriptRef.current = transcribed;
                  if (onTranscriptRef.current) {
                    onTranscriptRef.current(transcribed);
                  }
                }
              } catch (transcribeErr) {
                console.warn('Backend STT fallback notice:', transcribeErr);
              } finally {
                setIsTranscribing(false);
              }
            }
          }
        };
        reader.readAsDataURL(blob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      // Launch browser SpeechRecognition simultaneously alongside MediaRecorder
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const recognition = new SpeechRec();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              fullText += event.results[i][0].transcript + ' ';
            }
            const cleanText = fullText.trim();
            if (cleanText) {
              finalTranscriptRef.current = cleanText;
              setLiveTranscript(cleanText);
              if (onTranscriptRef.current) {
                onTranscriptRef.current(cleanText);
              }
            }
          };

          recognition.onerror = (e) => {
            console.debug('SpeechRecognition notice:', e);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          console.debug('SpeechRecognition start notice:', recErr);
        }
      }

      recorder.start(250);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      setError(err.message || 'Microphone access denied');
      setHasPermission(false);
      setIsRecording(false);
    }
  }, [audioUrl]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBase64(null);
    setAudioBlob(null);
    setLiveTranscript('');
    finalTranscriptRef.current = '';
    setError(null);
    chunksRef.current = [];
  }, [isRecording, audioUrl]);

  return {
    isRecording,
    recordingTime,
    audioBase64,
    audioBlob,
    audioUrl,
    audioMime,
    liveTranscript,
    isTranscribing,
    error,
    hasPermission,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
