// Utility to safely construct accessible URLs for profile and uploaded images
export const getProfileImageUrl = (profileImage) => {
  if (!profileImage) return '';
  if (profileImage.startsWith('http://') || profileImage.startsWith('https://') || profileImage.startsWith('blob:') || profileImage.startsWith('data:')) {
    return profileImage;
  }
  // Clean backslashes to forward slashes (handling Windows paths)
  const clean = profileImage.replace(/\\/g, '/');
  const idx = clean.indexOf('uploads/');
  const relativePath = idx !== -1 ? clean.slice(idx) : `uploads/${clean.split('/').pop()}`;
  return `http://localhost:4000/${relativePath}`;
};

