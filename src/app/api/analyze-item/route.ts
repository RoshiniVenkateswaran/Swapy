// import { NextRequest, NextResponse } from 'next/server';

// const CATEGORIES = [
//   'Electronics',
//   'Furniture',
//   'Textbooks',
//   'Clothing',
//   'Sports Equipment',
//   'Kitchen',
//   'Bedding',
//   'Decorations',
//   'Other'
// ];

// const PRICE_TABLE = {
//   Electronics: 100,
//   Furniture: 80,
//   Textbooks: 50,
//   Clothing: 30,
//   'Sports Equipment': 60,
//   Kitchen: 40,
//   Bedding: 35,
//   Decorations: 25,
//   Other: 20,
// };

// export async function POST(request: NextRequest) {
//   try {
//     const { imageUrl, itemName, description } = await request.json();

//     console.log('Analyzing item:', { itemName, description, imageUrl: imageUrl?.substring(0, 50) + '...' });

//     if (!process.env.OPENROUTER_API_KEY) {
//       console.error('Missing OPENROUTER_API_KEY');
//       return NextResponse.json(
//         { error: 'API key not configured' },
//         { status: 500 }
//       );
//     }

//     const openRouterResponse = await fetch(
//       'https://openrouter.ai/api/v1/chat/completions',
//       {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           model: "meta-llama/llama-3.2-11b-vision-instruct",
//           // model: "google/gemini-2.0-flash-exp:free",
//           messages: [
//             {
//               role: 'system',
//               content: 'You are a JSON-only API. Return ONLY valid JSON with no additional text or explanations.'
//             },
//             {
//               role: 'user',
//               content: [
//                 {
//                   type: 'text',
//                   text: `Analyze this item: "${itemName}" - "${description}"

// Return ONLY this JSON structure with no other text:
// {
//   "category": "one of [${CATEGORIES.join(', ')}]",
//   "conditionScore": 85,
//   "keywords": ["keyword1", "keyword2"],
//   "attributes": {"color": "value", "brand": "value"}
// }`,
//                 },
//                 {
//                   type: 'image_url',
//                   image_url: { url: imageUrl },
//                 },
//               ],
//             },
//           ],
//           response_format: { type: "json_object" },
//         }),
//       }
//     );

//     console.log('OpenRouter status:', openRouterResponse.status);

//     if (!openRouterResponse.ok) {
//       const errorText = await openRouterResponse.text();
//       console.error('OpenRouter error:', errorText);
//       throw new Error(`OpenRouter API failed: ${errorText}`);
//     }

//     const aiResult = await openRouterResponse.json();
//     console.log('AI result:', JSON.stringify(aiResult, null, 2));

//     const aiContent = aiResult.choices[0]?.message?.content;
//     if (!aiContent) {
//       console.error('AI result structure:', aiResult);
//       throw new Error('No content in AI response');
//     }

//     console.log('Raw AI content:', aiContent);

//     // Parse the JSON - handle potential markdown code blocks
//     let cleanContent = aiContent.trim();
    
//     // Remove markdown code blocks if present
//     if (cleanContent.startsWith('```')) {
//       cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
//     }

//     let analysisData;
//     try {
//       analysisData = JSON.parse(cleanContent);
//     } catch (parseError) {
//       console.error('Failed to parse JSON:', cleanContent);
//       console.error('Parse error:', parseError);
//       throw new Error(`Invalid JSON response: ${cleanContent.substring(0, 200)}`);
//     }

//     console.log('Parsed analysis:', analysisData);

//     // Validate required fields
//     if (!analysisData.category || !analysisData.conditionScore) {
//       console.error('Missing required fields in analysis:', analysisData);
//       throw new Error('Analysis missing required fields');
//     }

//     // Calculate estimated value
//     const baseValue = PRICE_TABLE[analysisData.category as keyof typeof PRICE_TABLE] || 20;
//     const estimatedValue = Math.round(Number(baseValue) * (Number(analysisData.conditionScore) / 100));

//     return NextResponse.json({
//       category: analysisData.category,
//       conditionScore: analysisData.conditionScore,
//       estimatedValue,
//       keywords: analysisData.keywords || [],
//       attributes: analysisData.attributes || {},
//     });

//   } catch (error) {
//     console.error('Error in analyze-item:', error);
//     return NextResponse.json(
//       { error: 'Failed to analyze item', details: error instanceof Error ? error.message : String(error) },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server';

const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Textbooks',
  'Clothing',
  'Sports Equipment',
  'Kitchen',
  'Bedding',
  'Decorations',
  'Other'
];

