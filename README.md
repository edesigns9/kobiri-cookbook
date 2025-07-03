# Kọbiri - Your Global Cookbook

A React application for discovering, saving, and cooking recipes from around the world.

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file in the root directory with the following content:
```
# Supabase credentials
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Google Gemini API key
# Get your API key from https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY="your-gemini-api-key"
```
4. Replace the placeholder values with your actual API keys:
   - Get Supabase credentials from your Supabase project settings
   - Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
5. Run the development server: `npm run dev`

## Features

- Browse curated recipes from around the world
- Search for recipes by name, ingredients, or cuisine
- View detailed recipe instructions
- Save favorite recipes to your cookbook
- Create a market list with ingredients from recipes
- AI-powered features using Google's Gemini 2.5 Pro Preview model:
  - Generate recipes from ingredients you have
  - Get cooking assistance while preparing dishes
  - Enhanced cooking instructions
  - Automated cooking time estimation

## Technologies Used

- React
- TypeScript
- Vite
- Supabase (Authentication & Database)
- Google Gemini API (AI features)
- Tailwind CSS
- React Router

## AI Features

This application uses Google's Gemini 2.5 Pro Preview model to power several AI features:

1. **Recipe Generation**: Generate custom recipes based on ingredients you have available
2. **Cooking Assistant**: Get help with cooking techniques and ingredient substitutions
3. **Enhanced Instructions**: Detailed step-by-step cooking instructions with professional tips
4. **Time Estimation**: Automated preparation and cooking time estimation

To use these features, you must have a valid Gemini API key configured in your `.env.local` file.

## Troubleshooting

If you encounter issues with the AI features:

1. Ensure your Gemini API key is correctly set in the `.env.local` file
2. Check that you have access to the Gemini 2.5 Pro Preview model in your Google AI Studio account
3. Restart the development server after making changes to environment variables
