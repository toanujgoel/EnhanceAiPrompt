import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MODEL_NAMES } from '../constants';
import AdBanner from './AdBanner';
import { useUser } from '../hooks/useUser';
import { UserPlan } from '../types';
import { MicrophoneIcon, StopCircleIcon } from './icons/Icons';

// Helper to convert audio buffer to base64
function audioBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

const AudioTranscriber: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [timer, setTimer] = useState(0);
    const { user, incrementUsage } = useUser();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Timer effect for transcription loading
    useEffect(() => {
        let intervalId: number | undefined;
        if (isTranscribing) {
            setTimer(0);
            intervalId = window.setInterval(() => {
                setTimer(prevTimer => prevTimer + 1);
            }, 1000);
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isTranscribing]);

    const stopRecording = () => {
        setIsRecording(false);
        
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    };

    const transcribeAudio = async (audioBlob: Blob) => {
        try {
            // Check usage limits for free users
            if (user.plan === UserPlan.FREE) {
                if (!incrementUsage('transcribe')) {
                    setError(`You have reached your daily limit of 5 uses. Upgrade to Pro for unlimited access.`);
                    setIsTranscribing(false); // Reset loading state
                    return;
                }
            }

            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
            
            // Convert blob to base64
            const arrayBuffer = await audioBlob.arrayBuffer();
            const base64Audio = audioBufferToBase64(arrayBuffer);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{
                    parts: [{
                        inlineData: {
                            data: base64Audio,
                            mimeType: audioBlob.type
                        }
                    }, {
                        text: "Please transcribe this audio recording into text. Only return the transcribed text, nothing else."
                    }]
                }]
            });

            const transcribedText = response.text.trim();
            setTranscription(prev => prev + (prev ? ' ' : '') + transcribedText);
            
        } catch (err: any) {
            console.error('Transcription error:', err);
            setError('Failed to transcribe audio. Please try again.');
        } finally {
            setIsTranscribing(false); // Stop loading state
        }
    };

    const startRecording = async () => {
        setError(null);
        setTranscription('');
        setIsTranscribing(false);
        chunksRef.current = [];

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Media recording not supported in this browser');
            }

            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });
            
            mediaStreamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
                setIsTranscribing(true); // Start loading state for transcription
                transcribeAudio(audioBlob);
            };

            mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                setError('Recording failed. Please try again.');
                setIsRecording(false);
                setIsTranscribing(false);
            };

            mediaRecorder.start(1000); // Record in 1-second chunks
            setIsRecording(true);

        } catch (err: any) {
            console.error('Failed to start recording:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Microphone access denied. Please allow microphone permissions and try again.');
            } else if (err.name === 'NotFoundError') {
                setError('No microphone found. Please connect a microphone and try again.');
            } else {
                setError('Could not start recording. Please check your microphone and try again.');
            }
            setIsRecording(false);
            setIsTranscribing(false);
        }
    };
    
    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            stopRecording();
        };
    }, []);

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
                    disabled={isTranscribing}
                    className={`flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full text-white transition-all duration-300 mx-auto
                        ${isTranscribing 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : isRecording 
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                            : 'bg-primary-600 hover:bg-primary-700'
                        }`}
                    aria-label={isTranscribing ? 'Transcribing...' : isRecording ? 'Stop recording' : 'Start recording'}
                >
                    {isTranscribing ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    ) : isRecording ? (
                        <StopCircleIcon />
                    ) : (
                        <MicrophoneIcon />
                    )}
                </button>
                <p className="mt-6 text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {isTranscribing 
                        ? 'Transcribing your audio...' 
                        : isRecording 
                        ? 'Recording... Click to stop and transcribe' 
                        : 'Press the button to start recording'
                    }
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 min-h-[300px]">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Thoughts in Text</h2>
                <div className="w-full h-full p-4 bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-xl overflow-y-auto min-h-[200px]">
                    {error && <p className="text-red-500 font-medium">{error}</p>}
                    {isTranscribing ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                                Transcribing your audio... {timer}s
                            </p>
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                            {transcription || 'Your transcribed thoughts will appear here in real-time...'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AudioTranscriber;