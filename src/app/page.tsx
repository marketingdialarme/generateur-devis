/**
 * ============================================================================
 * HOME PAGE - Dialarme Quote Generator
 * ============================================================================
 * Root page that redirects to the quote creation interface
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/create-devis');
}
