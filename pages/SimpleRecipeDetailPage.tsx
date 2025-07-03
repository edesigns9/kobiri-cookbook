import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { ArrowLeft } from 'lucide-react';

// Sample recipe data
const sampleRecipes = {
  '1': {
    id: '1',
    name: 'Jollof Rice',
    description: 'A flavorful West African rice dish cooked in a rich tomato sauce with aromatic spices.',
    imageUrl: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    source: 'KOBIRI',
    category: 'Main Course',
    prepTime: '30 mins',
    cookTime: '45 mins',
    servings: '4',
    difficulty: 'Medium',
    ingredients: [
      { name: 'Long grain rice', amount: '2 cups' },
      { name: 'Tomatoes', amount: '4 large' },
      { name: 'Onions', amount: '2 medium' },
      { name: 'Red bell pepper', amount: '1' },
      { name: 'Vegetable oil', amount: '1/3 cup' },
      { name: 'Chicken stock', amount: '2 cups' },
      { name: 'Curry powder', amount: '1 tbsp' },
      { name: 'Thyme', amount: '1 tsp' },
      { name: 'Bay leaves', amount: '2' },
      { name: 'Salt', amount: 'to taste' }
    ],
    instructions: [
      { step: 1, description: 'Blend tomatoes, red bell pepper, and 1 onion until smooth.' },
      { step: 2, description: 'Heat oil in a large pot and sauté the remaining chopped onion until translucent.' },
      { step: 3, description: 'Add the blended mixture and cook on medium heat for 10-15 minutes.' },
      { step: 4, description: 'Add curry powder, thyme, bay leaves, and salt. Stir well.' },
      { step: 5, description: 'Add washed rice and chicken stock. Stir, cover, and cook on low heat for 30 minutes.' },
      { step: 6, description: 'Check if rice is cooked. If not, add a little water and cook for another 5-10 minutes.' },
      { step: 7, description: 'Serve hot with your choice of protein.' }
    ]
  },
  '2': {
    id: '2',
    name: 'Egusi Soup',
    description: 'A rich Nigerian soup made with ground melon seeds and leafy vegetables.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    source: 'KOBIRI',
    category: 'Soup',
    prepTime: '20 mins',
    cookTime: '1 hour',
    servings: '6',
    difficulty: 'Medium',
    ingredients: [
      { name: 'Ground egusi (melon seeds)', amount: '2 cups' },
      { name: 'Palm oil', amount: '1/2 cup' },
      { name: 'Beef or goat meat', amount: '500g' },
      { name: 'Spinach or bitter leaf', amount: '2 cups' },
      { name: 'Onions', amount: '1 large' },
      { name: 'Stock cubes', amount: '2' },
      { name: 'Salt', amount: 'to taste' },
      { name: 'Scotch bonnet pepper', amount: '1-2' }
    ],
    instructions: [
      { step: 1, description: 'Cook meat with onions, salt, and stock cubes until tender. Reserve the stock.' },
      { step: 2, description: 'Heat palm oil in a pot and sauté chopped onions.' },
      { step: 3, description: 'Mix ground egusi with a little water to form a paste.' },
      { step: 4, description: 'Add the egusi paste to the pot and stir continuously for 10 minutes.' },
      { step: 5, description: 'Add meat stock, cooked meat, and additional water if needed.' },
      { step: 6, description: 'Cover and simmer for 20 minutes, stirring occasionally.' },
      { step: 7, description: 'Add chopped vegetables, stir, and cook for another 5 minutes.' },
      { step: 8, description: 'Adjust seasoning and serve with fufu, pounded yam, or rice.' }
    ]
  },
  '3': {
    id: '3',
    name: 'Pounded Yam & Vegetable Soup',
    description: 'Traditional Nigerian pounded yam served with a nutritious vegetable soup.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    source: 'KOBIRI',
    category: 'Main Course',
    prepTime: '30 mins',
    cookTime: '1 hour',
    servings: '4',
    difficulty: 'Hard',
    ingredients: [
      { name: 'Yam', amount: '1 large tuber' },
      { name: 'Assorted meat and fish', amount: '500g' },
      { name: 'Spinach or pumpkin leaves', amount: '2 cups' },
      { name: 'Palm oil', amount: '1/4 cup' },
      { name: 'Onions', amount: '1 medium' },
      { name: 'Stock cubes', amount: '2' },
      { name: 'Salt', amount: 'to taste' },
      { name: 'Scotch bonnet pepper', amount: '1' }
    ],
    instructions: [
      { step: 1, description: 'Peel, cut, and wash yam. Boil until soft.' },
      { step: 2, description: 'Pound the boiled yam in a mortar with a pestle until smooth and stretchy.' },
      { step: 3, description: 'For the soup, cook meat and fish with onions, salt, and stock cubes.' },
      { step: 4, description: 'Heat palm oil in a pot and add chopped onions and pepper.' },
      { step: 5, description: 'Add the cooked meat, fish, and their stock.' },
      { step: 6, description: 'Simmer for 10 minutes, then add chopped vegetables.' },
      { step: 7, description: 'Cook for another 5 minutes and adjust seasoning.' },
      { step: 8, description: 'Serve the pounded yam with the vegetable soup.' }
    ]
  }
};

const SimpleRecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string; source: string }>();
  const recipe = id ? sampleRecipes[id as keyof typeof sampleRecipes] : null;

  if (!recipe) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-semibold">Recipe not found.</p>
        <Button asChild className="mt-4">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild className="flex items-center gap-2">
          <Link to="/">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader className="flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            {recipe.category && <Badge variant="secondary" className="mb-2">{recipe.category}</Badge>}
            <CardTitle className="text-3xl sm:text-4xl font-extrabold">{recipe.name}</CardTitle>
            <p className="mt-4 text-lg text-muted-foreground">{recipe.description}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <img src={recipe.imageUrl} alt={recipe.name} className="w-full rounded-lg shadow-md aspect-[4/3] object-cover" />
              <Card className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="font-bold">{recipe.prepTime}</p>
                    <p className="text-sm text-muted-foreground">Prep Time</p>
                  </div>
                  <div>
                    <p className="font-bold">{recipe.cookTime}</p>
                    <p className="text-sm text-muted-foreground">Cook Time</p>
                  </div>
                  <div>
                    <p className="font-bold">{recipe.servings}</p>
                    <p className="text-sm text-muted-foreground">Servings</p>
                  </div>
                </div>
                <div className="text-center mt-4 border-t pt-4">
                  <p className="font-bold">{recipe.difficulty}</p>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-4">Ingredients</h2>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ing, index) => (
                    <li key={index} className="flex items-center">
                      <Checkbox id={`ing-${index}`} className="peer" />
                      <Label htmlFor={`ing-${index}`} className="ml-3 font-medium transition-colors peer-data-[state=checked]:line-through peer-data-[state=checked]:text-muted-foreground">{ing.amount} {ing.name}</Label>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-4">Instructions</h2>
                <ol className="space-y-6">
                  {recipe.instructions.map(inst => (
                    <li key={inst.step} className="flex items-start gap-4">
                      <span className="flex-shrink-0 grid place-items-center bg-primary text-primary-foreground font-bold w-8 h-8 rounded-full">{inst.step}</span>
                      <div className="flex-grow pt-1">
                        <p>{inst.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleRecipeDetailPage; 