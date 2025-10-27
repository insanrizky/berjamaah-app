'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, ZoomIn } from 'lucide-react';

interface ImagePreviewModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImagePreviewModal({
  src,
  alt,
  isOpen,
  onClose,
}: ImagePreviewModalProps) {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent className='max-w-4xl max-h-[90vh] p-0 overflow-hidden'>
        <AlertDialogHeader className='p-4 pb-2'>
          <div className='flex items-center justify-between'>
            <AlertDialogTitle className='text-lg font-semibold'>
              Preview Gambar
            </AlertDialogTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={e => {
                e.stopPropagation();
                onClose();
              }}
              className='h-8 w-8 p-0'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </AlertDialogHeader>

        <div className='flex-1 overflow-auto p-4 pt-0'>
          <div className='relative w-full'>
            <img
              src={src}
              alt={alt}
              className='w-full h-auto max-h-[70vh] object-contain rounded-lg'
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ClickableImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export function ClickableImage({
  src,
  alt,
  className,
  onError,
}: ClickableImageProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsPreviewOpen(false);
  };

  return (
    <div
      onClick={e => {
        // Prevent propagation when modal is open or when clicking the image
        if (isPreviewOpen) {
          e.stopPropagation();
        }
      }}
    >
      <div
        className='relative group cursor-pointer'
        onClick={e => {
          e.stopPropagation();
          setIsPreviewOpen(true);
        }}
      >
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity group-hover:opacity-90`}
          onError={onError}
        />
        {/* Overlay with zoom icon */}
        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-lg flex items-center justify-center'>
          <ZoomIn className='w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200' />
        </div>
      </div>

      <ImagePreviewModal
        src={src}
        alt={alt}
        isOpen={isPreviewOpen}
        onClose={handleClose}
      />
    </div>
  );
}
