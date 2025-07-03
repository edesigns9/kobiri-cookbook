export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface RecipeInstruction {
  step: number;
  description: string;
}

export interface Recipe {
  id: string | number;
  name:string;
  description: string;
  imageUrl: string;
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  isCurated?: boolean;
  category?: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  source: 'KOBIRI' | 'THEMEALDB' | 'AI';
}

export interface RecipeSummary {
    id: string | number;
    title: string;
    image: string;
    source: 'KOBIRI' | 'THEMEALDB' | 'AI';
    isCurated?: boolean;
    category?: string;
    // Used to pass full AI recipe data without a second API call
    recipe?: Recipe;
}

export interface FavoriteRecipe {
  id: string; // Now a UUID from Supabase
  user_id: string;
  recipe_id: string; // The ID from the recipe source
  source: 'KOBIRI' | 'THEMEALDB' | 'AI';
  title: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
}

export interface MarketListItem {
  id: string; // Now a UUID from Supabase
  user_id: string;
  name: string;
  amount: string;
  checked: boolean;
  from_recipe: string | null;
  category?: string;
}


// Type definitions for the Web Speech API to fix TypeScript errors.
// These are added because the API is not yet a web standard and not in default TS typings.

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  
  start(): void;
  abort(): void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}
