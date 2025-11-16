import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * DECLINE TRADE API
 * 
 * Handles declining/rejecting trade proposals
 * - Marks trade as declined
 * - Reverts items back to available
 * - Works for both 1-to-1 and multi-hop
 */

// Force dynamic rendering - don't pre-render during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { tradeId, userId } = await request.json();

    if (!tradeId || !userId) {
      return NextResponse.json(
        { error: 'Missing tradeId or userId' },
        { status: 400 }
      );
    }

    console.log('❌ Declining trade:', tradeId, 'by user:', userId);

    // Get the trade
    const tradeRef = adminDb.collection('trades').doc(tradeId);
    const tradeDoc = await tradeRef.get();

    if (!tradeDoc.exists) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      );
    }

    const trade = tradeDoc.data();

    // Verify user is involved in this trade
    if (!trade?.usersInvolved?.includes(userId)) {
      return NextResponse.json(
        { error: 'You are not part of this trade' },
        { status: 403 }
      );
    }

    // Check if trade is still pending
    if (trade.status !== 'pending') {
      return NextResponse.json(
        { error: `Trade is already ${trade.status}` },
        { status: 400 }
      );
    }

    // Update trade status to declined
    await tradeRef.update({
      status: 'declined',
      declinedBy: userId,
      declinedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Revert items back to available
    const updates = [];

    if (trade.type === '1-to-1') {
      console.log('🤝 Declining 1-to-1 trade');

      if (trade.item1Id) {
        updates.push(
          adminDb.collection('items').doc(trade.item1Id).update({
            status: 'available',
          })
        );
      }

      if (trade.item2Id) {
        updates.push(
          adminDb.collection('items').doc(trade.item2Id).update({
            status: 'available',
          })
        );
      }

    } else if (trade.type === 'multi-hop') {
      console.log('🔄 Declining multi-hop trade');

      // Revert all items in the chain
      if (trade.chainData?.items) {
        trade.chainData.items.forEach((item: any) => {
          updates.push(
            adminDb.collection('items').doc(item.itemId).update({
              status: 'available',
            })
          );
        });
      }
    }

    await Promise.all(updates);

    console.log('✅ Trade declined and items reverted to available');

    return NextResponse.json({
      success: true,
      message: 'Trade declined. Items are now available for other trades.',
    });

  } catch (error: any) {
    console.error('❌ Error declining trade:', error);
    return NextResponse.json(
      { error: 'Failed to decline trade', details: error.message },
      { status: 500 }
    );
  }
}

