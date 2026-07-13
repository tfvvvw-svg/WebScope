import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface ToastProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ messages, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    error: <XCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-indigo-400" />
  };

  const borders = {
    success: 'border-emerald-500/20 bg-emerald-950/20',
    warning: 'border-amber-500/20 bg-amber-950/20',
    error: 'border-rose-500/20 bg-rose-950/20',
    info: 'border-indigo-500/20 bg-indigo-950/20'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl ${borders[msg.type]}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {icons[msg.type]}
            </div>
            <div className="flex-1 text-sm text-zinc-200 pr-2">
              {msg.text}
            </div>
            <button
              onClick={() => onClose(msg.id)}
              className="flex-shrink-0 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
export default ToastContainer;
