import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

// Sample data for recipes
const sampleRecipes = [
  {
    id: '1',
    title: 'Jollof Rice',
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    source: 'KOBIRI'
  },
  {
    id: '2',
    title: 'Egusi Soup',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    source: 'KOBIRI'
  },
  {
    id: '3',
    title: 'Pounded Yam & Vegetable Soup',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    source: 'KOBIRI'
  }
];

const SimpleHomePage: React.FC = () => {
  return (
    <div className="space-y-12">
      <section className="text-center py-8 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Find your next favorite dish
        </h1>
        <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          From authentic African classics to trending global cuisine, your culinary adventure starts here.
        </p>
        <div className="max-w-md mx-auto">
          <input 
            type="text" 
            placeholder="Search for recipes..." 
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Kọbiri Curated Recipes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleRecipes.map(recipe => (
            <Card key={recipe.id} className="overflow-hidden">
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{recipe.title}</h3>
                <Button asChild className="mt-2" variant="outline">
                  <Link to={`/recipe/${recipe.source.toLowerCase()}/${recipe.id}`}>
                    View Recipe
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Discover New Recipes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleRecipes.map(recipe => (
            <Card key={`discover-${recipe.id}`} className="overflow-hidden">
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{recipe.title}</h3>
                <Button asChild className="mt-2" variant="outline">
                  <Link to={`/recipe/${recipe.source.toLowerCase()}/${recipe.id}`}>
                    View Recipe
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SimpleHomePage; 