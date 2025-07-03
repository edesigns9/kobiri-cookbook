import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMarketList } from '../hooks/useMarketList';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ShoppingCart, Sparkles, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTitle } from '../hooks/useTitle';

const MarketListPage: React.FC = () => {
    useTitle('Market List');
    const { isLoggedIn } = useAuth();
    const { list, addManualItem, toggleItemChecked, removeItem, clearList, organizeList, isOrganizing } = useMarketList();
    const [manualItem, setManualItem] = useState('');

    const handleAddManualItem = (e: React.FormEvent) => {
        e.preventDefault();
        addManualItem(manualItem);
        setManualItem('');
    };

    const { activeItems, completedItems, groupedActiveItems } = useMemo(() => {
        const active = list.filter(item => !item.checked);
        const completed = list.filter(item => item.checked);
        
        const grouped = active.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as Record<string, typeof active>);

        return { activeItems: active, completedItems: completed, groupedActiveItems: grouped };
    }, [list]);
    
    const categoryOrder = ["Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery", "Pantry", "Frozen Foods", "Beverages", "Household", "Uncategorized", "Other"];

    if (!isLoggedIn) {
        return (
            <div>
                <div className="mb-6">
                    <BackButton />
                </div>
                <div className="text-center py-16">
                    <ShoppingCart className="w-16 h-16 mx-auto text-primary mb-4" />
                    <h1 className="text-3xl font-bold mb-4">My Market List</h1>
                    <p className="text-muted-foreground mb-6">Please log in to manage your shopping list.</p>
                    <Button asChild>
                        <Link to="/login">Go to Login</Link>
                    </Button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <section>
                <div className="mb-4">
                    <BackButton />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">My Market List</h1>
                        <p className="text-muted-foreground">Your smart, consolidated shopping list.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                         <Button variant="outline" onClick={organizeList} disabled={isOrganizing || activeItems.length === 0} className="w-1/2 sm:w-auto">
                            {isOrganizing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            {isOrganizing ? 'Organizing...' : 'Organize'}
                        </Button>
                        <Button variant="destructive" onClick={clearList} disabled={list.length === 0} className="w-1/2 sm:w-auto">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear List
                        </Button>
                    </div>
                </div>
            </section>
            
            <Card>
                <CardHeader>
                    <CardTitle>Add Item</CardTitle>
                    <CardDescription>Manually add items to your list.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddManualItem} className="flex items-center gap-2">
                        <Input 
                            value={manualItem}
                            onChange={(e) => setManualItem(e.target.value)}
                            placeholder="e.g., Paper towels"
                        />
                        <Button type="submit" disabled={!manualItem.trim()}>
                            <PlusCircle className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Add</span>
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {list.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                    <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-medium">Your list is empty</h2>
                    <p className="mt-2 text-muted-foreground">Add ingredients from a recipe or manually add items above.</p>
                    <Button asChild className="mt-6">
                        <Link to="/">Explore Recipes</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">To Buy ({activeItems.length})</h2>
                        <div className="space-y-6">
                            {Object.entries(groupedActiveItems).sort(([catA], [catB]) => categoryOrder.indexOf(catA) - categoryOrder.indexOf(catB)).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="text-lg font-semibold text-primary mb-3 border-b pb-1">{category}</h3>
                                    <ul className="space-y-3">
                                        {items.map(item => (
                                            <li key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                                                <Checkbox
                                                    id={item.id}
                                                    checked={item.checked}
                                                    onCheckedChange={() => toggleItemChecked(item.id)}
                                                    aria-label={`Mark ${item.name} as purchased`}
                                                />
                                                <Label htmlFor={item.id} className="flex-grow">
                                                    <span className="font-medium">{item.name}</span>
                                                    <span className="text-muted-foreground ml-2">({item.amount})</span>
                                                    {item.from_recipe && <p className="text-xs text-muted-foreground/80 italic">from: {item.from_recipe}</p>}
                                                </Label>
                                                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    {completedItems.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Completed ({completedItems.length})</h2>
                            <ul className="space-y-3">
                                {completedItems.map(item => (
                                    <li key={item.id} className="flex items-center gap-3 p-2 rounded-md">
                                        <Checkbox
                                            id={item.id}
                                            checked={item.checked}
                                            onCheckedChange={() => toggleItemChecked(item.id)}
                                        />
                                        <Label htmlFor={item.id} className="flex-grow text-muted-foreground line-through">
                                            <span>{item.name}</span>
                                            <span className="ml-2">({item.amount})</span>
                                        </Label>
                                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default MarketListPage;