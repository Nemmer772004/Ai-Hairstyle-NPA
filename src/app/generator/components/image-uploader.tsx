'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string) => void;
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

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
  });

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div
        {...getRootProps()}
        className={`flex-1 w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <UploadCloud className="w-12 h-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold">
            {isDragActive ? 'Drop the photo here' : 'Drag photo here or click to upload'}
          </p>
          <p className="text-sm text-muted-foreground">PNG or JPG (max 5MB)</p>
        </div>
      </div>
      {preview && (
        <div className="w-48 h-48 rounded-lg overflow-hidden shadow-md shrink-0">
          <Image src={preview} alt="Uploaded preview" width={192} height={192} className="object-cover w-full h-full" />
        </div>
      )}
    </div>
  );
}
