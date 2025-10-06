import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { findImage, hairstyles } from '@/lib/placeholder-images';
import { Sparkles, Palette, Scissors, Webcam } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function Home() {
  const heroImage = findImage('hero-before-after');

  const features = [
    {
      icon: <Webcam className="w-8 h-8 text-primary" />,
      title: 'AI Face Analysis',
      description: 'Our AI analyzes your face shape and skin tone to suggest the most flattering hairstyles.',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: 'Real-time Preview',
      description: 'See how you look with different hairstyles in real-time before making a decision.',
    },
    {
      icon: <Palette className="w-8 h-8 text-primary" />,
      title: 'Hair Color Changer',
      description: 'Experiment with a wide range of hair colors to find your perfect match.',
    },
    {
      icon: <Scissors className="w-8 h-8 text-primary" />,
      title: 'Bald to Hair',
      description: 'Visualize a full head of hair with our advanced AI that can add hair to bald photos.',
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <section className="relative w-full text-center py-20 md:py-32 lg:py-40 bg-gradient-to-br from-secondary to-background">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover opacity-20"
          />
        )}
        <div className="container mx-auto px-4 relative">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground font-headline">
            Try 140+ AI Hairstyles Free!
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Upload your photo, get personalized AI suggestions, and see yourself in a brand new look instantly.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/generator">Start Now</Link>
          </Button>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Explore Styles</h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {hairstyles.map((style) => (
                <CarouselItem key={style.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-0 rounded-lg overflow-hidden">
                        <div className="relative w-full h-full">
                          <Image
                            src={style.imageUrl}
                            alt={style.name}
                            data-ai-hint={style.imageHint}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="font-bold text-lg text-white">{style.name}</h3>
                            <p className="text-sm text-white/80 capitalize">{style.category}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