const PRICE_TABLE = {
  Electronics: {
    min: 70,
    max: 300,
    subcategories: {
      Laptop: { min: 150, max: 300 },
      Phone: { min: 100, max: 250 },
      Headphones: { min: 20, max: 100 },
      Tablet: { min: 80, max: 200 },
      Charger: { min: 10, max: 40 },
    }
  },
  Furniture: {
    min: 20,
    max: 120,
    subcategories: {
      Desk: { min: 40, max: 120 },
      Chair: { min: 20, max: 80 },
      Lamp: { min: 10, max: 40 },
      Shelf: { min: 25, max: 90 },
      Table: { min: 30, max: 100 },
    }
  },
  Textbooks: {
    min: 5,
    max: 40,
    subcategories: {}
  },
  Clothing: {
    min: 10,
    max: 50,
    subcategories: {
      Jacket: { min: 20, max: 50 },
      Shoes: { min: 15, max: 45 },
      Shirt: { min: 10, max: 30 },
    }
  },
  'Sports Equipment': {
    min: 15,
    max: 100,
    subcategories: {
      Weights: { min: 20, max: 80 },
      Ball: { min: 10, max: 40 },
      Racket: { min: 15, max: 60 },
    }
  },
  Kitchen: {
    min: 10,
    max: 60,
    subcategories: {
      Microwave: { min: 30, max: 60 },
      Blender: { min: 15, max: 45 },
      Utensils: { min: 5, max: 25 },
    }
  },
  Bedding: {
    min: 10,
    max: 50,
    subcategories: {}
  },
  Decorations: {
    min: 5,
    max: 35,
    subcategories: {}
  },
  Other: {
    min: 5,
    max: 30,
    subcategories: {}
  }
};

function getConditionMultiplier(conditionScore: number): number {
  if (conditionScore >= 90) return 1.0;
  if (conditionScore >= 70) return 0.8;
  if (conditionScore >= 50) return 0.6;
  if (conditionScore >= 30) return 0.4;
  return 0.2;
}

function calculateAttributeBoost(keywords: string[]): number {
  let totalBoost = 0;
  const keywordString = keywords.join(' ').toLowerCase();

  // Positive boosts
  if (/foldable|portable|sturdy/.test(keywordString)) totalBoost += 0.05;
  if (/brand|premium/.test(keywordString)) totalBoost += 0.10;

  // Negative boosts
  if (/damaged|scratched/.test(keywordString)) totalBoost -= 0.10;
  if (/broken|rust/.test(keywordString)) totalBoost -= 0.25;

  return totalBoost;
}

function calculateEstimatedValue(
  category: string,
  conditionScore: number,
  keywords: string[],
  attributes: Record<string, any>
): number {
  const categoryData = PRICE_TABLE[category as keyof typeof PRICE_TABLE];
  if (!categoryData) return 20;

  // Check for subcategory
  let min = categoryData.min;
  let max = categoryData.max;

  if (attributes?.type && categoryData.subcategories[attributes.type as keyof typeof categoryData.subcategories]) {
    const subcatData = categoryData.subcategories[attributes.type as keyof typeof categoryData.subcategories];
    min = (subcatData as { min: number; max: number }).min;
    max = (subcatData as { min: number; max: number }).max;
  }

  // Calculate base value using condition multiplier
  const conditionMultiplier = getConditionMultiplier(conditionScore);
  const baseValue = min + (max - min) * conditionMultiplier;

  // Apply attribute boosts
  const attributeBoost = calculateAttributeBoost(keywords);
  let finalValue = baseValue * (1 + attributeBoost);

  // Safety bounds
  const absoluteMin = min;
  const absoluteMax = max * 1.2;
  finalValue = Math.max(absoluteMin, Math.min(absoluteMax, finalValue));

  return Math.round(finalValue);
}

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

    console.log('Analyzing item:', { itemName, description, imageUrl: imageUrl?.substring(0, 50) + '...' });

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('Missing OPENROUTER_API_KEY');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const openRouterResponse = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this campus barter item and respond with ONLY a valid JSON object (no markdown, no explanations).

Item: "${itemName}"
Description: "${description}"

Required JSON format:
{
  "category": "<choose one: ${CATEGORIES.join(', ')}>",
  "conditionScore": <number 0-100>,
  "keywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "attributes": {"color": "<value>", "brand": "<value>", "type": "<specific item type like Desk, Laptop, etc if applicable>"}
}`,
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

    console.log('OpenRouter status:', openRouterResponse.status);

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter error:', errorText);
      throw new Error(`OpenRouter API failed: ${errorText}`);
    }

    const aiResult = await openRouterResponse.json();
    console.log('AI result:', JSON.stringify(aiResult, null, 2));

    const aiContent = aiResult.choices[0]?.message?.content;
    if (!aiContent) {
      console.error('AI result structure:', aiResult);
      throw new Error('No content in AI response');
    }

    console.log('Raw AI content:', aiContent);

    // Parse the JSON - handle potential markdown code blocks
    let cleanContent = aiContent.trim();
    
    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    let analysisData;
    try {
      analysisData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse JSON:', cleanContent);
      console.error('Parse error:', parseError);
      throw new Error(`Invalid JSON response: ${cleanContent.substring(0, 200)}`);
    }

    console.log('Parsed analysis:', analysisData);

    // Validate required fields
    if (!analysisData.category || !analysisData.conditionScore) {
      console.error('Missing required fields in analysis:', analysisData);
      throw new Error('Analysis missing required fields');
    }

    // Calculate estimated value using new logic
    const estimatedValue = calculateEstimatedValue(
      analysisData.category,
      analysisData.conditionScore,
      analysisData.keywords || [],
      analysisData.attributes || {}
    );

    console.log('Calculated value:', estimatedValue);

    return NextResponse.json({
      category: analysisData.category,
      conditionScore: analysisData.conditionScore,
      estimatedValue,
      keywords: analysisData.keywords || [],
      attributes: analysisData.attributes || {},
    });

  } catch (error) {
    console.error('Error in analyze-item:', error);
    return NextResponse.json(
      { error: 'Failed to analyze item' },
      { status: 500 }
    );
  }
}