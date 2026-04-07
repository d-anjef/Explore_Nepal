// Fallback images using real Nepal travel photos from Unsplash

// Array of diverse Nepal travel images
const TRAVEL_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop", // Mountain landscape
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop", // Himalayan peaks
  "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=400&h=300&fit=crop", // Nepal temple
  "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop", // Mountain trekking
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop", // Everest region
  "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=400&h=300&fit=crop", // Buddhist stupa
  "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop", // Mountain valley
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop", // Snow peaks
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop", // Scenic landscape
  "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop", // Hiking trail
  "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=400&h=300&fit=crop", // Cultural site
  "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop", // Mountain view
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop", // Nature
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop", // Peak view
  "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop", // Adventure
];

export const DEFAULT_PACKAGE_IMAGE = TRAVEL_IMAGES[0];
export const DEFAULT_PROFILE_IMAGE = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&h=200&fit=crop"; // Default profile avatar

// Generate a unique image based on package ID or name
export const getPackageImage = (packageData) => {
  // If package has images, return the first one
  if (packageData?.packageImages && packageData.packageImages.length > 0) {
    return packageData.packageImages[0];
  }

  // Generate a consistent index based on package ID or name
  const seed = packageData?._id || packageData?.packageName || "";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TRAVEL_IMAGES.length;
  
  return TRAVEL_IMAGES[index];
};

// Handle image error
export const handleImageError = (e, fallbackUrl) => {
  if (e.target.src !== fallbackUrl) {
    e.target.src = fallbackUrl;
  }
};

// Get image with fallback
export const getImageWithFallback = (imageUrl, fallbackUrl) => {
  return imageUrl || fallbackUrl;
};
