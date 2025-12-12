import { useMemo } from "react";
import { useShareSettings, ShareDefaults } from "./useShareSettings";

interface EntityData {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  tagline?: string;
  excerpt?: string;
  short_description?: string;
  overview?: string;
  image_url?: string;
  thumbnail_image_url?: string;
  banner_image?: string;
  cover_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  seo_image_url?: string;
  share_templates?: Record<string, any>;
  slug?: string;
}

interface ResolvedMeta {
  title: string;
  description: string;
  image: string;
  canonical: string;
  ogType: string;
  twitterCard: string;
  twitterSite: string;
  siteName: string;
  locale: string;
}

export function useResolvedMeta(
  entityType: string,
  entity: EntityData | null | undefined,
  pageUrl?: string
): ResolvedMeta {
  const { data: globalSettings } = useShareSettings();

  return useMemo(() => {
    const defaults: Partial<ShareDefaults> = globalSettings?.defaults || {};
    
    // Determine title - priority: seo_title > title/name > default
    const entityTitle = entity?.seo_title || entity?.title || entity?.name || '';
    const titleSuffix = defaults.title_suffix || ' | Hum Pahadi Haii';
    const title = entityTitle ? `${entityTitle}${titleSuffix}` : defaults.site_name || 'Hum Pahadi Haii';

    // Determine description - priority: seo_description > various description fields > default
    const description = (
      entity?.seo_description ||
      entity?.description ||
      entity?.tagline ||
      entity?.excerpt ||
      entity?.short_description ||
      entity?.overview ||
      defaults.default_description ||
      'Discover the cultural heritage, traditions, and natural beauty of Uttarakhand.'
    ).slice(0, 160);

    // Determine image - priority: seo_image_url > various image fields > default
    const image = (
      entity?.seo_image_url ||
      entity?.image_url ||
      entity?.thumbnail_image_url ||
      entity?.banner_image ||
      entity?.cover_image_url ||
      defaults.default_image_url ||
      ''
    );

    // Ensure image is absolute URL
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://humpahadihaii.in';
    const absoluteImage = image && !image.startsWith('http') 
      ? `${origin}${image.startsWith('/') ? '' : '/'}${image}`
      : image;

    // Build canonical URL
    const baseUrl = origin;
    const canonical = pageUrl 
      ? (pageUrl.startsWith('http') ? pageUrl : `${baseUrl}${pageUrl}`)
      : (entity?.slug ? `${baseUrl}/${entityType}s/${entity.slug}` : baseUrl);

    return {
      title,
      description,
      image: absoluteImage,
      canonical,
      ogType: entityType === 'product' ? 'product' : entityType === 'event' ? 'event' : 'article',
      twitterCard: 'summary_large_image',
      twitterSite: defaults.twitter_site || '@humpahadihaii',
      siteName: defaults.site_name || 'Hum Pahadi Haii',
      locale: defaults.locale || 'en_IN'
    };
  }, [entity, entityType, globalSettings, pageUrl]);
}
