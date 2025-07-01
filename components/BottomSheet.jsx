// components/BottomSheet.jsx
import { motion, AnimatePresence } from 'framer-motion';

export default function BottomSheet({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 h-3/4 bg-white rounded-t-2xl shadow-xl z-50 overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* drag handle */}
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto my-2" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}