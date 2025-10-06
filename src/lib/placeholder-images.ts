import data from './placeholder-images.json';

export type Hairstyle = {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  suitableFaces: string[];
  popularity: number;
};

export type GeneralImage = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const hairstyles: Hairstyle[] = data.hairstyles;
export const generalImages: GeneralImage[] = data.generalImages;
export const hairstyleCategories = [...new Set(hairstyles.map(h => h.category))];

// A helper function to find an image
export function findImage(id: string): GeneralImage | Hairstyle | undefined {
  const allImages = [...generalImages, ...hairstyles];
  return allImages.find(img => img.id === id);
}
