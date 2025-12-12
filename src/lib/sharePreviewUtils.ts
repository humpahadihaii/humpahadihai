// Platform-specific character limits and image dimensions
export const PLATFORM_LIMITS = {
  facebook: {
    title: 60,
    description: 200,
    imageWidth: 1200,
    imageHeight: 630,
    imageAspect: '1.91:1'
  },
  twitter: {
    title: 70,
    description: 200,
    imageWidth: 1200,
    imageHeight: 628,
    imageAspect: '1.91:1'
  },
  whatsapp: {
    title: 60,
    description: 120,
    imageWidth: 1200,
    imageHeight: 630,
    imageAspect: '1.91:1'
  },
  linkedin: {
    title: 80,
    description: 250,
    imageWidth: 1200,
    imageHeight: 627,
    imageAspect: '1.91:1'
  },
  instagram: {
    title: 60,
    description: 150,
    imageWidth: 1080,
    imageHeight: 1080,
    imageAspect: '1:1'
  },
  email: {
    title: 80,
    description: 300,
    imageWidth: 600,
    imageHeight: 315,
    imageAspect: '1.91:1'
  }
} as const;

export type Platform = keyof typeof PLATFORM_LIMITS;

// Truncate text at word boundary with ellipsis
export function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  
  // Find the last space before maxLength
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // If no space found or it's too early, just cut at maxLength - 1
  if (lastSpace < maxLength * 0.5) {
    return truncated.slice(0, maxLength - 1) + '…';
  }
  
  return truncated.slice(0, lastSpace) + '…';
}

// Truncate preserving sentence boundaries when possible
export function truncateAtSentenceBoundary(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  
  // Find sentence endings within range
  const shortened = text.slice(0, maxLength);
  const lastPeriod = shortened.lastIndexOf('. ');
  const lastQuestion = shortened.lastIndexOf('? ');
  const lastExclaim = shortened.lastIndexOf('! ');
  
  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclaim);
  
  // If we can end at a sentence boundary that's not too early
  if (lastSentenceEnd > maxLength * 0.6) {
    return text.slice(0, lastSentenceEnd + 1);
  }
  
  // Fall back to word boundary
  return truncateAtWordBoundary(text, maxLength);
}

// Get platform-optimized preview data
export function getPlatformPreview(
  platform: Platform,
  data: {
    title: string;
    description: string;
    image?: string;
    siteName?: string;
    titleSuffix?: string;
  }
) {
  const limits = PLATFORM_LIMITS[platform];
  
  // Build title with suffix if it fits
  let title = data.title || '';
  const suffix = data.titleSuffix || '';
  const fullTitle = title + suffix;
  
  if (fullTitle.length <= limits.title) {
    title = fullTitle;
  } else if (title.length > limits.title) {
    title = truncateAtWordBoundary(title, limits.title);
  }
  
  // Truncate description
  const description = truncateAtSentenceBoundary(data.description || '', limits.description);
  
  return {
    title,
    description,
    image: data.image,
    charLimits: limits,
    titleLength: title.length,
    descriptionLength: description.length,
    titleOverLimit: title.length > limits.title,
    descriptionOverLimit: description.length > limits.description
  };
}

// Generate share URL with referral tracking
export function generateShareUrl(baseUrl: string, platform: string): string {
  try {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set('ref', platform);
    url.searchParams.set('utm_source', platform);
    url.searchParams.set('utm_medium', 'social');
    return url.toString();
  } catch {
    return baseUrl;
  }
}

// Platform-specific share URL generators
export function getShareLink(platform: Platform, url: string, title: string, description?: string): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || '');
  
  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'email':
      return `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`;
    default:
      return url;
  }
}

// Check if content needs AI summarization (too long for all platforms)
export function needsAISummarization(description: string): boolean {
  const minLimit = Math.min(
    PLATFORM_LIMITS.whatsapp.description,
    PLATFORM_LIMITS.facebook.description,
    PLATFORM_LIMITS.twitter.description
  );
  return description.length > minLimit * 1.5;
}

// Calculate content quality score for preview
export function calculatePreviewScore(
  title: string,
  description: string,
  image?: string
): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;
  
  // Title checks
  if (!title) {
    score -= 30;
    issues.push('Missing title');
  } else if (title.length < 20) {
    score -= 10;
    issues.push('Title is too short');
  } else if (title.length > 60) {
    score -= 5;
    issues.push('Title may be truncated on some platforms');
  }
  
  // Description checks
  if (!description) {
    score -= 25;
    issues.push('Missing description');
  } else if (description.length < 50) {
    score -= 10;
    issues.push('Description is too short');
  } else if (description.length > 200) {
    score -= 5;
    issues.push('Description will be truncated on some platforms');
  }
  
  // Image checks
  if (!image) {
    score -= 20;
    issues.push('No OG image set');
  }
  
  return { score: Math.max(0, score), issues };
}
