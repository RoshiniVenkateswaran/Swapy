import { NextRequest, NextResponse } from 'next/server';
import { PRICE_TABLE } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, itemName, description } = await request.json();

    // Validate inputs
    if (!imageUrl || !itemName || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: imageUrl, itemName, or description' },
        { status: 400 }
      );
    }

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
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter API error:', openRouterResponse.status, errorText);
      throw new Error(`OpenRouter API failed with status ${openRouterResponse.status}`);
    }

    const aiData: any = await openRouterResponse.json();
    
    // Validate AI response structure
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error('Invalid AI response structure:', aiData);
      throw new Error('Invalid response from AI');
    }

    const aiContent = aiData.choices[0].message.content;

    // Parse AI response
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
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
      { error: `Failed to analyze item: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

