
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

    const stopRecording = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setIsRecording(false);
    };

    const startRecording = async () => {
        setIsRecording(true);
        setTranscription('');
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            sessionPromiseRef.current = ai.live.connect({
                model: MODEL_NAMES.AUDIO_TRANSCRIPTION,
                callbacks: {
                    onopen: () => { console.log('Live session opened.');},
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setTranscription(prev => prev + message.serverContent.inputTranscription.text);
                        }
                    },
                    onerror: (e: any) => {
                        console.error('Live session error:', e);
                        setError('An error occurred during transcription.');
                        stopRecording();
                    },
                    onclose: () => { console.log('Live session closed.'); }
                },
                config: {
                    inputAudioTranscription: {},
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
                sessionPromiseRef.current?.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

        } catch (err) {
            console.error('Failed to start recording:', err);
            setError('Could not access microphone. Please check permissions.');
            setIsRecording(false);
        }
    };
    
    useEffect(() => {
        return () => {
            stopRecording();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Audio Transcription Tool</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Record your voice and get a real-time transcription.</p>
            </div>

            {user.plan === UserPlan.FREE && <AdBanner />}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex justify-center mb-4">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center justify-center w-24 h-24 rounded-full text-white transition-all duration-300
                            ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-600 hover:bg-primary-700'}`}
                    >
                        {isRecording ? <StopCircleIcon /> : <MicrophoneIcon />}
                    </button>
                </div>
                <p className="text-center text-lg font-medium">
                    {isRecording ? 'Recording in progress...' : 'Press the button to start recording'}
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg min-h-[200px]">
                <h2 className="text-lg font-semibold mb-2">Transcription</h2>
                <div className="w-full h-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md overflow-y-auto">
                    {error && <p className="text-red-500">{error}</p>}
                    <p className="whitespace-pre-wrap">{transcription || 'Your transcription will appear here...'}</p>
                </div>
            </div>
        </div>
    );
};

export default AudioTranscriber;
