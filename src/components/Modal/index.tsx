import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-3xl shadow-soft-lg animate-slide-up overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
            <h2 className="font-display text-xl text-primary-700">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-cream-100 text-primary-600 transition-colors btn-press"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className={`${title ? '' : 'p-6'}`}>
          {title ? <div className="p-6">{children}</div> : children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
