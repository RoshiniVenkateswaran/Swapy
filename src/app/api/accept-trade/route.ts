import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * ACCEPT TRADE API
 * 
 * Handles accepting trade proposals
 * - 1-to-1: Accept and complete immediately
 * - Multi-hop: Add to acceptedBy, complete when all accept
 */

export async function POST(request: NextRequest) {
  try {
    const { tradeId, userId } = await request.json();

    if (!tradeId || !userId) {
      return NextResponse.json(
        { error: 'Missing tradeId or userId' },
        { status: 400 }
      );
    }

    console.log('✅ Accepting trade:', tradeId, 'by user:', userId);

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

    if (trade.type === '1-to-1') {
      // 1-to-1 Trade: Both users must accept
      console.log('🤝 Processing 1-to-1 trade acceptance');

      const acceptedBy = trade.acceptedBy || [];

      // Check if user already accepted
      if (acceptedBy.includes(userId)) {
        return NextResponse.json({
          success: true,
          message: 'You have already accepted this trade.',
          tradeStatus: 'pending',
        });
      }

      // Add user to acceptedBy
      acceptedBy.push(userId);

      // Check if both users accepted (1-to-1 has exactly 2 users)
      const allUsersAccepted = trade.usersInvolved.every((uid: string) =>
        acceptedBy.includes(uid)
      );

      if (allUsersAccepted) {
        // Both users accepted - complete the trade!
        console.log('🎉 Both users accepted! Completing 1-to-1 trade...');

        await tradeRef.update({
          status: 'completed',
          acceptedBy,
          acceptedAt: FieldValue.serverTimestamp(),
          completedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Update both items to "traded"
        const updates = [];
        
        if (trade.item1Id) {
          updates.push(
            adminDb.collection('items').doc(trade.item1Id).update({
              status: 'traded',
              tradedAt: FieldValue.serverTimestamp(),
            })
          );
        }

        if (trade.item2Id) {
          updates.push(
            adminDb.collection('items').doc(trade.item2Id).update({
              status: 'traded',
              tradedAt: FieldValue.serverTimestamp(),
            })
          );
        }

        await Promise.all(updates);

        console.log('✅ 1-to-1 trade completed!');

        return NextResponse.json({
          success: true,
          message: '🎉 Both users accepted! Trade completed!',
          tradeStatus: 'completed',
          allAccepted: true,
        });

      } else {
        // Partial acceptance (1 out of 2)
        await tradeRef.update({
          acceptedBy,
          updatedAt: FieldValue.serverTimestamp(),
        });

        const remaining = trade.usersInvolved.length - acceptedBy.length;

        console.log(`⏳ Partial acceptance: ${acceptedBy.length}/${trade.usersInvolved.length}`);

        return NextResponse.json({
          success: true,
          message: `✅ You accepted! Waiting for the other user to accept.`,
          tradeStatus: 'pending',
          acceptedCount: acceptedBy.length,
          totalCount: trade.usersInvolved.length,
        });
      }

    } else if (trade.type === 'multi-hop') {
      // Multi-hop: Add to acceptedBy array
      console.log('🔄 Processing multi-hop trade acceptance');

      const acceptedBy = trade.acceptedBy || [];

      // Check if user already accepted
      if (acceptedBy.includes(userId)) {
        return NextResponse.json({
          success: true,
          message: 'You have already accepted this trade.',
          tradeStatus: 'pending',
        });
      }

      // Add user to acceptedBy
      acceptedBy.push(userId);

      const allUsersAccepted = trade.usersInvolved.every((uid: string) =>
        acceptedBy.includes(uid)
      );

      if (allUsersAccepted) {
        // All users accepted - complete the trade!
        console.log('🎉 All users accepted! Completing multi-hop trade...');

        await tradeRef.update({
          status: 'completed',
          acceptedBy,
          acceptedAt: FieldValue.serverTimestamp(),
          completedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Mark all items as traded
        const itemUpdates = trade.chainData.items.map((item: any) =>
          adminDb.collection('items').doc(item.itemId).update({
            status: 'traded',
            tradedAt: FieldValue.serverTimestamp(),
          })
        );

        await Promise.all(itemUpdates);

        console.log('✅ Multi-hop trade completed!');

        return NextResponse.json({
          success: true,
          message: `🎉 All ${trade.usersInvolved.length} users accepted! Trade completed!`,
          tradeStatus: 'completed',
          allAccepted: true,
        });

      } else {
        // Partial acceptance
        await tradeRef.update({
          acceptedBy,
          updatedAt: FieldValue.serverTimestamp(),
        });

        const remaining = trade.usersInvolved.length - acceptedBy.length;

        console.log(`⏳ Partial acceptance: ${acceptedBy.length}/${trade.usersInvolved.length}`);

        return NextResponse.json({
          success: true,
          message: `✅ You accepted! Waiting for ${remaining} more user${remaining > 1 ? 's' : ''}.`,
          tradeStatus: 'pending',
          acceptedCount: acceptedBy.length,
          totalCount: trade.usersInvolved.length,
        });
      }

    } else {
      return NextResponse.json(
        { error: 'Unknown trade type' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('❌ Error accepting trade:', error);
    return NextResponse.json(
      { error: 'Failed to accept trade', details: error.message },
      { status: 500 }
    );
  }
}

