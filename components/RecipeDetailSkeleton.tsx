import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Preheating the oven...",
    "Sourcing the freshest ingredients...",
    "Chopping the vegetables...",
    "Simmering the sauce...",
    "Consulting with our master chefs...",
    "Plating the perfect dish...",
    "Stirring the pot...",
];

const RecipeDetailSkeleton: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="max-w-6xl mx-auto animate-pulse">
            <div className="mb-6 h-10 w-24 bg-gray-200 rounded-lg"></div>
            <div className="bg-white rounded-lg border shadow-sm p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                        <div className="h-6 w-32 bg-gray-200 rounded-md mb-4"></div>
                        <div className="h-10 w-3/4 bg-gray-300 rounded-lg mb-4"></div>
                        <div className="h-5 w-full bg-gray-200 rounded-md mb-2"></div>
                        <div className="h-5 w-5/6 bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="w-full rounded-lg bg-gray-300 aspect-[4/3]"></div>
                        <div className="p-4 border rounded-lg">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i}>
                                        <div className="h-6 w-16 mx-auto bg-gray-300 rounded-md mb-2"></div>
                                        <div className="h-4 w-12 mx-auto bg-gray-200 rounded-md"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-4 border-t pt-4">
                                <div className="h-6 w-16 mx-auto bg-gray-300 rounded-md mb-2"></div>
                                <div className="h-4 w-12 mx-auto bg-gray-200 rounded-md"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="h-8 w-48 bg-gray-300 rounded-md mb-4"></div>
                            <div className="space-y-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className="h-6 w-6 rounded-sm bg-gray-200"></div>
                                        <div className="ml-3 h-5 w-3/4 bg-gray-200 rounded-md"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="h-8 w-48 bg-gray-300 rounded-md mb-4"></div>
                            <div className="space-y-6">
                                {[...Array(4)].map((_, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300"></div>
                                        <div className="pt-1 space-y-2 flex-grow">
                                            <div className="h-5 w-full bg-gray-200 rounded-md"></div>
                                            <div className="h-5 w-4/6 bg-gray-200 rounded-md"></div>
                                        </div>
                                    </li>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <div className="text-center py-6">
                <p className="text-lg font-semibold text-primary transition-opacity duration-500">
                    {loadingMessages[messageIndex]}
                </p>
            </div>
        </div>
    );
};

export default RecipeDetailSkeleton;
