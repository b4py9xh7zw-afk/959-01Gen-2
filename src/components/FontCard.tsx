import React, { useState } from 'react';
import { ShoppingCart, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '../utils/format';
import { FONT_STYLE_LABELS } from '@shared/types';
import type { Font } from '@shared/types';

interface FontCardProps {
  font: Font;
  onPurchase: (font: Font) => void;
  onView?: (font: Font) => void;
  isSelected?: boolean;
}

const FontCard: React.FC<FontCardProps> = ({ font, onPurchase, onView, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onView) {
      onView(font);
    }
  };

  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPurchase(font);
  };

  return (
    <div
      className={cn(
        'relative bg-white rounded-xl shadow-card overflow-hidden cursor-pointer',
        'transform transition-all duration-300',
        isHovered ? 'shadow-card-hover -translate-y-1' : '',
        isSelected ? 'ring-2 ring-gold-500 ring-offset-2' : ''
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {isSelected && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600" />
      )}

      <div
        className="h-40 bg-gradient-to-br from-ink-50 to-ink-100 flex items-center justify-center p-6 relative overflow-hidden"
        style={{ fontFamily: font.family }}
      >
        <p className="text-4xl text-ink-800 font-medium text-center line-clamp-2">
          {font.previewText}
        </p>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-ink-600 rounded-full">
            {FONT_STYLE_LABELS[font.style]}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-ink-900 text-lg">{font.name}</h3>
            <p className="text-sm text-ink-500">by {font.designer}</p>
          </div>
          <Type className="w-5 h-5 text-ink-400" />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {font.weights.slice(0, 4).map((weight) => (
            <span
              key={weight}
              className="px-2 py-0.5 text-xs font-medium bg-ink-100 text-ink-600 rounded"
            >
              {weight}
            </span>
          ))}
          {font.weights.length > 4 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-ink-100 text-ink-600 rounded">
              +{font.weights.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-gold-600">
            {formatPrice(font.price, font.currency)}
          </p>
          <button
            onClick={handlePurchaseClick}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
              'bg-gradient-to-r from-gold-500 to-gold-600 text-white',
              'hover:from-gold-600 hover:to-gold-700 hover:shadow-gold',
              'active:scale-95',
              'flex items-center gap-2'
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            购买
          </button>
        </div>
      </div>
    </div>
  );
};

export default FontCard;
