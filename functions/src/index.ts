import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

admin.initializeApp();

const db = admin.firestore();

// Price table for estimating values
const PRICE_TABLE: Record<string, { min: number; max: number }> = {
  electronics: { min: 20, max: 1000 },
  furniture: { min: 20, max: 500 },
  textbooks: { min: 20, max: 300 },
  clothing: { min: 5, max: 100 },
  sports_equipment: { min: 10, max: 300 },
  kitchen: { min: 10, max: 150 },
  bedding: { min: 15, max: 100 },
  decorations: { min: 5, max: 80 },
  other: { min: 10, max: 100 },
};

/**
 * Cloud Function: Analyze Item with AI
 */
export const analyzeItem = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { imageUrl, itemName, description } = data;

  // Validate inputs
  if (!imageUrl || !itemName || !description) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields: imageUrl, itemName, or description'
    );
  }

  try {
    // Call OpenRouter API with Gemini
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this item for a campus barter platform. Item name: "${itemName}". Description: "${description}".

Return a JSON object with:
- category: one of [Electronics, Furniture, Textbooks, Clothing, Sports Equipment, Kitchen, Bedding, Decorations, Other]
- conditionScore: number 0-100 based on condition described
- keywords: array of relevant keywords
- attributes: object with relevant attributes (color, brand, size, etc.)

Only return valid JSON, no additional text.`,
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      }),
    });

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API failed with status ${response.status}`);
    }

    const aiData: any = await response.json();
    
    // Validate AI response structure
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error('Invalid AI response structure:', aiData);
      throw new Error('Invalid response from AI');
    }

    const aiContent = aiData.choices[0].message.content;

    let analysisResult;
    try {
      analysisResult = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      // Fallback to default values
      analysisResult = {
        category: 'Other',
        conditionScore: 70,
        keywords: [itemName.toLowerCase()],
        attributes: {},
      };
    }

    // Calculate estimated value
    const categoryKey = analysisResult.category.toLowerCase().replace(/\s+/g, '_');
    const priceRange = PRICE_TABLE[categoryKey] || PRICE_TABLE.other;
    const basePrice = (priceRange.min + priceRange.max) / 2;
    const estimatedValue = Math.round(basePrice * (analysisResult.conditionScore / 100));

    return {
      ...analysisResult,
      estimatedValue,
    };
  } catch (error: any) {
    console.error('Error analyzing item:', error);
    throw new functions.https.HttpsError(
      'internal', 
      `Failed to analyze item: ${error.message || 'Unknown error'}`
    );
  }
});

/**
 * Cloud Function: Update trade status
 */
export const updateTradeStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { tradeId, status } = data;

  try {
    const tradeRef = db.collection('trades').doc(tradeId);
    const tradeDoc = await tradeRef.get();

    if (!tradeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Trade not found');
    }

    const tradeData = tradeDoc.data()!;

    // Check if user is involved in the trade
    if (!tradeData.usersInvolved.includes(context.auth.uid)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User not involved in this trade'
      );
    }

    // Update trade status
    await tradeRef.update({ status });

    // If completed, mark items as traded
    if (status === 'completed') {
      const batch = db.batch();
      for (const itemId of tradeData.itemsInvolved) {
        const itemRef = db.collection('items').doc(itemId);
        batch.update(itemRef, { status: 'traded' });
      }
      await batch.commit();
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating trade status:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update trade status');
  }
});

/**
 * Cloud Function: Update stats on new item
 */
export const updateStatsOnNewItem = functions.firestore
  .document('items/{itemId}')
  .onCreate(async (snap, context) => {
    const itemData = snap.data();

    // Update supply for item's category
    const supplyCategoryRef = db.collection('stats').doc(itemData.category);
    await supplyCategoryRef.set(
      {
        category: itemData.category,
        supplyCount: admin.firestore.FieldValue.increment(1),
        demandCount: 0,
      },
      { merge: true }
    );

    // Update demand for desired categories
    const batch = db.batch();
    for (const desiredCategory of itemData.desiredCategories) {
      const demandCategoryRef = db.collection('stats').doc(desiredCategory);
      batch.set(
        demandCategoryRef,
        {
          category: desiredCategory,
          demandCount: admin.firestore.FieldValue.increment(1),
          supplyCount: 0,
        },
        { merge: true }
      );
    }
    await batch.commit();
  });

