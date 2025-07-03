import React, { createContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { MarketListItem, Recipe } from '../types';
import { organizeShoppingList } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';


export interface MarketListContextType {
  list: MarketListItem[];
  addRecipeIngredientsToList: (recipe: Recipe) => void;
  addManualItem: (itemName: string) => void;
  toggleItemChecked: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  clearList: () => void;
  isRecipeOnList: (recipeName: string) => boolean;
  organizeList: () => Promise<void>;
  isOrganizing: boolean;
}

export const MarketListContext = createContext<MarketListContextType | undefined>(undefined);

export const MarketListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [list, setList] = useState<MarketListItem[]>([]);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const { user } = useAuth();

  const fetchList = useCallback(async (userId: string) => {
    const { data, error } = await supabase
        .from('market_list_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error("Error fetching market list:", error);
        toast.error("Could not load your market list.");
        setList([]);
    } else {
        setList(data || []);
    }
  }, []);
  
  useEffect(() => {
    if (user) {
        fetchList(user.id);
    } else {
        // If user logs out, clear the list
        setList([]);
    }
  }, [user, fetchList]);

  const isRecipeOnList = useCallback((recipeName: string) => {
    return list.some(item => item.from_recipe?.includes(recipeName));
  }, [list]);

  const addRecipeIngredientsToList = useCallback(async (recipe: Recipe) => {
    if (!user) return;

    const itemsToAdd: Omit<MarketListItem, 'id' | 'user_id'>[] = [];
    const itemsToUpdate: MarketListItem[] = [];
    let itemsAddedCount = 0;

    recipe.ingredients.forEach(ingredient => {
        const normalizedName = ingredient.name.trim().toLowerCase();
        const existingItem = list.find(item => item.name.trim().toLowerCase() === normalizedName && !item.checked);

        if (existingItem) {
            const newAmount = ingredient.amount.trim();
            if (newAmount) {
                existingItem.amount += `, ${newAmount}`;
            }
            if (existingItem.from_recipe && !existingItem.from_recipe.includes(recipe.name)) {
                existingItem.from_recipe += `, ${recipe.name}`;
            }
            itemsToUpdate.push(existingItem);
        } else {
            itemsToAdd.push({
                name: ingredient.name.trim(),
                amount: ingredient.amount.trim(),
                checked: false,
                from_recipe: recipe.name,
                category: undefined,
            });
            itemsAddedCount++;
        }
    });

    if (itemsToUpdate.length > 0) {
        const updates = itemsToUpdate.map(item => {
            const payload: Partial<MarketListItem> = { amount: item.amount, from_recipe: item.from_recipe };
            return supabase.from('market_list_items')
                .update(payload)
                .eq('id', item.id);
        });
        await Promise.all(updates);
    }

    if (itemsToAdd.length > 0) {
        const newDbItems = itemsToAdd.map(item => ({...item, user_id: user.id }));
        const { error } = await supabase.from('market_list_items').insert(newDbItems);
        if (error) {
            toast.error("Failed to add some items.");
            console.error(error);
        }
    }
    
    // Refresh list from DB to get all changes
    await fetchList(user.id);
    
    if (itemsAddedCount > 0) {
        toast.success(`Added ${itemsAddedCount} new ingredient(s) from "${recipe.name}".`);
    } else {
        toast.info(`All ingredients from "${recipe.name}" were already on your list. Amounts updated.`);
    }

  }, [list, user, fetchList]);
  
  const addManualItem = useCallback(async (itemName: string) => {
    if(!itemName.trim() || !user) return;

    const newItem: Omit<MarketListItem, 'id'> = {
        user_id: user.id,
        name: itemName.trim(),
        amount: '1',
        checked: false,
        from_recipe: null,
        category: 'Other',
    };

    const { data, error } = await supabase.from('market_list_items').insert([newItem]).select().single();
    if(error) {
        toast.error("Could not add item.");
    } else {
        setList(prev => [...prev, data]);
    }
  }, [user]);

  const toggleItemChecked = useCallback(async (itemId: string) => {
    const item = list.find(i => i.id === itemId);
    if (!item) return;

    const payload: Partial<MarketListItem> = { checked: !item.checked };
    const { error } = await supabase
        .from('market_list_items')
        .update(payload)
        .eq('id', itemId);
    
    if (error) {
        toast.error("Could not update item.");
    } else {
        setList(prev => prev.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i));
    }
  }, [list]);
  
  const removeItem = useCallback(async (itemId: string) => {
    const { error } = await supabase.from('market_list_items').delete().eq('id', itemId);
    if (error) {
        toast.error("Could not remove item.");
    } else {
        setList(prev => prev.filter(item => item.id !== itemId));
    }
  }, []);

  const clearList = useCallback(async () => {
    if(!user) return;
    const { error } = await supabase.from('market_list_items').delete().eq('user_id', user.id);
    if(error) {
        toast.error("Could not clear list.");
    } else {
        setList([]);
        toast.success('Market list cleared!');
    }
  }, [user]);
  
  const organizeList = useCallback(async () => {
    if (list.length === 0) {
        toast.info("Your list is empty.", { description: "Add some items before organizing." });
        return;
    }
    
    setIsOrganizing(true);
    const organizeToast = toast.loading("Kọbiri Chef is organizing your list...");
    
    try {
        const itemNames = list.map(item => item.name);
        const categorizedItems = await organizeShoppingList(itemNames);
        
        const updates = list.map(item => {
            let newCategory = 'Other';
            for (const category in categorizedItems) {
                if(categorizedItems[category].find(catItem => catItem.toLowerCase() === item.name.toLowerCase())) {
                    newCategory = category;
                    break;
                }
            }
            const payload: Partial<MarketListItem> = { category: newCategory };
            return supabase
                .from('market_list_items')
                .update(payload)
                .eq('id', item.id);
        });

        await Promise.all(updates);
        if (user) await fetchList(user.id); // Refresh the list from DB

        toast.success("Your list is now organized!", { id: organizeToast });

    } catch(error: any) {
        console.error("Failed to organize list with AI", error);
        toast.error("Organization Failed", { id: organizeToast, description: error.message || "Could not organize the list at this time." });
    } finally {
        setIsOrganizing(false);
    }
  }, [list, user, fetchList]);

  return (
    <MarketListContext.Provider value={{ list, addRecipeIngredientsToList, addManualItem, toggleItemChecked, removeItem, clearList, isRecipeOnList, organizeList, isOrganizing }}>
      {children}
    </MarketListContext.Provider>
  );
};
