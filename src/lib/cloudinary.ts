export async function uploadToCloudinary(
  file: File | Blob,
  env: any,
  resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto'
): Promise<string> {
  const cloudName = env.get("CLOUDINARY_CLOUD_NAME");
  const apiKey = env.get("CLOUDINARY_API_KEY");
  const apiSecret = env.get("CLOUDINARY_API_SECRET");

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary credentials");
  }

  const timestamp = Math.round(new Date().getTime() / 1000).toString();
  // Signature MUST include all parameters sent in alphabetical order (excluding file, api_key, and signature)
  const signatureString = `access_mode=public&timestamp=${timestamp}&type=upload${apiSecret}`;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');


  const formData = new FormData();
  if (file instanceof File) {
    formData.append("file", file, file.name);
  } else {
    formData.append("file", file);
  }
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  // Ensure the asset is public and delivered via standard 'upload' path
  formData.append("type", "upload");
  formData.append("access_mode", "public");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {


    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Cloudinary upload failed: ${errorData.error?.message || response.statusText}`);
  }

  const result = await response.json();
  return result.secure_url;
}

// Maintain backward compatibility for now
export const uploadImageToCloudinary = (file: File | Blob, env: any) => uploadToCloudinary(file, env, 'image');

