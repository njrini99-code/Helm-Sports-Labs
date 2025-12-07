import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

type UserRole = 'player' | 'coach' | 'admin';
type CoachType = 'college' | 'high_school' | 'juco' | 'showcase';

interface RouteConfig {
  allowedRoles: UserRole[];
  allowedCoachTypes?: CoachType[];
  redirectTo?: string;
}

// Define protected routes and their allowed roles
const PROTECTED_ROUTES: Record<string, RouteConfig> = {
  // ═══════════════════════════════════════════════════════════════════════
  // HIGH SCHOOL COACH ROUTES
  // ═══════════════════════════════════════════════════════════════════════
  '/hs-coach/dashboard': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['high_school'],
    redirectTo: '/coach/high-school',
  },
  '/hs-coach/roster': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['high_school'],
    redirectTo: '/coach/high-school/roster',
  },
  '/coach/high-school': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['high_school'],
  },
  '/coach/high-school/roster': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['high_school'],
  },
  '/coach/high-school/team': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['high_school'],
  },
  '/coach/high-school/messages': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['high_school'],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // JUCO COACH ROUTES
  // ═══════════════════════════════════════════════════════════════════════
  '/juco/dashboard': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['juco'],
    redirectTo: '/coach/juco',
  },
  '/juco/portal': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['juco'],
    redirectTo: '/coach/juco/transfer-portal',
  },
  '/coach/juco': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['juco'],
  },
  '/coach/juco/transfer-portal': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['juco'],
  },
  '/coach/juco/team': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['juco'],
  },
  '/coach/juco/messages': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['juco'],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // COLLEGE COACH ROUTES
  // ═══════════════════════════════════════════════════════════════════════
  '/coach/college': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['college'],
  },
  '/coach/college/discover': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['college'],
  },
  '/coach/college/watchlist': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['college'],
  },
  '/coach/college/recruiting-planner': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['college'],
  },
  '/coach/college/calendar': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['college'],
  },
  '/coach/college/camps': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['college'],
  },
  '/coach/college/messages': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['college'],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SHOWCASE COACH ROUTES
  // ═══════════════════════════════════════════════════════════════════════
  '/coach/showcase': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['showcase'],
  },
  '/coach/showcase/team': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['showcase'],
  },
  '/coach/showcase/messages': {
    allowedRoles: ['coach'],
    allowedCoachTypes: ['showcase'],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ANY COACH ROUTES (all coach types allowed)
  // ═══════════════════════════════════════════════════════════════════════
  '/coach/player': {
    allowedRoles: ['coach'],
    // No allowedCoachTypes means all coach types can access
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PLAYER ROUTES
  // ═══════════════════════════════════════════════════════════════════════
  '/player': {
    allowedRoles: ['player'],
  },
  '/player/journey': {
    allowedRoles: ['player'],
    redirectTo: '/player/dashboard/recruiting',
  },
  '/player/dashboard': {
    allowedRoles: ['player'],
  },
  '/player/dashboard/recruiting': {
    allowedRoles: ['player'],
  },
  '/player/dashboard/performance': {
    allowedRoles: ['player'],
  },
  '/player/dashboard/events': {
    allowedRoles: ['player'],
  },
  '/player/dashboard/programs': {
    allowedRoles: ['player'],
  },
  '/player/dashboard/settings': {
    allowedRoles: ['player'],
  },
  '/player/discover': {
    allowedRoles: ['player'],
  },
  '/player/team': {
    allowedRoles: ['player'],
  },
  '/player/messages': {
    allowedRoles: ['player'],
  },
  '/player/profile': {
    allowedRoles: ['player'],
  },
  '/player/camps': {
    allowedRoles: ['player'],
  },
  '/player/notifications': {
    allowedRoles: ['player'],
  },
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/onboarding/coach',
  '/onboarding/player',
  '/test-db',
  '/test-d1-badges',
  '/api',
];

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Check for dev mode cookie
  const devModeCookie = request.cookies.get('dev_mode');
  const devRoleCookie = request.cookies.get('dev_role');
  
  if (devModeCookie?.value === 'true') {
    // In dev mode, handle alias routes with redirects
    const matchedRoute = findMatchingRoute(pathname);
    if (matchedRoute?.redirectTo) {
      return NextResponse.redirect(new URL(matchedRoute.redirectTo, request.url));
    }
    return NextResponse.next();
  }

  // Create Supabase client for auth check
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Get session
  const { data: { session } } = await supabase.auth.getSession();

  // Find matching route configuration
  const matchedRoute = findMatchingRoute(pathname);

  // Handle alias routes with redirects (even without auth)
  if (matchedRoute?.redirectTo) {
    return NextResponse.redirect(new URL(matchedRoute.redirectTo, request.url));
  }

  // If no session and trying to access protected route, redirect to login
  if (!session && matchedRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If session exists but route requires role validation
  if (session && matchedRoute) {
    // Get user profile for role check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    const userRole = profile?.role as UserRole | undefined;

    if (!userRole || !matchedRoute.allowedRoles.includes(userRole)) {
      // User doesn't have the required role
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Additional coach type validation
    if (userRole === 'coach' && matchedRoute.allowedCoachTypes) {
      const { data: coach } = await supabase
        .from('coaches')
        .select('coach_type')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const coachType = normalizeCoachType(coach?.coach_type);
      
      if (!coachType || !matchedRoute.allowedCoachTypes.includes(coachType)) {
        // Coach doesn't have the required coach type, redirect to their dashboard
        const redirectPath = getCoachDashboard(coachType);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
  }

  return response;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function findMatchingRoute(pathname: string): RouteConfig | null {
  // Exact match first
  if (PROTECTED_ROUTES[pathname]) {
    return PROTECTED_ROUTES[pathname];
  }

  // Check for dynamic routes (e.g., /coach/player/[id])
  for (const [route, config] of Object.entries(PROTECTED_ROUTES)) {
    // Handle dynamic segments
    if (pathname.startsWith(route + '/')) {
      return config;
    }
  }

  return null;
}

function normalizeCoachType(type: string | null | undefined): CoachType | null {
  if (!type) return null;
  const normalized = type.toLowerCase().replace('-', '_');
  if (['college', 'high_school', 'juco', 'showcase'].includes(normalized)) {
    return normalized as CoachType;
  }
  return null;
}

function getCoachDashboard(coachType: CoachType | null): string {
  switch (coachType) {
    case 'high_school':
      return '/coach/high-school';
    case 'juco':
      return '/coach/juco';
    case 'showcase':
      return '/coach/showcase';
    case 'college':
    default:
      return '/coach/college';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
