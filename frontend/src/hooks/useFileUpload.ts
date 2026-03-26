import { useState, useCallback } from 'react';
import { apiClient } from '../services/api/client';
import { useUploadStore } from '../store';
import { Logger } from '../utils/helpers';

const logger = Logger.getInstance();

export const useFileUpload = (projectId?: string) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { files, setFileStatus, setFileError, updateFileProgress } = useUploadStore();

  const uploadFile = useCallback(
    async (assetKey: 'productImage' | 'modelImage'): Promise<string | null> => {
      if (!projectId) {
        setError('Project ID not provided');
        return null;
      }

      const file = files[assetKey];
      if (!file || !file.file) {
        setError(`No ${assetKey} selected`);
        return null;
      }

      setIsUploading(true);
      setError(null);
      setFileStatus(assetKey, 'uploading');

      try {
        // Upload file
        const assetType = assetKey === 'productImage' ? 'product_image' : 'model_image';
        const { assetId } = await apiClient.uploadFile(projectId, file.file, assetType);

        setFileStatus(assetKey, 'success');
        updateFileProgress(assetKey, 100);

        logger.info(`File uploaded successfully: ${assetKey}`);
        return assetId;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        setFileError(assetKey, errorMsg);
        logger.error(`File upload error: ${assetKey}`, err);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, files, setFileStatus, setFileError, updateFileProgress]
  );

  const uploadBothFiles = useCallback(async (): Promise<{
    productImageId?: string;
    modelImageId?: string;
  } | null> => {
    try {
      setIsUploading(true);
      setError(null);

      const results: any = {};

      if (files.productImage) {
        const productId = await uploadFile('productImage');
        if (productId) results.productImageId = productId;
      }

      if (files.modelImage) {
        const modelId = await uploadFile('modelImage');
        if (modelId) results.modelImageId = modelId;
      }

      if (Object.keys(results).length === 0) {
        setError('No files uploaded successfully');
        return null;
      }

      return results;
    } finally {
      setIsUploading(false);
    }
  }, [files, uploadFile]);

  return {
    uploadFile,
    uploadBothFiles,
    isUploading,
    error,
  };
};
