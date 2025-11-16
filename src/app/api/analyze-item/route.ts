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
  'electronics',
  'furniture',
  'books',
  'kitchen',
  'appliances',
  'clothing',
  'bags',
  'sports',
  'accessories'
];

const PRICE_TABLE = {
  electronics: {
    min: 15,
    max: 200,
    subcategories: {
      headphones: { min: 15, max: 80 },
      earbuds: { min: 8, max: 50 },
      speakers: { min: 20, max: 100 },
      keyboard: { min: 8, max: 60 },
      mouse: { min: 5, max: 35 },
      monitor: { min: 30, max: 150 },
      printer: { min: 30, max: 120 },
      calculator: { min: 8, max: 50 },
      powerbank: { min: 8, max: 40 },
      chargers: { min: 5, max: 25 },
      smartwatch: { min: 25, max: 100 },
      tablet: { min: 30, max: 150 },
      gaming_accessory: { min: 15, max: 80 }
    }
  },
  furniture: {
    min: 10,
    max: 200,
    subcategories: {
      chair: { min: 15, max: 80 },
      desk: { min: 40, max: 150 },
      stool: { min: 5, max: 40 },
      shelf: { min: 20, max: 120 },
      drawer: { min: 15, max: 100 },
      nightstand: { min: 20, max: 80 },
      beanbag: { min: 20, max: 100 },
      lamp: { min: 5, max: 40 },
      study_lamp: { min: 5, max: 40 }
    }
  },
  books: {
    min: 5,
    max: 50,
    subcategories: {
      textbook: { min: 10, max: 50 },
      novel: { min: 5, max: 30 },
      reference: { min: 10, max: 40 },
      exam_prep: { min: 10, max: 40 }
    }
  },
  kitchen: {
    min: 5,
    max: 80,
    subcategories: {
      utensils: { min: 5, max: 20 },
      cookware: { min: 10, max: 50 },
      plates: { min: 5, max: 20 },
      cups: { min: 5, max: 15 },
      water_bottle: { min: 5, max: 20 },
      storage_box: { min: 5, max: 25 },
      microwave_safe_container: { min: 5, max: 25 }
    }
  },
  appliances: {
    min: 20,
    max: 300,
    subcategories: {
      microwave: { min: 40, max: 150 },
      mini_fridge: { min: 60, max: 250 },
      toaster: { min: 10, max: 40 },
      kettle: { min: 10, max: 40 },
      coffee_maker: { min: 20, max: 100 },
      fan: { min: 10, max: 60 },
      heater: { min: 20, max: 80 },
      humidifier: { min: 15, max: 60 }
    }
  },
  clothing: {
    min: 5,
    max: 80,
    subcategories: {
      tshirt: { min: 5, max: 20 },
      hoodie: { min: 10, max: 45 },
      jacket: { min: 15, max: 80 },
      sweater: { min: 8, max: 40 },
      pants: { min: 8, max: 45 },
      sportswear: { min: 8, max: 45 }
    }
  },
  bags: {
    min: 15,
    max: 180,
    subcategories: {
      backpack: { min: 20, max: 120 },
      handbag: { min: 25, max: 180 },
      tote: { min: 15, max: 80 },
      laptop_bag: { min: 25, max: 140 }
    }
  },
  sports: {
    min: 10,
    max: 200,
    subcategories: {
      dumbbells: { min: 10, max: 60 },
      yoga_mat: { min: 10, max: 40 },
      sports_shoes: { min: 20, max: 120 },
      cricket_bat: { min: 20, max: 100 },
      basketball: { min: 10, max: 40 },
      football: { min: 10, max: 40 }
    }
  },
  accessories: {
    min: 5,
    max: 80,
    subcategories: {
      watch: { min: 10, max: 80 },
      wallet: { min: 5, max: 40 },
      belts: { min: 5, max: 30 },
      sunglasses: { min: 10, max: 60 }
    }
  }
};

// Condition multiplier based on user input (1-5 scale)
function getConditionMultiplier(condition: number): number {
  switch (condition) {
    case 5: return 1.0;
    case 4: return 0.85;
    case 3: return 0.70;
    case 2: return 0.50;
    case 1: return 0.30;
    default: return 0.70;
  }
}

