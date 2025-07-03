import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { PlusCircle, XCircle } from 'lucide-react';
import type { Recipe, RecipeIngredient, RecipeInstruction } from '../types';
import { addUserRecipe } from '../services/userRecipeService';
import { useTitle } from '../hooks/useTitle';

const initialRecipeState: Omit<Recipe, 'id' | 'source' | 'imageUrl' | 'isCurated'> = {
    name: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'Medium',
    category: '',
    ingredients: [{ name: '', amount: '' }],
    instructions: [{ step: 1, description: '' }],
};

const AddRecipePage: React.FC = () => {
    useTitle('Add Recipe');
    const [recipeData, setRecipeData] = useState(initialRecipeState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRecipeData(prev => ({ ...prev, [name]: value }));
    };

    const handleDynamicChange = (
        index: number,
        field: 'ingredients' | 'instructions',
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setRecipeData(prev => {
            const newList = prev[field].map((item, i) =>
                i === index ? { ...item, [name]: value } : item
            );
            
            if (field === 'ingredients') {
                return { ...prev, ingredients: newList as RecipeIngredient[] };
            } else {
                return { ...prev, instructions: newList as RecipeInstruction[] };
            }
        });
    };

    const addDynamicField = (field: 'ingredients' | 'instructions') => {
        if (field === 'ingredients') {
            setRecipeData(prev => ({
                ...prev,
                ingredients: [...prev.ingredients, { name: '', amount: '' }],
            }));
        } else {
            setRecipeData(prev => ({
                ...prev,
                instructions: [...prev.instructions, { step: prev.instructions.length + 1, description: '' }],
            }));
        }
    };

    const removeDynamicField = (index: number, field: 'ingredients' | 'instructions') => {
        if (recipeData[field].length <= 1) return; // Must have at least one
        
        setRecipeData(prev => {
            const newList = prev[field].filter((_, i) => i !== index);

            if (field === 'instructions') {
                const renumberedInstructions = (newList as RecipeInstruction[]).map((inst, idx) => ({
                    ...inst,
                    step: idx + 1,
                }));
                return { ...prev, instructions: renumberedInstructions };
            } else {
                return { ...prev, ingredients: newList as RecipeIngredient[] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Authentication Error", { description: "You must be logged in to create a recipe." });
            return;
        }

        if (recipeData.name.trim() === '' || recipeData.ingredients[0].name.trim() === '' || recipeData.instructions[0].description.trim() === '') {
            toast.error("Validation Error", { description: "Recipe name, at least one ingredient, and one instruction are required." });
            return;
        }

        setIsSubmitting(true);
        try {
            const newRecipe = await addUserRecipe(recipeData, user);
            toast.success("Recipe Added!", { description: `Your recipe "${newRecipe.name}" has been saved.` });
            navigate(`/recipe/kobiri/${newRecipe.id}`);
        } catch (error) {
            console.error("Failed to save recipe", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error("Save Failed", { description: `Could not save your recipe: ${errorMessage}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="text-center py-16">
                 <h1 className="text-3xl font-bold mb-4">Log in to Add a Recipe</h1>
                 <p className="text-muted-foreground mb-6">You need to be logged in to share your creations.</p>
                 <Button asChild>
                     <Link to="/login">Log In / Sign Up</Link>
                 </Button>
             </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <BackButton />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Add Your Recipe</CardTitle>
                    <CardDescription>Share your culinary creation with the Kọbiri community.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">Basic Information</h3>
                            <div className="space-y-2">
                                <Label htmlFor="name">Recipe Name</Label>
                                <Input id="name" name="name" value={recipeData.name} onChange={handleInputChange} placeholder="e.g., Grandma's Famous Lasagna" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" value={recipeData.description} onChange={handleInputChange} placeholder="A short, enticing description of your dish." required />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="prepTime">Prep Time</Label>
                                    <Input id="prepTime" name="prepTime" value={recipeData.prepTime} onChange={handleInputChange} placeholder="e.g., 20 mins" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cookTime">Cook Time</Label>
                                    <Input id="cookTime" name="cookTime" value={recipeData.cookTime} onChange={handleInputChange} placeholder="e.g., 45 mins" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="servings">Servings</Label>
                                    <Input id="servings" name="servings" value={recipeData.servings} onChange={handleInputChange} placeholder="e.g., 4-6" />
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input id="category" name="category" value={recipeData.category} onChange={handleInputChange} placeholder="e.g., Italian, Dinner" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="difficulty">Difficulty</Label>
                                    <select id="difficulty" name="difficulty" value={recipeData.difficulty} onChange={handleInputChange} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Ingredients */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">Ingredients</h3>
                            {recipeData.ingredients.map((ing, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                                    <div className="sm:flex-1 space-y-2 w-full">
                                        <Label htmlFor={`ing-amount-${index}`} className="text-xs">Amount</Label>
                                        <Input id={`ing-amount-${index}`} name="amount" value={ing.amount} onChange={(e) => handleDynamicChange(index, 'ingredients', e)} placeholder="e.g., 1 cup" />
                                    </div>
                                    <div className="sm:flex-[2] space-y-2 w-full">
                                        <Label htmlFor={`ing-name-${index}`} className="text-xs">Name</Label>
                                        <Input id={`ing-name-${index}`} name="name" value={ing.name} onChange={(e) => handleDynamicChange(index, 'ingredients', e)} placeholder="e.g., All-purpose flour" required />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicField(index, 'ingredients')} disabled={recipeData.ingredients.length <= 1} className="self-end sm:self-end h-10 w-10">
                                        <XCircle className="w-5 h-5 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addDynamicField('ingredients')}>
                                <PlusCircle className="w-4 h-4 mr-2" /> Add Ingredient
                            </Button>
                        </div>
                        
                        {/* Instructions */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">Instructions</h3>
                            {recipeData.instructions.map((inst, index) => (
                               <div key={index} className="flex items-start gap-2">
                                    <span className="font-bold text-lg pt-2">{inst.step}.</span>
                                    <Textarea name="description" value={inst.description} onChange={(e) => handleDynamicChange(index, 'instructions', e)} placeholder="Describe this step..." required rows={3} />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicField(index, 'instructions')} disabled={recipeData.instructions.length <= 1}>
                                        <XCircle className="w-5 h-5 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addDynamicField('instructions')}>
                                <PlusCircle className="w-4 h-4 mr-2" /> Add Step
                            </Button>
                        </div>

                        <div className="text-right">
                            <Button type="submit" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Recipe'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddRecipePage;