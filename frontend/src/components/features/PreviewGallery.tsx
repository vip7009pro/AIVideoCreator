import React from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { useUploadStore } from '../../store';

export const PreviewGallery: React.FC = () => {
  const { files, removeFile } = useUploadStore();

  if (Object.keys(files).length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {files.productImage && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-700">Product Image</h3>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={files.productImage.preview}
                alt="product"
                className="h-16 w-16 rounded object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {files.productImage.file?.name || 'Product Image'}
                </p>
                <p className="text-xs text-gray-500">
                  {files.productImage.file ? (files.productImage.file.size / 1024 / 1024).toFixed(2) : '0'} MB
                </p>
                {files.productImage.uploadProgress !== undefined && (
                  files.productImage.uploadProgress < 100 ? (
                    <div className="mt-2 w-full overflow-hidden rounded bg-gray-200">
                      <div
                        className="h-1 bg-blue-500 transition-all"
                        style={{ width: `${files.productImage.uploadProgress}%` }}
                      />
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                      <Check size={14} /> Uploaded
                    </div>
                  )
                )}
              </div>
            </div>
            {files.productImage.status !== 'uploading' && (
              <button
                onClick={() => removeFile('productImage')}
                className="rounded p-2 hover:bg-gray-100"
              >
                <X size={18} className="text-gray-500" />
              </button>
            )}
          </div>
          {files.productImage.error && (
            <div className="mt-2 flex items-center gap-2 rounded bg-red-50 p-2 text-xs text-red-600">
              <AlertCircle size={14} />
              {files.productImage.error}
            </div>
          )}
        </div>
      )}

      {files.modelImage && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-700">Model Image</h3>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={files.modelImage.preview}
                alt="model"
                className="h-16 w-16 rounded object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {files.modelImage.file?.name || 'Model Image'}
                </p>
                <p className="text-xs text-gray-500">
                  {files.modelImage.file ? (files.modelImage.file.size / 1024 / 1024).toFixed(2) : '0'} MB
                </p>
                {files.modelImage.uploadProgress !== undefined && (
                  files.modelImage.uploadProgress < 100 ? (
                    <div className="mt-2 w-full overflow-hidden rounded bg-gray-200">
                      <div
                        className="h-1 bg-blue-500 transition-all"
                        style={{ width: `${files.modelImage.uploadProgress}%` }}
                      />
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                      <Check size={14} /> Uploaded
                    </div>
                  )
                )}
              </div>
            </div>
            {files.modelImage.status !== 'uploading' && (
              <button
                onClick={() => removeFile('modelImage')}
                className="rounded p-2 hover:bg-gray-100"
              >
                <X size={18} className="text-gray-500" />
              </button>
            )}
          </div>
          {files.modelImage.error && (
            <div className="mt-2 flex items-center gap-2 rounded bg-red-50 p-2 text-xs text-red-600">
              <AlertCircle size={14} />
              {files.modelImage.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