// Age-based depreciation factor
function getAgeFactor(ageValue: number, ageUnit: 'years' | 'months'): number {
  let ageYears = ageValue;
  if (ageUnit === 'months') {
    ageYears = ageValue / 12;
  }
  const ageFactor = Math.max(0.40, 1 - ageYears * 0.1);
  return ageFactor;
}

// Brand tier boost with automatic premium brand recognition
// IMPORTANT: Brand boost should be more conservative and category-aware
function getBrandBoost(brandTier?: string, brandName?: string, category?: string): number {
  const brand = brandName?.toLowerCase() || '';
  const cat = category?.toLowerCase() || '';
  
  // Premium electronics brands (only for electronics)
  const premiumElectronicsBrands = ['apple', 'sony', 'samsung', 'dell', 'hp', 'lenovo'];
  
  // Premium fashion brands (only for clothing/bags/accessories)
  const premiumFashionBrands = ['adidas', 'nike'];
  
  // Apply brand boost only to relevant categories
  if (cat === 'electronics' || cat === 'appliances') {
    if (premiumElectronicsBrands.includes(brand)) {
      return 0.10; // Reduced from 0.15
    }
  } else if (cat === 'clothing' || cat === 'bags' || cat === 'sports' || cat === 'accessories') {
    if (premiumFashionBrands.includes(brand)) {
      return 0.08; // Reduced from 0.15 - fashion items get smaller boost
    }
  }
  
  // Fall back to LLM assessment
  if (!brandTier) return 0;
  const tier = brandTier.toLowerCase();
  if (tier === 'premium') {
    // Category-aware premium boost
    if (cat === 'electronics' || cat === 'appliances') return 0.10;
    if (cat === 'clothing' || cat === 'bags' || cat === 'sports') return 0.08;
    return 0.06; // Other categories get smaller boost
  }
  if (tier === 'mid') return 0.03; // Reduced from 0.05
  return 0; // low/unknown
}

// Convert conditionScore (10-100) to condition multiplier (0.1-1.0) for value calculation
function getConditionMultiplierFromScore(conditionScore: number): number {
  // Map conditionScore (10-100) to multiplier (0.1-1.0)
  // Linear mapping: 10 → 0.1, 100 → 1.0
  // Formula: (conditionScore - 10) / 90 gives us 0-1, then map to 0.1-1.0
  const normalized = (conditionScore - 10) / 90; // 0 to 1 range when score is 10-100
  return 0.1 + normalized * 0.9; // Map to 0.1 to 1.0 range
}

