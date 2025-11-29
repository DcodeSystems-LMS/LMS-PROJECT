
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  zIndex?: number; // Allow custom z-index for nested modals
  maxWidth?: string; // Allow custom max width
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', className, zIndex = 50, maxWidth }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm mx-6 sm:max-w-md',
    md: 'max-w-md mx-6 sm:max-w-lg',
    lg: 'max-w-lg mx-6 sm:max-w-2xl',
    xl: 'max-w-xl mx-6 sm:max-w-4xl',
    full: 'max-w-none w-full h-full max-h-screen mx-0'
  };
  
  const widthClass = maxWidth ? `max-w-[${maxWidth}]` : sizes[size];

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ zIndex }}>
      <div className={`flex items-center justify-center min-h-screen ${size === 'full' ? 'p-0' : 'p-6'}`}>
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
        <div className={`relative bg-white shadow-2xl w-full ${className || widthClass} ${size === 'full' ? 'h-screen rounded-none' : 'rounded-xl'} animate-fade-in-scale flex flex-col`}>
          {title && (
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="heading-tertiary mb-0 text-gray-900 pr-4">{title}</h3>
              <button
                onClick={onClose}
                className="interactive-element text-gray-400 hover:text-gray-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
          )}
          <div className={`flex-1 overflow-y-auto ${size === 'full' ? 'p-0' : 'px-6 py-6'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
