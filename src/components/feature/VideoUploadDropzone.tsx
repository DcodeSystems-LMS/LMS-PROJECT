import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import SimpleDCODESpinner from '../base/SimpleDCODESpinner';

interface VideoUploadDropzoneProps {
  lessonId: number;
  onVideoUploaded: (videoUrl: string, videoFile: File) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
}

const VideoUploadDropzone: React.FC<VideoUploadDropzoneProps> = ({
  lessonId,
  onVideoUploaded,
  onUploadProgress,
  onUploadError,
  maxFileSize = 500, // 500MB default
  acceptedFormats = ['video/mp4', 'video/webm', 'video/avi', 'video/mov']
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `File type must be one of: ${acceptedFormats.join(', ')}`;
    }

    return null;
  };

  const uploadToSupabase = async (file: File): Promise<string> => {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `course-videos/${fileName}`;

      console.log('📤 Uploading video to Supabase storage:', filePath);

      // Upload file to Supabase storage with optimized cache settings for faster loading
      const { data, error } = await supabase.storage
        .from('course-videos')
        .upload(filePath, file, {
          cacheControl: '31536000', // 1 year cache for better performance
          upsert: false,
          contentType: file.type || 'video/mp4' // Explicit content type for better handling
        });

      if (error) {
        console.error('❌ Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('✅ Video uploaded successfully:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('course-videos')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Video upload error:', error);
      throw error;
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setSelectedFile(file);

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        onUploadError?.(validationError);
        return;
      }

      console.log('📤 Starting video upload:', file.name);

      // Simulate progress (Supabase doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Supabase
      const videoUrl = await uploadToSupabase(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('✅ Video upload completed:', videoUrl);

      // Notify parent component
      onVideoUploaded(videoUrl, file);
      onUploadProgress?.(100);

    } catch (error) {
      console.error('❌ Upload failed:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => acceptedFormats.includes(file.type));

    if (videoFile) {
      handleFileUpload(videoFile);
    } else {
      onUploadError?.('Please drop a valid video file');
    }
  }, [acceptedFormats, onUploadError]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 hover:border-gray-400'
        }
        ${isUploading ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {isUploading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <SimpleDCODESpinner size="md" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Uploading {selectedFile?.name}...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{uploadProgress}% complete</p>
          </div>
        </div>
      ) : (
        <div>
          <i className="ri-upload-cloud-line text-4xl text-gray-400 mb-4"></i>
          <div className="text-gray-600 dark:text-gray-300">
            <p className="font-medium mb-2">
              {isDragOver ? 'Drop your video file here' : 'Drop your video file here or click to browse'}
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: MP4, WebM, AVI, MOV
            </p>
            <p className="text-sm text-gray-500">
              Maximum file size: {maxFileSize}MB
            </p>
          </div>
        </div>
      )}

      {selectedFile && !isUploading && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            ✓ File selected: {selectedFile.name}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoUploadDropzone;
