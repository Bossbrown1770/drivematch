import { supabase } from './supabaseClient';

/**
 * Upload an image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} bucket - The storage bucket name (default: 'car-images')
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadCarImage = async (file, bucket = 'car-images') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `cars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Delete an image from Supabase Storage
 * @param {string} url - The public URL of the image to delete
 * @param {string} bucket - The storage bucket name (default: 'car-images')
 */
export const deleteCarImage = async (url, bucket = 'car-images') => {
  // Extract the file path from the public URL
  const path = url.split(`/storage/v1/object/public/${bucket}/`)[1];
  if (!path) return;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Delete failed:', error.message);
  }
};
