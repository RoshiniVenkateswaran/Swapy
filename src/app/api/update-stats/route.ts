import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { category, desiredCategories } = await request.json();

    // Update supply count for the item's category
    const supplyCategoryRef = adminDb.collection('stats').doc(category);
    const supplyDoc = await supplyCategoryRef.get();

    if (supplyDoc.exists) {
      await supplyCategoryRef.set(
        { supplyCount: FieldValue.increment(1) },
        { merge: true }
      );
    } else {
      await supplyCategoryRef.set({
        category,
        supplyCount: 1,
        demandCount: 0,
      });
    }

    // Update demand count for desired categories
    for (const desiredCategory of desiredCategories) {
      const demandCategoryRef = adminDb.collection('stats').doc(desiredCategory);
      const demandDoc = await demandCategoryRef.get();

      if (demandDoc.exists) {
        await demandCategoryRef.set(
          { demandCount: FieldValue.increment(1) },
          { merge: true }
        );
      } else {
        await demandCategoryRef.set({
          category: desiredCategory,
          supplyCount: 0,
          demandCount: 1,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating stats:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}

