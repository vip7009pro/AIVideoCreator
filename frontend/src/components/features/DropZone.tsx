import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useUploadStore } from '../../store';
import { FileWithPreview } from '../../types/workflow.types';

interface DropZoneProps {
  assetType: 'product_image' | 'model_image';
  accept?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  assetType,
  accept = 'image/*',
}) => {
  const { addFile } = useUploadStore();
  const [isDragActive, setIsDragActive] = React.useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const fileWithPreview: FileWithPreview = {
              id: Math.random().toString(36).substring(7),
              file,
              preview: event.target?.result as string,
              status: 'pending',
              uploadProgress: 0,
            };
            const storeKey = assetType === 'product_image' ? 'productImage' : 'modelImage';
            addFile(storeKey as any, fileWithPreview);
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [assetType, addFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileWithPreview: FileWithPreview = {
            id: Math.random().toString(36).substring(7),
            file,
            preview: event.target?.result as string,
            status: 'pending',
            uploadProgress: 0,
          };
          const storeKey = assetType === 'product_image' ? 'productImage' : 'modelImage';
          addFile(storeKey as any, fileWithPreview);
        };
        reader.readAsDataURL(file);
      }
    },
    [assetType, addFile]
  );

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        isDragActive
          ? 'border-blue-500 bg-blue-900/20'
          : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
      }`}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <Upload className="mx-auto h-12 w-12 text-slate-500" />
      <p className="mt-2 text-sm font-medium text-slate-300">
        Drop {assetType === 'product_image' ? 'product image' : 'model image'} here
      </p>
      <p className="text-xs text-slate-500">or click to browse</p>
    </div>
  );
};
