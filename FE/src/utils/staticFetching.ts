/**
 * Utilities for static data fetching with performance optimizations
 */

/**
 * Safely fetch data with error handling for static generation
 */
export async function fetchStaticData<T, A extends any[]>(
  fetcher: (...args: A) => Promise<T>,
  fallback: T,
  ...args: A
): Promise<T> {
  try {
    return await fetcher(...args);
  } catch (error) {
    console.error('Error fetching static data:', error);
    return fallback;
  }
}

/**
 * Create static props result with revalidation settings
 */
export function createStaticProps<T>(
  data: T,
  revalidate: number = 600
) {
  return {
    props: data,
    revalidate,
  };
}

/**
 * Get appropriate revalidation time based on data type
 */
export function getRevalidationTime(dataType: string): number {
  switch (dataType) {
    case 'product':
      return 3600; // 1 hour
    case 'category':
      return 7200; // 2 hours
    case 'home':
      return 1800; // 30 minutes
    default:
      return 600; // 10 minutes default
  }
} 