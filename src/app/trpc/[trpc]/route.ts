import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/routers';
import { createContext } from '@/lib/context';
import { NextRequest, NextResponse } from 'next/server';

function handler(req: NextRequest) {
  // Handle CORS for cross-origin requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-trpc-source',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  return fetchRequestHandler({
    endpoint: '/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(),
    responseMeta() {
      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-trpc-source',
          'Access-Control-Allow-Credentials': 'true',
        },
      };
    },
  });
}

export { handler as GET, handler as POST, handler as OPTIONS };
