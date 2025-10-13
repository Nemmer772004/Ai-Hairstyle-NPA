import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { findImage, hairstyles } from '@/lib/placeholder-images';
import { translateHairstyleCategory } from '@/lib/labels';
import { Sparkles, Palette, Scissors, Webcam, Upload, Wand2, Download } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function Home() {
  const heroImage = findImage('hero-before-after');
  const beforeAfterImages = [
    {
      id: 'before-after-1',
      beforeUrl:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=480&q=80',
      afterUrl:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=480&q=80',
      hint: 'woman portrait',
    },
    {
      id: 'before-after-2',
      beforeUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=480&q=80',
      afterUrl:
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=480&q=80',
      hint: 'man portrait',
    },
    {
      id: 'before-after-3',
      beforeUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=480&q=80',
      afterUrl:
        'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=480&q=80',
      hint: 'woman smiling',
    },
    {
      id: 'before-after-4',
      beforeUrl:
        'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?auto=format&fit=crop&w=480&q=80',
      afterUrl:
        'https://images.unsplash.com/photo-1611605698127-77f22674bfea?auto=format&fit=crop&w=480&q=80',
      hint: 'man serious portrait',
    },
  ];

  const features = [
    {
      icon: <Webcam className="w-8 h-8 text-primary" />,
      title: 'Phân tích khuôn mặt bằng AI',
      description: 'AI đánh giá dáng mặt và tông da của bạn để đề xuất những kiểu tóc hài hòa nhất.',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: 'Xem trước tức thì',
      description: 'Thử nhiều kiểu tóc ngay lập tức trước khi quyết định thay đổi ngoài đời.',
    },
    {
      icon: <Palette className="w-8 h-8 text-primary" />,
      title: 'Thay đổi màu tóc',
      description: 'Khám phá hàng loạt bảng màu để tìm gam màu khiến bạn nổi bật nhất.',
    },
    {
      icon: <Scissors className="w-8 h-8 text-primary" />,
      title: 'Phủ tóc thông minh',
      description: 'AI hiện đại giúp mô phỏng mái tóc dày dặn ngay cả khi tóc mỏng hoặc thưa.',
    },
  ];

  const howItWorks = [
    {
      icon: <Upload className="w-10 h-10 text-primary" />,
      title: '1. Tải ảnh lên',
      description: 'Chọn ảnh chân dung rõ nét, chính diện. Nên buộc gọn tóc để kết quả chính xác hơn.'
    },
    {
      icon: <Wand2 className="w-10 h-10 text-primary" />,
      title: '2. AI phân tích & gợi ý',
      description: 'Hệ thống phân tích khuôn mặt và cho bạn thử hơn 140 kiểu tóc cùng màu nhuộm trong vài giây.',
    },
    {
      icon: <Download className="w-10 h-10 text-primary" />,
      title: '3. Lưu & chia sẻ',
      description: 'Tải xuống diện mạo yêu thích để chia sẻ với bạn bè hoặc đưa cho nhà tạo mẫu.',
    }
  ]

  return (
    <>
      <section className="relative w-full text-center py-20 md:py-32 lg:py-40 bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="container mx-auto px-4 relative">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground font-headline">
            Thử ngay kiểu tóc mới với AI
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Khám phá diện mạo phù hợp nhất cùng công cụ thử tóc ảo. Bạn có thể bật camera hoặc tải ảnh sẵn có.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/generator">Bắt đầu trải nghiệm</Link>
          </Button>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
            <Carousel opts={{ align: "start", loop: true, }} className="w-full">
                <CarouselContent>
                    {beforeAfterImages.map((image) => (
                        <CarouselItem key={image.id} className="md:basis-1/2">
                             <div className="flex gap-4 p-1">
                                <Image src={image.beforeUrl} alt="Trước" width={400} height={400} data-ai-hint={image.hint} className="rounded-lg object-cover w-1/2 aspect-square"/>
                                <Image src={image.afterUrl} alt="Sau" width={400} height={400} data-ai-hint={image.hint} className="rounded-lg object-cover w-1/2 aspect-square"/>
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
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Quy trình hoạt động</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {howItWorks.map((step, index) => (
                    <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card p-6">
                        <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                            {step.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2 font-headline">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                    </Card>
                ))}
            </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Bộ sưu tập kiểu tóc</h2>
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
                            <p className="text-sm text-white/80 capitalize">{translateHairstyleCategory(style.category)}</p>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Tính năng nổi bật</h2>
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
    </>
  );
}
