'use client';

import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export default function UploadDropzone({
  onFileSelect,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
}: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.size > maxSize) {
        setError('File size exceeds 5MB limit');
        return;
      }
      onFileSelect(file);
    }
  }, [maxSize, onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > maxSize) {
        setError('File size exceeds 5MB limit');
        return;
      }
      onFileSelect(file);
    }
  };

  return (
    <div className={className}>
      <motion.label
        htmlFor="file-upload"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        className={`
          glass rounded-3xl p-12 
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-300
          ${isDragActive ? 'bg-white/20 scale-105 glow-primary' : 'hover:bg-white/10'}
          ${error ? 'border-2 border-red-500' : ''}
        `}
      >
        <motion.div
          animate={{
            y: isDragActive ? -10 : 0,
          }}
          className="text-center"
        >
          <div className="text-6xl mb-4 animate-float">📸</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isDragActive ? 'Drop it here!' : 'Upload Item Image'}
          </h3>
          <p className="text-gray-700 mb-4">
            Drag & drop or click to browse
          </p>
          <p className="text-sm text-gray-600">
            PNG, JPG, GIF up to 5MB
          </p>
          {error && (
            <p className="text-red-400 text-sm mt-2">⚠️ {error}</p>
          )}
        </motion.div>
        <input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
      </motion.label>
    </div>
  );
}

