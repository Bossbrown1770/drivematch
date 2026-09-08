import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ImageGallery({ images = [] }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) {
    return (
      <div className="aspect-[16/9] bg-muted rounded-2xl flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No images available</p>
      </div>
    );
  }

  const go = (dir) => setCurrent(prev => (prev + dir + images.length) % images.length);

  return (
    <>
      {/* Main Display */}
      <div className="relative aspect-[16/9] bg-muted rounded-2xl overflow-hidden group cursor-zoom-in" onClick={() => setLightbox(true)}>
        <img src={images[current]} alt={`Car photo ${current + 1}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); go(-1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); go(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {current + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mt-3">
          {images.map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={cn("aspect-square rounded-lg overflow-hidden border-2 transition-all",
                i === current ? "border-primary scale-105" : "border-transparent hover:border-border")}>
              <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 p-2" onClick={() => setLightbox(false)}>
            <X className="w-7 h-7" />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2" onClick={(e) => { e.stopPropagation(); go(-1); }}>
            <ChevronLeft className="w-8 h-8" />
          </button>
          <img src={images[current]} alt="Full view" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2" onClick={(e) => { e.stopPropagation(); go(1); }}>
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="absolute bottom-4 text-white text-sm">{current + 1} / {images.length}</div>
        </div>
      )}
    </>
  );
}
