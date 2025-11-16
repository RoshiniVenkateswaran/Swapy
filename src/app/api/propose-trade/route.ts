import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * TRADE PROPOSAL API
 * 
 * Creates a trade proposal between two users
 * Types: 1-to-1 trade or multi-hop chain
 */

export async function POST(request: NextRequest) {
  try {
    const { type, proposerId, item1Id, item2Id, chainData } = await request.json();

    if (!proposerId) {
      return NextResponse.json(
        { error: 'Missing proposerId' },
        { status: 400 }
      );
    }

    console.log('📤 Creating trade proposal:', type);

    if (type === '1-to-1') {
      // Single trade proposal
      if (!item1Id || !item2Id) {
        return NextResponse.json(
          { error: 'Missing item IDs for 1-to-1 trade' },
          { status: 400 }
        );
      }

      // Get both items
      const item1Doc = await adminDb.collection('items').doc(item1Id).get();
      const item2Doc = await adminDb.collection('items').doc(item2Id).get();

      if (!item1Doc.exists || !item2Doc.exists) {
        return NextResponse.json(
          { error: 'One or both items not found' },
          { status: 404 }
        );
      }

      const item1 = { itemId: item1Doc.id, ...item1Doc.data() } as any;
      const item2 = { itemId: item2Doc.id, ...item2Doc.data() } as any;

      // Check if items are still available
      if (item1.status !== 'available' || item2.status !== 'available') {
        return NextResponse.json(
          { error: 'One or both items are no longer available' },
          { status: 400 }
        );
      }

      // Create trade proposal
      const tradeRef = await adminDb.collection('trades').add({
        type: '1-to-1',
        status: 'pending',
        proposerId,
        item1Id,
        item2Id,
        item1UserId: item1.userId,
        item2UserId: item2.userId,
        usersInvolved: [item1.userId, item2.userId],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Mark both items as pending
      await Promise.all([
        adminDb.collection('items').doc(item1Id).update({
          status: 'pending',
          pendingTradeId: tradeRef.id,
        }),
        adminDb.collection('items').doc(item2Id).update({
          status: 'pending',
          pendingTradeId: tradeRef.id,
        }),
      ]);

      console.log('✅ Trade proposal created:', tradeRef.id);

      return NextResponse.json({
        success: true,
        tradeId: tradeRef.id,
        message: 'Trade proposal sent! The other user will be notified.',
      });

    } else if (type === 'multi-hop') {
      // Multi-hop chain proposal
      if (!chainData || !chainData.items || !chainData.userIds) {
        return NextResponse.json(
          { error: 'Missing chain data for multi-hop trade' },
          { status: 400 }
        );
      }

      // Verify all items are still available
      const itemChecks = await Promise.all(
        chainData.items.map((item: any) =>
          adminDb.collection('items').doc(item.itemId).get()
        )
      );

      const allAvailable = itemChecks.every((doc) => {
        const data = doc.data();
        return doc.exists && data?.status === 'available';
      });

      if (!allAvailable) {
        return NextResponse.json(
          { error: 'One or more items in the chain are no longer available' },
          { status: 400 }
        );
      }

      // Create multi-hop trade proposal
      const tradeRef = await adminDb.collection('trades').add({
        type: 'multi-hop',
        status: 'pending',
        proposerId,
        chainData: {
          items: chainData.items.map((item: any) => ({
            itemId: item.itemId,
            name: item.name,
            imageUrl: item.imageUrl,
            estimatedValue: item.estimatedValue,
            userId: item.userId,
          })),
          userIds: chainData.userIds,
          chainLength: chainData.chainLength,
          chainFairnessScore: chainData.chainFairnessScore,
          reasoning: chainData.reasoning,
        },
        usersInvolved: chainData.userIds,
        acceptedBy: [proposerId], // Proposer auto-accepts
        rejectedBy: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Mark all items in chain as pending
      const itemUpdates = chainData.items.map((item: any) =>
        adminDb.collection('items').doc(item.itemId).update({
          status: 'pending',
          pendingTradeId: tradeRef.id,
        })
      );
      await Promise.all(itemUpdates);

      console.log('✅ Multi-hop proposal created:', tradeRef.id);

      return NextResponse.json({
        success: true,
        tradeId: tradeRef.id,
        message: `Multi-hop trade proposal sent to ${chainData.userIds.length} users!`,
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid trade type' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('❌ Error creating trade proposal:', error);
    return NextResponse.json(
      { error: 'Failed to create trade proposal', details: error.message },
      { status: 500 }
    );
  }
}

