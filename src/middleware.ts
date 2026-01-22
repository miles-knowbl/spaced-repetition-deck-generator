import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Next.js internals (_next)
  // - Static files (favicon.ico, images, etc.)
  matcher: ['/', '/(ar|cs|da|de|el|en|es|fi|fr|he|hi|hu|id|it|ja|ko|ms|nl|no|pl|pt|ro|ru|sv|th|tr|uk|vi|zh)/:path*'],
};
