import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  variant?: 'bottom-sheet' | 'center';
}

export function Modal({ isOpen, onClose, children, variant = 'bottom-sheet' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const screen = document.getElementById('phone-screen');
      if (screen) {
        const scrollArea = screen.querySelector('.iphone-content') as HTMLElement | null;
        if (scrollArea) scrollArea.style.overflow = 'hidden';
      }
      contentRef.current?.focus();
    } else {
      const screen = document.getElementById('phone-screen');
      if (screen) {
        const scrollArea = screen.querySelector('.iphone-content') as HTMLElement | null;
        if (scrollArea) scrollArea.style.overflow = '';
      }
    }
    return () => {
      const screen = document.getElementById('phone-screen');
      if (screen) {
        const scrollArea = screen.querySelector('.iphone-content') as HTMLElement | null;
        if (scrollArea) scrollArea.style.overflow = '';
      }
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape' && onClose) onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && onClose) onClose();
  };

  const positionClasses =
    variant === 'bottom-sheet' ? 'items-end' : 'items-center';

  const contentClasses =
    variant === 'bottom-sheet'
      ? 'w-full rounded-t-2xl max-h-[80%]'
      : 'w-[88%] rounded-2xl';

  return (
    <div
      ref={overlayRef}
      className={`absolute inset-0 z-50 flex justify-center ${positionClasses} bg-black/50 animate-fadeIn`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={`${contentClasses} bg-white shadow-2xl overflow-y-auto animate-slideUp focus:outline-none`}
      >
        {children}
      </div>
    </div>
  );
}