// Calculate conditionScore based on user input, age, and keywords
// This is fully data-driven - LLM never decides the score
function calculateConditionScore(
  userCondition: number, // User input: 1-5 scale
  ageValue: number,
  ageUnit: 'years' | 'months',
  keywords: string[]
): number {
  // 1. Start with user-reported condition mapped to 0-100 scale
  // Mapping: 1→20, 2→40, 3→60, 4→80, 5→100 (linear scale)
  let conditionScore = userCondition * 20;

  // 2. Age-based adjustment
  // Older items naturally have worse condition, but user already accounted for some of this
  // Apply slight age penalty: -1 point per year, max -15 points
  let ageYears = ageValue || 0;
  if (ageUnit === 'months') {
    ageYears = ageValue / 12;
  }
  const agePenalty = Math.min(15, Math.max(0, ageYears * 1)); // -1 per year, capped at -15
  conditionScore -= agePenalty;

  // 3. Keyword-based adjustment (only negative keywords affect condition)
  // Keywords like "scratched", "worn", "damaged", "broken" indicate worse condition
  // IMPORTANT: Only apply penalties if keywords clearly indicate worse condition than user reported
  // User has already assessed condition, so keywords should only adjust if significantly different
  const keywordString = keywords.join(' ').toLowerCase();
  let keywordAdjustment = 0;

  // Severe damage keywords: -25 to -40 points (only if user didn't report poor condition)
  if (userCondition >= 3 && (/broken|malfunctioning|not working|doesn't work/.test(keywordString))) {
    keywordAdjustment = -40;
  } else if (userCondition >= 3 && (/damaged|torn|cracked|severely worn/.test(keywordString))) {
    keywordAdjustment = -25;
  }
  // Moderate wear keywords: -8 to -12 points (reduced penalty for "average" items)
  else if (userCondition >= 3 && (/severely worn|heavily worn|much wear/.test(keywordString))) {
    keywordAdjustment = -12;
  } else if (userCondition >= 3 && (/worn|faded|scratched|scuffed|dented/.test(keywordString))) {
    // Lighter penalty - "worn" is expected for "average" condition items
    keywordAdjustment = -8;
  }
  // Light wear keywords: -2 to -5 points (minimal for average condition)
  else if (/slight wear|minor wear|used condition|signs of use/.test(keywordString)) {
    keywordAdjustment = -3; // Minimal adjustment
  }
  // No penalty if user already reported poor condition (1-2)
  // User's assessment is trusted more for poor condition items

  conditionScore += keywordAdjustment;

  // 4. Clamp final result between 10-100
  // Never go below 10 (absolute worst) or above 100 (perfect condition)
  conditionScore = Math.max(10, Math.min(100, conditionScore));

  return Math.round(conditionScore);
}

// Attribute boosts from keywords (for value calculation only, not condition)
function calculateAttributeBoost(keywords: string[]): number {
  let totalBoost = 0;
  const keywordString = keywords.join(' ').toLowerCase();

  // +10% boosts
  if (/ergonomic|premium design|sturdy build/.test(keywordString)) {
    totalBoost += 0.10;
  }

  // +5% boosts
  if (/foldable|portable|steel|metal|waterproof|shockproof/.test(keywordString)) {
    totalBoost += 0.05;
  }

  // -10% negative
  if (/scratch|faded|worn/.test(keywordString)) {
    totalBoost -= 0.10;
  }

  // -20% to -40% severe damage
  if (/damaged|broken|torn|malfunctioning/.test(keywordString)) {
    if (/malfunctioning|broken/.test(keywordString)) {
      totalBoost -= 0.40;
    } else {
      totalBoost -= 0.20;
    }
  }

  // Clamp between -0.40 and +0.30
  return Math.max(-0.40, Math.min(0.30, totalBoost));
}

function calculateEstimatedValue(
  category: string,
  conditionScore: number, // Changed from condition: number - use calculated conditionScore
  ageValue: number,
  ageUnit: 'years' | 'months',
  brandTier: string | undefined,
  keywords: string[],
  attributes: Record<string, any>,
  brandName?: string
): number {
  // Normalize category to lowercase
  const normalizedCategory = category.toLowerCase();
  const categoryData = PRICE_TABLE[normalizedCategory as keyof typeof PRICE_TABLE];
  
  if (!categoryData) {
    // Fallback for unknown categories
    return 20;
  }

  // Check for subcategory
  let min = categoryData.min;
  let max = categoryData.max;

  const subcategory = attributes?.subcategory?.toLowerCase() || attributes?.type?.toLowerCase();
  if (subcategory && categoryData.subcategories[subcategory as keyof typeof categoryData.subcategories]) {
    const subcatData = categoryData.subcategories[subcategory as keyof typeof categoryData.subcategories];
    min = (subcatData as { min: number; max: number }).min;
    max = (subcatData as { min: number; max: number }).max;
  }

  // 1. Base value with condition multiplier (from calculated conditionScore)
  const conditionMultiplier = getConditionMultiplierFromScore(conditionScore);
  const base = min + (max - min) * conditionMultiplier;

  // 2. Apply age factor (more significant impact for realistic depreciation)
  // Age depreciation should be stronger for used items
  const ageFactor = getAgeFactor(ageValue || 0, ageUnit || 'years');
  // Apply age depreciation more strongly (60% of age impact, not 50%)
  const adjustedAgeFactor = 1 - (1 - ageFactor) * 0.6;
  const valueAfterAge = base * adjustedAgeFactor;

  // 3. Apply brand boost (with automatic premium brand recognition, category-aware)
  const brandBoost = getBrandBoost(brandTier, brandName, normalizedCategory);
  const valueAfterBrand = valueAfterAge * (1 + brandBoost);

  // 4. Apply attribute boosts
  const attributesBoost = calculateAttributeBoost(keywords);
  const valueAfterAttributes = valueAfterBrand * (1 + attributesBoost);

  // 5. Round final value
  let finalValue = Math.round(valueAfterAttributes);

  // 6. Clamp final value (more conservative - prevent excessive values)
  // Use subcategory max if available, otherwise category max
  const maxForClamp = max || categoryData.max;
  const minForClamp = min || categoryData.min;
  const absoluteMin = minForClamp * 0.4; // Allow lower minimum
  const absoluteMax = maxForClamp * 1.15; // Reduced from 1.3 - more conservative max
  finalValue = Math.max(absoluteMin, Math.min(absoluteMax, finalValue));

  return finalValue;
}

// Retry helper function with exponential backoff and timeout handling
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add timeout to fetch (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // If rate limited (429), wait before retry
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, attempt);
        
        if (attempt < maxRetries - 1) {
          console.log(`Rate limited (429). Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // If server error (5xx), retry with exponential backoff
      if (response.status >= 500 && response.status < 600 && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Server error ${response.status}. Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error: any) {
      lastError = error;
      
      // Network errors or timeouts - retry with exponential backoff
      if ((error.name === 'AbortError' || error.message?.includes('network') || error.message?.includes('fetch')) 
          && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Network/timeout error. Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error;
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

export async function POST(request: NextRequest) {
  let description = '';
  try {
    const requestData = await request.json();
    const { imageUrl, itemName, description: desc, condition, ageValue, ageUnit, brand } = requestData;
    description = desc || '';

    // Validate inputs
    if (!imageUrl || !itemName) {
      return NextResponse.json(
        { error: 'Missing required fields: imageUrl or itemName' },
        { status: 400 }
      );
    }

    console.log('Analyzing item:', { 
      itemName, 
      description, 
      condition, 
      ageValue, 
      ageUnit, 
      brand,
      imageUrl: imageUrl?.substring(0, 50) + '...' 
    });

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('Missing OPENROUTER_API_KEY');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const openRouterResponse = await fetchWithRetry(
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
Description: "${desc || 'No description provided'}"
${condition ? `User-reported Condition: ${condition}/5` : ''}
${ageValue && ageUnit ? `Age: ${ageValue} ${ageUnit}` : ''}
${brand ? `Brand: ${brand}` : ''}

IMPORTANT: DO NOT calculate or estimate price. Only extract information.

Required JSON format:
{
  "category": "<choose one: ${CATEGORIES.join(', ')}>",
  "subcategory": "<optional: specific subcategory from the category, e.g., 'headphones', 'chair', 'textbook', 'microwave'>",
  "brandTier": "<one of: 'premium', 'mid', 'low', or 'unknown'>",
  "keywords": ["<keyword1>", "<keyword2>", "<keyword3>", "extract keywords like: ergonomic, portable, foldable, steel, metal, waterproof, shockproof, scratch, faded, worn, damaged, broken, torn, malfunctioning, etc."],
  "attributes": {
    "color": "<value if visible>",
    "subcategory": "<same as subcategory field, for redundancy>",
    "other relevant attributes": "<value>"
  }
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
      },
      3, // max 3 retries
      2000 // start with 2 second delay
    );

    console.log('OpenRouter status:', openRouterResponse.status);

    if (!openRouterResponse.ok) {
      let errorText: string;
      let errorJson: any = null;
      
      try {
        errorJson = await openRouterResponse.json();
        errorText = JSON.stringify(errorJson);
        console.error('OpenRouter error JSON:', errorJson);
        
        // Extract specific error message if available
        if (errorJson.error?.message) {
          errorText = errorJson.error.message;
        } else if (errorJson.message) {
          errorText = errorJson.message;
        }
      } catch {
        try {
          errorText = await openRouterResponse.text();
          console.error('OpenRouter error text:', errorText);
        } catch {
          errorText = `HTTP ${openRouterResponse.status}`;
        }
      }
      
      // Better error handling based on status code
      if (openRouterResponse.status === 429) {
        throw new Error(`Rate limit exceeded: ${errorText}`);
      } else if (openRouterResponse.status === 503 || openRouterResponse.status === 502) {
        throw new Error(`Service unavailable: ${errorText}`);
      } else if (openRouterResponse.status === 401) {
        throw new Error(`Authentication failed: ${errorText}`);
      } else {
        throw new Error(`OpenRouter API failed (${openRouterResponse.status}): ${errorText}`);
      }
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
    if (!analysisData.category) {
      console.error('Missing required fields in analysis:', analysisData);
      throw new Error('Analysis missing required fields');
    }

    // Calculate conditionScore using data-driven approach
    // Basis: User condition (1-5) + Age adjustment + Keyword-based adjustment
    // LLM never decides conditionScore - it's purely calculated from data
    const conditionScore = calculateConditionScore(
      condition || 3, // Default to 3 if not provided
      ageValue || 0,
      ageUnit || 'years',
      analysisData.keywords || []
    );

    // Calculate estimated value using new logic
    const estimatedValue = calculateEstimatedValue(
      analysisData.category,
      conditionScore, // Use calculated conditionScore instead of raw condition
      ageValue || 0,
      ageUnit || 'years',
      analysisData.brandTier,
      analysisData.keywords || [],
      {
        ...analysisData.attributes || {},
        subcategory: analysisData.subcategory || analysisData.attributes?.subcategory,
      },
      brand || analysisData.attributes?.brand // Pass brand name for premium recognition
    );

    console.log('Calculated value:', estimatedValue);
    console.log('Calculated conditionScore:', conditionScore);
    console.log('Calculation inputs:', {
      category: analysisData.category,
      userCondition: condition || 3,
      ageValue: ageValue || 0,
      ageUnit: ageUnit || 'years',
      brandTier: analysisData.brandTier,
      subcategory: analysisData.subcategory,
      keywords: analysisData.keywords || [],
      finalConditionScore: conditionScore,
    });

    return NextResponse.json({
      category: analysisData.category,
      conditionScore,
      estimatedValue,
      keywords: analysisData.keywords || [],
      attributes: analysisData.attributes || {},
    });

  } catch (error) {
    console.error('Error in analyze-item:', error);
    
    // Determine user-friendly error message based on error type
    let userMessage = 'Unable to analyze your item. Please try again.';
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check error message patterns and provide context-specific feedback
    if (errorMessage.includes('No content in AI response') || 
        errorMessage.includes('AI result structure') ||
        errorMessage.includes('choices') && errorMessage.includes('undefined')) {
      userMessage = 'Unable to analyze your item. Please provide a more detailed description (at least 10 characters) to help us identify it better.';
    } else if (errorMessage.includes('Invalid JSON response') || 
               errorMessage.includes('Failed to parse JSON') ||
               errorMessage.includes('JSON')) {
      userMessage = 'Couldn\'t process the item details. Please add more information in the description field (features, color, condition, brand, etc.).';
    } else if (errorMessage.includes('Missing required fields') || 
               errorMessage.includes('Analysis missing required fields') ||
               errorMessage.includes('category')) {
      userMessage = 'Unable to identify the item category. Please provide a clearer description of what the item is (e.g., "laptop", "chair", "textbook").';
    } else if (errorMessage.includes('OpenRouter API failed') || 
               errorMessage.includes('API key not configured') ||
               errorMessage.includes('429') || 
               errorMessage.includes('Rate limit exceeded') ||
               errorMessage.includes('rate limit')) {
      userMessage = 'Analysis service is temporarily busy due to high demand. Please wait 10-20 seconds and try again.';
    } else if (errorMessage.includes('Service unavailable') ||
               errorMessage.includes('503') ||
               errorMessage.includes('502')) {
      userMessage = 'Analysis service is temporarily unavailable. Please try again in a moment.';
    } else if (errorMessage.includes('AbortError') ||
               errorMessage.includes('timeout') ||
               errorMessage.includes('Timeout')) {
      userMessage = 'Request timed out. The analysis is taking too long. Please try again with a clearer image and description.';
    } else if (errorMessage.includes('Authentication failed') ||
               errorMessage.includes('401')) {
      userMessage = 'Analysis service authentication error. Please contact support if this persists.';
    } else if (errorMessage.includes('imageUrl') || 
               errorMessage.includes('image') ||
               errorMessage.includes('Image')) {
      userMessage = 'Image upload failed. Please try uploading a clearer picture (JPG or PNG format).';
    } else if (!description || 
               description.trim().length < 10) {
      userMessage = 'Please provide a more detailed description (at least 10 characters) to help us analyze your item accurately. Include details like features, color, size, condition, etc.';
    } else if (errorMessage.includes('network') || 
               errorMessage.includes('fetch') ||
               errorMessage.includes('connection')) {
      userMessage = 'Network error. Please check your internet connection and try again.';
    }
    
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}