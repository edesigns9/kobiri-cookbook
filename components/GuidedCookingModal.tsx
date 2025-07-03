import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Recipe } from '../types';
import { useSpeech } from '../hooks/useSpeech';
import { getCookingAssistantResponse, enhanceInstruction } from '../services/geminiService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Mic, ChevronLeft, ChevronRight, MessageSquare, Loader2, Volume2, ChevronDown, Sparkles } from 'lucide-react';

interface GuidedCookingModalProps {
  recipe: Recipe;
  onClose: () => void;
}

const GuidedCookingModal: React.FC<GuidedCookingModalProps> = ({ recipe, onClose }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [enhancedInstruction, setEnhancedInstruction] = useState<string | null>(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    
    const { 
        speak, 
        cancelSpeech, 
        startListening, 
        isListening, 
        transcript,
        clearTranscript,
        isSpeechSupported,
        voices,
        selectedVoice,
        setVoice 
    } = useSpeech();
    
    const currentInstruction = recipe.instructions[currentStepIndex];

    // Read step aloud when it changes or when the modal opens
    useEffect(() => {
        if (isSpeechSupported && currentInstruction) {
            speak(`Step ${currentInstruction.step}. ${currentInstruction.description}`);
        }
    }, [currentStepIndex, speak, currentInstruction, isSpeechSupported]);

    // Process the transcript from the user's question when listening stops
    useEffect(() => {
        const fetchAiResponse = async () => {
            if (transcript && currentInstruction) {
                setIsThinking(true);
                setAiResponse(null);
                try {
                    const response = await getCookingAssistantResponse(
                        recipe.name,
                        currentInstruction.description,
                        transcript
                    );
                    setAiResponse(response);
                    speak(response);
                } catch (error) {
                    const errorMessage = "Sorry, I couldn't process that. Please try again.";
                    setAiResponse(errorMessage);
                    speak(errorMessage);
                } finally {
                    setIsThinking(false);
                    clearTranscript();
                }
            }
        };
        fetchAiResponse();
    }, [transcript, recipe.name, currentInstruction, speak, clearTranscript]);

    const handleNext = () => {
        if (currentStepIndex < recipe.instructions.length - 1) {
            cancelSpeech();
            setAiResponse(null);
            setEnhancedInstruction(null);
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            cancelSpeech();
            setAiResponse(null);
            setEnhancedInstruction(null);
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handleEnhanceInstruction = async () => {
        if (!currentInstruction || isEnhancing) return;

        setIsEnhancing(true);
        setEnhancedInstruction(null);
        try {
            const enhancedText = await enhanceInstruction(recipe.name, currentInstruction.description);
            setEnhancedInstruction(enhancedText);
        } catch (error: any) {
            toast.error("Enhancement Failed", { description: error.message || "Could not get enhanced instructions." });
        } finally {
            setIsEnhancing(false);
        }
    };
    
    const handleDismissAiResponse = () => {
        cancelSpeech();
        setAiResponse(null);
    };


    return (
        <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4 animate-in fade-in-0">
            <Card className="w-full max-w-3xl h-full max-h-[95vh] flex flex-col shadow-2xl">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl">Guided Cooking: {recipe.name}</CardTitle>
                        <CardDescription>Step {currentInstruction.step} of {recipe.instructions.length}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close guided cooking">
                        <X className="h-6 w-6" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between overflow-y-auto pt-0">
                    <div className="flex-grow py-6 space-y-4">
                        <p className="text-2xl md:text-3xl font-serif leading-relaxed">
                            {currentInstruction.description}
                        </p>
                        <div className="mt-2">
                            {isEnhancing ? (
                                <div className="flex items-center text-primary p-2">
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    <span>Enhancing instruction...</span>
                                </div>
                            ) : enhancedInstruction ? (
                                <div className="p-4 border-l-4 border-primary bg-accent rounded-r-lg space-y-2">
                                    <p className="font-semibold text-primary">Kọbiri Chef's Tips:</p>
                                    <p className="text-muted-foreground whitespace-pre-line">
                                        {enhancedInstruction}
                                    </p>
                                    <Button variant="link" size="sm" onClick={() => setEnhancedInstruction(null)} className="px-0 h-auto py-0 text-xs text-muted-foreground">
                                        Hide Details
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="secondary" size="sm" onClick={handleEnhanceInstruction}>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Enhance Instruction
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    { (isThinking || aiResponse) && (
                        <div className="mt-6 p-4 bg-accent rounded-lg flex gap-4 items-start relative">
                            {aiResponse && !isThinking && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDismissAiResponse}
                                    className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-foreground"
                                    aria-label="Dismiss AI response"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                             <MessageSquare className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                             <div className="pr-6">
                                <p className="font-semibold">Kọbiri Chef</p>
                                {isThinking && <Loader2 className="w-5 h-5 animate-spin my-2 text-primary" />}
                                {aiResponse && <p className="text-muted-foreground">{aiResponse}</p>}
                             </div>
                        </div>
                    )}
                </CardContent>

                <div className="p-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button onClick={handlePrev} disabled={currentStepIndex === 0} variant="outline" size="lg" className="flex-1 sm:flex-auto">
                            <ChevronLeft className="w-5 h-5 mr-2" /> Prev
                        </Button>
                        <Button onClick={handleNext} disabled={currentStepIndex === recipe.instructions.length - 1} size="lg" className="flex-1 sm:flex-auto">
                            Next <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row items-center gap-4 w-full sm:w-auto">
                         {isSpeechSupported && voices.length > 0 && (
                            <div className="relative w-full sm:w-auto">
                                <Volume2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                                <select
                                    value={selectedVoice?.voiceURI || ''}
                                    onChange={(e) => setVoice(e.target.value)}
                                    className="h-11 pl-10 pr-8 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none w-full sm:w-48"
                                    aria-label="Select voice"
                                >
                                    {voices.map(voice => (
                                        <option key={voice.voiceURI} value={voice.voiceURI}>
                                            {voice.name.split('(')[0].trim()}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                        )}
                        { isSpeechSupported && (
                            <Button 
                                onClick={startListening} 
                                disabled={isListening || isThinking} 
                                variant="secondary"
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                <Mic className={`w-5 h-5 mr-2 ${isListening ? 'animate-pulse text-destructive' : ''}`} />
                                {isListening ? 'Listening...' : 'Ask the Chef'}
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default GuidedCookingModal;