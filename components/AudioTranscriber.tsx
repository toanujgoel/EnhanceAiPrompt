import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveSession, Modality, Blob, LiveServerMessage } from '@google/genai';
import { MODEL_NAMES } from '../constants';
import AdBanner from './AdBanner';
import { useUser } from '../hooks/useUser';
import { UserPlan } from '../types';
import { MicrophoneIcon, StopCircleIcon } from './icons/Icons';

// Helper to encode Uint8Array to base64
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

const AudioTranscriber: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const fullTranscriptionRef = useRef('');

    // Make stopRecording idempotent and safe to call multiple times
    const stopRecording = () => {
        setIsRecording(false);
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close()).catch(console.error);
            sessionPromiseRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            try {
                scriptProcessorRef.current.disconnect();
            } catch (e) {
                // Can ignore disconnection errors if context is already closed
            }
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
        }
        audioContextRef.current = null;
    };


    const startRecording = async () => {
        // First, ensure any previous session is fully stopped.
        stopRecording();
        
        setIsRecording(true);
        setTranscription('');
        fullTranscriptionRef.current = '';
        setError(null);

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Your browser does not support the Media Devices API.');
            }
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = audioContext;
            
            let currentTranscription = '';

            sessionPromiseRef.current = ai.live.connect({
                model: MODEL_NAMES.AUDIO_TRANSCRIPTION,
                callbacks: {
                    onopen: () => { console.log('Live session opened.');},
                    onmessage: (message: LiveServerMessage) => {
                        const transcriptPart = message.serverContent?.inputTranscription;
                        if (transcriptPart) {
                           if (transcriptPart.isFinal) {
                               fullTranscriptionRef.current += transcriptPart.text;
                               currentTranscription = '';
                           } else {
                               currentTranscription = transcriptPart.text;
                           }
                           setTranscription(fullTranscriptionRef.current + currentTranscription);
                        }
                    },
                    onerror: (e: any) => {
                        console.error('Live session error:', e);
                        setError('An API error occurred during transcription. Please try again.');
                        stopRecording();
                    },
                    onclose: () => { 
                        console.log('Live session closed.');
                        // Let stopRecording handle state, don't call it recursively
                        setIsRecording(false); 
                     }
                },
                config: {
                    inputAudioTranscription: { enableAutomaticPunctuation: true },
                    responseModalities: [] 
                }
            });

            const source = audioContext.createMediaStreamSource(stream);
            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                    int16[i] = inputData[i] * 32768;
                }
                const pcmBlob: Blob = {
                    data: encode(new Uint8Array(int16.buffer)),
                    mimeType: 'audio/pcm;rate=16000',
                };
                
                if (sessionPromiseRef.current) {
                  sessionPromiseRef.current.then((session) => {
                      session.sendRealtimeInput({ media: pcmBlob });
                  }).catch(err => {
                      console.error("Failed to send audio data:", err);
                      setError("Connection lost. Please restart recording.");
                      stopRecording();
                  });
                }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

        } catch (err: any) {
            console.error('Failed to start recording:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Microphone access was denied. Please allow microphone permissions in your browser settings.');
            } else {
                setError('Could not access microphone. Please ensure it is connected and enabled.');
            }
            setIsRecording(false);
        }
    };
    
    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            stopRecording();
        };
    },[]);

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">Record Your Thoughts</h1>
                <p className="mt-3 max-w-2xl mx-auto text-base md:text-lg text-gray-600 dark:text-gray-400">Capture ideas, memos, and fleeting thoughts. Just click record, speak your mind, and we'll turn it into text.</p>
            </div>

            {user.plan === UserPlan.FREE && <AdBanner />}

            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full text-white transition-all duration-300 mx-auto
                        ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary-600 hover:bg-primary-700'}`}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    {isRecording ? <StopCircleIcon /> : <MicrophoneIcon />}
                </button>
                <p className="mt-6 text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {isRecording ? 'Recording in progress...' : 'Press the button to start recording'}
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 min-h-[300px]">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Thoughts in Text</h2>
                <div className="w-full h-full p-4 bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-xl overflow-y-auto min-h-[200px]">
                    {error && <p className="text-red-500 font-medium">{error}</p>}
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{transcription || 'Your transcribed thoughts will appear here in real-time...'}</p>
                </div>
            </div>
        </div>
    );
};

export default AudioTranscriber;