import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [dragState, setDragState] = useState({ type: '', startX: 0, startY: 0, startCrop: crop });

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height) * 0.8;
    const x = (width - size) / 2;
    const y = (height - size) / 2;
    setCrop({ x, y, width: size, height: size });
  };
  
  const getMousePos = (e: MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent) => {
    const rect = imgRef.current!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const onMouseDown = (e: React.MouseEvent | React.TouchEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getMousePos(e);
    setDragState({ type, startX: pos.x, startY: pos.y, startCrop: crop });
  };
  
  const onMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragState.type || !imgRef.current) return;
    
    e.preventDefault();
    const pos = getMousePos(e);
    const dx = pos.x - dragState.startX;
    const dy = pos.y - dragState.startY;
    const { startCrop } = dragState;
    const imgBounds = imgRef.current.getBoundingClientRect();

    let newCrop = { ...startCrop };
    
    if (dragState.type === 'move') {
      newCrop.x = startCrop.x + dx;
      newCrop.y = startCrop.y + dy;
    } else { // Resizing
      const newSize = startCrop.width + (dx + dy) / 2; // Average change from both axes
      
      const minSize = 50;
      const clampedSize = Math.max(minSize, newSize);
      
      newCrop.width = clampedSize;
      newCrop.height = clampedSize;
      newCrop.x = startCrop.x - (clampedSize - startCrop.width) / 2;
      newCrop.y = startCrop.y - (clampedSize - startCrop.height) / 2;
    }
    
    // Clamp to boundaries
    newCrop.x = Math.max(0, Math.min(newCrop.x, imgBounds.width - newCrop.width));
    newCrop.y = Math.max(0, Math.min(newCrop.y, imgBounds.height - newCrop.height));

    if(newCrop.width > imgBounds.width - newCrop.x) newCrop.width = imgBounds.width - newCrop.x;
    if(newCrop.height > imgBounds.height - newCrop.y) newCrop.height = imgBounds.height - newCrop.y;
    newCrop.width = newCrop.height = Math.min(newCrop.width, newCrop.height);


    setCrop(newCrop);
  }, [dragState]);

  const onMouseUp = useCallback(() => {
    setDragState({ type: '', startX: 0, startY: 0, startCrop: crop });
  }, [crop]);
  
  useEffect(() => {
    const moveEvent = 'mousemove';
    const upEvent = 'mouseup';
    window.addEventListener(moveEvent, onMouseMove);
    window.addEventListener(upEvent, onMouseUp);
    
    const touchMoveEvent = 'touchmove';
    const touchUpEvent = 'touchend';
    window.addEventListener(touchMoveEvent, onMouseMove);
    window.addEventListener(touchUpEvent, onMouseUp);

    return () => {
      window.removeEventListener(moveEvent, onMouseMove);
      window.removeEventListener(upEvent, onMouseUp);
      window.removeEventListener(touchMoveEvent, onMouseMove);
      window.removeEventListener(touchUpEvent, onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);


  const handleCrop = () => {
    if (imgRef.current) {
        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const targetSize = 256;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
  
        if (ctx) {
            ctx.drawImage(
              image,
              crop.x * scaleX,
              crop.y * scaleY,
              crop.width * scaleX,
              crop.height * scaleY,
              0,
              0,
              targetSize,
              targetSize
            );
            const base64Image = canvas.toDataURL('image/jpeg', 0.9);
            onCropComplete(base64Image);
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg shadow-xl p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold text-white mb-4">Ajuste sua foto de perfil</h2>
        <div className="relative inline-block overflow-hidden touch-none" style={{ maxWidth: '100%' }}>
            <img
              ref={imgRef}
              src={imageSrc}
              onLoad={onImageLoad}
              alt="Para recortar"
              className="max-w-full max-h-[60vh] object-contain select-none"
            />
            <div
                className="absolute border-2 border-dashed border-white cursor-move"
                style={{
                  top: crop.y,
                  left: crop.x,
                  width: crop.width,
                  height: crop.height,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                  borderRadius: '50%',
                }}
                onMouseDown={(e) => onMouseDown(e, 'move')}
                onTouchStart={(e) => onMouseDown(e, 'move')}
            >
              <div 
                className="absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-white rounded-full cursor-se-resize"
                onMouseDown={(e) => onMouseDown(e, 'resize')}
                onTouchStart={(e) => onMouseDown(e, 'resize')}
              />
            </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
            <button
                onClick={onCancel}
                className="py-2 px-5 border border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white font-semibold rounded-lg transition-colors"
            >
                Cancelar
            </button>
            <button
                onClick={handleCrop}
                className="py-2 px-5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-red-500 transition-colors"
            >
                Salvar
            </button>
        </div>
      </div>
    </div>
  );
};
