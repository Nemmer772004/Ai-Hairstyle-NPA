'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { hairstyles, hairstyleCategories, type Hairstyle } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Heart } from 'lucide-react';
import { addFavoriteAction } from '@/app/favorites/actions';
import { useToast } from '@/hooks/use-toast';
import { translateHairstyleCategory } from '@/lib/labels';

interface HairstyleSelectorProps {
  selectedHairstyle: Hairstyle | null;
  onSelectHairstyle: (hairstyle: Hairstyle) => void;
  suggestedHairstyles: string[];
}

export default function HairstyleSelector({ selectedHairstyle, onSelectHairstyle, suggestedHairstyles }: HairstyleSelectorProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [isFavoriting, startFavoriting] = useTransition();
  const { toast } = useToast();

  const normalizedSuggestions = suggestedHairstyles.map(s => s.toLowerCase());

  const filteredHairstyles = hairstyles
    .filter(h => activeTab === 'all' || h.category === activeTab)
    .sort((a, b) => b.popularity - a.popularity);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 font-headline">Chọn kiểu tóc</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex w-full flex-wrap gap-2 justify-start p-2 h-auto">
          <TabsTrigger value="all" className="text-xs md:text-sm px-3 py-2 min-w-[6rem] whitespace-normal text-center leading-tight">
            Tất cả
          </TabsTrigger>
          {hairstyleCategories.map(cat => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="capitalize text-xs md:text-sm px-3 py-2 min-w-[6rem] whitespace-normal text-center leading-tight"
            >
              {translateHairstyleCategory(cat)}
            </TabsTrigger>
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
                          <span className="sr-only">Kiểu tóc được gợi ý</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm truncate">{style.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">
                        {translateHairstyleCategory(style.category)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => onSelectHairstyle(style)}
                          variant={selectedHairstyle?.id === style.id ? 'secondary' : 'default'}
                        >
                          {selectedHairstyle?.id === style.id ? 'Đang chọn' : 'Thử ngay'}
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={isFavoriting}
                          onClick={event => {
                            event.stopPropagation();
                            startFavoriting(async () => {
                              const formData = new FormData();
                              formData.append('hairstyleId', style.id);
                              const result = await addFavoriteAction(formData);
                              if (result?.error) {
                                toast({ variant: 'destructive', title: 'Không thể lưu', description: result.error });
                              } else {
                                toast({ title: 'Đã lưu yêu thích', description: `${style.name} đã có trong danh sách` });
                              }
                            });
                          }}
                        >
                          <Heart className="h-4 w-4" />
                          <span className="sr-only">Yêu thích</span>
                        </Button>
                      </div>
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
