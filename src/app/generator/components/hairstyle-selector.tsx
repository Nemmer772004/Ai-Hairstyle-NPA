'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { hairstyles, hairstyleCategories, type Hairstyle } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface HairstyleSelectorProps {
  selectedHairstyle: Hairstyle | null;
  onSelectHairstyle: (hairstyle: Hairstyle) => void;
  suggestedHairstyles: string[];
}

export default function HairstyleSelector({ selectedHairstyle, onSelectHairstyle, suggestedHairstyles }: HairstyleSelectorProps) {
  const [activeTab, setActiveTab] = useState('all');

  const normalizedSuggestions = suggestedHairstyles.map(s => s.toLowerCase());

  const filteredHairstyles = hairstyles
    .filter(h => activeTab === 'all' || h.category === activeTab)
    .sort((a, b) => b.popularity - a.popularity);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 font-headline">Choose a Hairstyle</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          {hairstyleCategories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="capitalize">{cat}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredHairstyles.map(style => {
              const isSuggested = normalizedSuggestions.some(suggestion => style.name.toLowerCase().includes(suggestion));
              return (
                <Card 
                  key={style.id} 
                  className={`overflow-hidden transition-all duration-300 ${selectedHairstyle?.id === style.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <Image
                        src={style.imageUrl}
                        alt={style.name}
                        data-ai-hint={style.imageHint}
                        width={200}
                        height={200}
                        className="object-cover w-full h-32 md:h-40"
                      />
                      {isSuggested && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                          <CheckCircle2 size={16} />
                          <span className="sr-only">Suggested</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm truncate">{style.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{style.category}</p>
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => onSelectHairstyle(style)}
                        variant={selectedHairstyle?.id === style.id ? 'secondary' : 'default'}
                      >
                        {selectedHairstyle?.id === style.id ? 'Selected' : 'Try This'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
