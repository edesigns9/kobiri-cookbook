import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { enhanceInstruction } from '../services/geminiService';
import type { RecipeInstruction } from '../types';

interface InstructionsListProps {
  recipeName: string;
  instructions: RecipeInstruction[];
}

const InstructionsList: React.FC<InstructionsListProps> = ({ recipeName, instructions }) => {
  const [enhanced, setEnhanced] = useState<Record<number, string>>({});
  const [isEnhancing, setIsEnhancing] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState<Record<number, boolean>>({});

  const handleToggle = useCallback(async (step: number, description: string) => {
    if (isEnhancing === step) return;

    if (enhanced[step]) {
      setIsOpen(prev => ({ ...prev, [step]: !prev[step] }));
      return;
    }

    setIsEnhancing(step);
    try {
      const enhancedText = await enhanceInstruction(recipeName, description);
      setEnhanced(prev => ({ ...prev, [step]: enhancedText }));
      setIsOpen(prev => ({ ...prev, [step]: true }));
    } catch (error: any) {
      toast.error("Enhancement Failed", { description: error.message });
    } finally {
      setIsEnhancing(null);
    }
  }, [recipeName, isEnhancing, enhanced]);

  if (!instructions || instructions.length === 0) {
    return <p className="text-muted-foreground">No instructions provided.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-4">Instructions</h2>
      <ul className="space-y-6">
        {instructions.map((instr) => (
          <li key={instr.step} className="flex items-start gap-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              {instr.step}
            </div>
            <div className="flex-grow">
              <p>{instr.description}</p>
              <Button
                size="sm"
                variant="link"
                className="px-0 h-auto text-primary"
                onClick={() => handleToggle(instr.step, instr.description)}
                disabled={isEnhancing === instr.step}
              >
                {isEnhancing === instr.step ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {enhanced[instr.step] ? (isOpen[instr.step] ? 'Hide Details' : 'Show Details') : 'Enhance with AI'}
              </Button>
              {isOpen[instr.step] && enhanced[instr.step] && (
                <div className="mt-2 p-4 border rounded-md bg-muted text-sm" dangerouslySetInnerHTML={{ __html: enhanced[instr.step].replace(/\n/g, '<br />') }} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InstructionsList; 