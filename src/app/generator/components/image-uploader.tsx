'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Camera, SwitchCamera } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string) => void;
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      // Stop camera stream when component unmounts
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser to use this app.',
      });
    }
  };

  const handleTabChange = (value: string) => {
    if (value === 'webcam') {
      startCamera();
    } else {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/png');
        setPreview(dataUri);
        onImageUpload(dataUri);
      }
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Please upload an image smaller than 5MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setPreview(dataUri);
        onImageUpload(dataUri);
      };
      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'Read Error',
          description: 'Could not read the selected file.',
        });
      }
      reader.readAsDataURL(file);
    }
  }, [onImageUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <Tabs defaultValue="upload" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Photo</TabsTrigger>
            <TabsTrigger value="webcam">Live Camera</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="p-6">
            <div
              {...getRootProps()}
              className={`w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-center
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="w-16 h-16 text-muted-foreground mx-auto" />
              <p className="mt-4 text-lg font-semibold">
                Drag photo here or
              </p>
              <Button asChild variant="link" className="text-lg">
                <label htmlFor="file-upload" className="cursor-pointer text-primary">
                  click to upload
                  <input id="file-upload" {...getInputProps()} className="sr-only" />
                </label>
              </Button>
              <p className="text-sm text-muted-foreground mt-2">PNG or JPG (max 5MB)</p>
            </div>
          </TabsContent>
          <TabsContent value="webcam" className="p-6">
             <div className="flex flex-col items-center gap-4">
                <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    <canvas ref={canvasRef} className="hidden" />
                    {hasCameraPermission === false && (
                         <div className="absolute inset-0 flex items-center justify-center p-4">
                            <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access to use this feature.
                                </AlertDescription>
                            </Alert>
                         </div>
                    )}
                </div>
                <Button onClick={takePicture} disabled={!hasCameraPermission} size="lg" className="rounded-full w-20 h-20">
                    <Camera className="w-8 h-8" />
                </Button>
             </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
