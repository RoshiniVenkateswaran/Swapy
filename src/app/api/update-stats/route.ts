import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { category, desiredCategories } = await request.json();

    // Update supply count for the item's category
    const supplyCategoryRef = doc(db, 'stats', category);
    const supplyDoc = await getDoc(supplyCategoryRef);

    if (supplyDoc.exists()) {
      await setDoc(
        supplyCategoryRef,
        { supplyCount: increment(1) },
        { merge: true }
      );
    } else {
      await setDoc(supplyCategoryRef, {
        category,
        supplyCount: 1,
        demandCount: 0,
      });
    }

    // Update demand count for desired categories
    for (const desiredCategory of desiredCategories) {
      const demandCategoryRef = doc(db, 'stats', desiredCategory);
      const demandDoc = await getDoc(demandCategoryRef);

      if (demandDoc.exists()) {
        await setDoc(
          demandCategoryRef,
          { demandCount: increment(1) },
          { merge: true }
        );
      } else {
        await setDoc(demandCategoryRef, {
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

