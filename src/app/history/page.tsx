'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Mock data - in a real app, this would be fetched from the backend
const mockHistory = [
  {
    id: 'gen1',
    inputImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    outputImageUrl: 'https://picsum.photos/seed/gen1/200/200',
    geminiAnalysis: 'Oval face, suggests long waves.',
    createdAt: '2023-10-27T10:00:00Z',
  },
  {
    id: 'gen2',
    inputImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    outputImageUrl: 'https://picsum.photos/seed/gen2/200/200',
    geminiAnalysis: 'Heart-shaped face, suggests a bob.',
    createdAt: '2023-10-26T15:30:00Z',
  },
];

export default function HistoryPage() {
  // In a real app, you'd have a loading state and fetch this data
  const history = mockHistory; // or [] to test empty state

  if (history.length === 0) {
    return (
      <div className="container mx-auto p-8 text-center">
        <ImageIcon className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold font-headline">No History Yet</h1>
        <p className="mt-2 text-muted-foreground">
          Try generating a new hairstyle to see your history here.
        </p>
        <Button asChild className="mt-6">
          <Link href="/generator">Go to Generator</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">Your Generations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <Card key={item.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">
                {new Date(item.createdAt).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex gap-4">
                <Image
                  src={item.inputImageUrl}
                  alt="Original"
                  width={150}
                  height={150}
                  className="rounded-md object-cover flex-1"
                />
                <Image
                  src={item.outputImageUrl}
                  alt="Generated"
                  width={150}
                  height={150}
                  className="rounded-md object-cover flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4 italic">
                &quot;{item.geminiAnalysis}&quot;
              </p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button size="sm" className="flex-1" asChild>
                <a href={item.outputImageUrl} download>
                  <Download className="mr-2 h-4 w-4" /> Download
                </a>
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
