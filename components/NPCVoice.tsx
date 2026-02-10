
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Language } from '../types';
import { translations } from '../translations';

const NPCVoice: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const [isActive, setIsActive] = useState(false);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    return () => stopConversation();
  }, []);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startConversation = async () => {
    try {
      // Browsers block audio unless triggered by interaction. Context must be resumed.
      if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      if (!outAudioContextRef.current) outAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      await audioContextRef.current.resume();
      await outAudioContextRef.current.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInst = lang === 'pt' 
        ? 'Você é um guia ancião místico. Responda de forma breve, sábia e poética.' 
        : 'You are a mystical ancient guide. Respond briefly, wisely, and poetically.';

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => {
                try { s.sendRealtimeInput({ media: pcmBlob }); } catch(err) {}
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.interrupted) {
              for (const s of sourcesRef.current) { try { s.stop(); } catch(e) {} }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              setTranscripts(prev => [...prev.slice(-3), `NPC: ${text}`]);
            }
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onerror: (e) => console.error('Live Error:', e),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: systemInst,
          outputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      alert(lang === 'pt' ? "Erro ao acessar áudio." : "Audio access error.");
    }
  };

  const stopConversation = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    for (const s of sourcesRef.current) { try { s.stop(); } catch(e) {} }
    sourcesRef.current.clear();
    setIsActive(false);
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center space-y-10 min-h-[500px]">
      <div className="relative group">
        <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-700 border-4 ${isActive ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_50px_rgba(34,211,238,0.2)]' : 'border-slate-800 opacity-60 bg-slate-900 shadow-inner'}`}>
           <svg className={`w-16 h-16 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_10px_cyan]' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
           </svg>
        </div>
        {isActive && <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping"></div>}
      </div>

      <div className="text-center space-y-3 px-6">
        <h3 className="text-2xl font-game font-bold text-white tracking-tight">{t.liveTitle}</h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-[280px] mx-auto font-medium">
          {isActive ? (lang === 'pt' ? "Sussurros do Multiverso..." : "Whispers from the Multiverse...") : t.liveSub}
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2">
         {transcripts.map((txt, i) => (
           <div key={i} className="text-[10px] text-cyan-300 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50 italic animate-in slide-in-from-left-2 shadow-lg">
             {txt}
           </div>
         ))}
      </div>

      <button onClick={isActive ? stopConversation : startConversation} className={`px-12 py-5 rounded-2xl font-game font-bold transition-all shadow-2xl uppercase tracking-widest text-xs ${isActive ? 'bg-red-900/40 text-red-400 border-2 border-red-500/50 shadow-red-900/20' : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-900/30 active:scale-95 hover:scale-105'}`}>
        {isActive ? t.liveStop : t.liveStart}
      </button>
    </div>
  );
};

export default NPCVoice;
