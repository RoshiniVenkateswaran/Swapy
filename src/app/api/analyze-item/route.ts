import { NextRequest, NextResponse } from 'next/server';
import { PRICE_TABLE } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, itemName, description } = await request.json();

    // Call OpenRouter API with Gemini 1.5 Flash
    const openRouterResponse = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
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
      }
    );

    if (!openRouterResponse.ok) {
      throw new Error('Failed to analyze with AI');
    }

    const aiData = await openRouterResponse.json();
    const aiContent = aiData.choices[0]?.message?.content;

    // Parse AI response
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiContent);
    } catch {
      // Fallback if AI doesn't return valid JSON
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

    return NextResponse.json({
      ...analysisResult,
      estimatedValue,
    });
  } catch (error: any) {
    console.error('Error analyzing item:', error);
    return NextResponse.json(
      { error: 'Failed to analyze item' },
      { status: 500 }
    );
  }
}

