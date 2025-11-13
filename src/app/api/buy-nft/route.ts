
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import type { Nft, UserAccount } from '@/lib/data';

// DEPRECATED: This logic has been moved to a client-side transaction in nft-context.tsx
// for better real-time feedback and to simplify server logic. This API route is no longer used.
export async function POST(request: NextRequest) {
    console.warn("DEPRECATION WARNING: /api/buy-nft is called, but logic has moved to client-side transaction in NftProvider.");
    return NextResponse.json({ ok: false, error: 'This API route is deprecated.' }, { status: 410 });
}

    