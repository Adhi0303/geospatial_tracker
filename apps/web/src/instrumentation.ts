/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts (before any requests are handled)
 * Perfect for initializing API key validation and JWT token generation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeApiTokens } = await import('./lib/apiKeyValidator');
    
    console.log('[Instrumentation] Server starting - validating API keys...');
    await initializeApiTokens();
    console.log('[Instrumentation] API key validation complete.');
  }
}
