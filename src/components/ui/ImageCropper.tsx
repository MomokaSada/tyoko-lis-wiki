'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Scissors, Check, X } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface ImageCropperProps {
  image: string;
  aspect?: number;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export function ImageCropper({ image, aspect = 16 / 9, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
  ): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // JPEG はアルファチャンネルをサポートしないため、
    // 元画像の透過部分が黒くなるのを防ぐために白背景で塗りつぶす
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleConfirm = async () => {
    if (croppedAreaPixels) {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="relative w-full h-[400px] bg-stone-100 rounded-2xl overflow-hidden shadow-inner border border-stone-200">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteInternal}
          onZoomChange={onZoomChange}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">ズーム</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow-lg shadow-stone-900/10 active:scale-95"
          >
            <Check className="w-4 h-4" />
            確定してアップロード
          </button>
        </div>
      </div>
    </div>
  );
}
