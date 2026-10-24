/**
 * =========================================================================
 * AAROGYAM SAKHI CREATIVE PROMPT & SOCIAL MEDIA STUDIO v2.0
 * Features:
 * 1. 40+ Netsurf Product Marketing & Diagnosis Prompts
 * 2. Viral Social Media Prompts: Cinematic, GM, GN, Motivation, Shayari, Couple Pose
 * 3. Dynamic Reference Image Advice (User Face + Farm + Real Product Photo)
 * =========================================================================
 */

'use strict';

(function(window) {
  const SakhiPrompts = {};

  // 1. 40+ NETSURF PRODUCTS PROMPTS REGISTRY
  SakhiPrompts.products = [
    // 🌾 BIOFIT AGRI RANGE (1-10)
    { id: "stimrich", name: "बायोफिट स्टिमरिच (Stimrich)", cat: "agri", prompt: "A hyper-realistic cinematic poster of a proud Indian farmer standing in a lush green wheat field with heavy tillering, holding a glowing bottle of Biofit Stimrich, golden morning sunlight, 8k resolution, photorealistic." },
    { id: "bio99", name: "बायोफिट बायो-99 (Bio-99)", cat: "agri", prompt: "Macro close-up shot of glistening morning dew water droplets sticking perfectly on a bright green plant leaf, 100% surface coverage demonstration, crystal clear, professional agricultural commercial style, 8k." },
    { id: "shet", name: "बायोफिट शेत (SHET Soil Health)", cat: "agri", prompt: "Rich, fertile dark brown soil teeming with beneficial earthworms and active micro-organisms, healthy white crop roots spreading deep into moist earth, bright natural lighting, hyper-realistic." },
    { id: "wrapup", name: "बायोफिट रैप-अप (Wrap-up)", cat: "agri", prompt: "A protective translucent crystal-clear shield surrounding fresh green vegetable leaves, repelling fungal spores, blight and harsh weather, majestic agricultural science illustration, 8k." },
    { id: "intact", name: "बायोफिट इनटैक्ट (Intact)", cat: "agri", prompt: "Natural herbal pest repeller in action against sucking pests (aphids and whiteflies), clean pesticide-free green farm, sparkling clean leaves, high-end agricultural commercial." },
    { id: "macfree", name: "बायोफिट मैकफ्री (Macfree)", cat: "agri", prompt: "Lush green cotton and soybean field completely free from leaf curl virus and mites, healthy flowering clusters, cinematic agricultural photography." },
    { id: "n_fertilizer", name: "बायोफिट बायो-एन (Bio-N)", cat: "agri", prompt: "Biological nitrogen-fixing bacteria nodules glowing gently on pulse roots, deep green foliage, 40% urea saving visual concept." },
    { id: "p_fertilizer", name: "बायोफिट बायो-पी (Bio-P)", cat: "agri", prompt: "Phosphate-solubilizing bio-fertilizer concept, robust root elongation and vigorous seedling vigor, crisp studio farm lighting." },
    { id: "k_fertilizer", name: "बायोफिट बायो-के (Bio-K)", cat: "agri", prompt: "Bumper grain filling and heavy fruit size with natural gloss and high sugar content, rich golden harvest setting, 8k." },
    { id: "culture", name: "बायोफिट कल्चर (Culture)", cat: "agri", prompt: "Rapid decomposition of farm waste into rich black organic compost, earthworm activity, sustainable eco-friendly farming concept." },

    // 🐄 BIOFIT CATTLE & PET CARE (11-15)
    { id: "cfc_plus", name: "बायोफिट सीएफसी प्लस (CFC Plus)", cat: "dairy", prompt: "A high-yielding, glossy-coated healthy Indian cow and buffalo standing proudly in a clean modern dairy shed with full milk pails, glowing vitality, photorealistic." },
    { id: "cfr", name: "बायोफिट सीएफआर (CFR)", cat: "dairy", prompt: "High-grade cattle feed supplement enhancing fat and SNF percentage in fresh milk, lush green fodder in background, award-winning dairy farming portrait." },
    { id: "pet_lotion", name: "बायोफिट पेट लोशन (Pet Lotion)", cat: "pet", prompt: "A cheerful, healthy pet dog with a glossy tick-free fur coat playing happily on a sunny green lawn, premium veterinary hygiene style." },
    { id: "aqua_culture", name: "बायोफिट एक्वाकल्चर (Aqua Culture)", cat: "aquaculture", prompt: "Clean freshwater pond with leaping energetic Rohu and Katla fish, clear oxygenated water, prosperous fish farming." },
    { id: "poultry_feed", name: "बायोफिट पोल्ट्री ग्रोथ (Poultry Feed)", cat: "poultry", prompt: "Clean bio-secure modern poultry farm with active, healthy broiler and desi chickens, vibrant feathers, optimal weight gain." },

    // 🩺 NATURAMORE HEALTH RANGE (16-30)
    { id: "naturamore_vanilla", name: "नेचुरामोर प्लस (वैनिला)", cat: "health", prompt: "Energetic Indian man in his 40s jogging enthusiastically on a scenic morning path, holding a healthy smoothie shaker, bursting with vitality and strength, 8k." },
    { id: "naturamore_women", name: "नेचुरामोर फॉर विमेन (मसाला मिल्क)", cat: "health", prompt: "A radiant, confident Indian woman balancing career and family with glowing skin, bright eyes and boundless energy, warm morning kitchen sunlight." },
    { id: "naturamore_kids", name: "नेचुरामोर फॉर किड्स (चॉकलेट)", cat: "health", prompt: "Smiling intelligent Indian school child holding a trophy, strong memory and active immunity concept, playful and vibrant." },
    { id: "joint_care", name: "नेचुरामोर जॉइंट केयर (Joint Care)", cat: "health", prompt: "Active, smiling elderly Indian couple walking comfortably in a lush green park without knee or joint pain, freedom of movement, 8k." },
    { id: "easy_detox", name: "नेचुरामोर ईजी डिटॉक्स (Easy Detox)", cat: "health", prompt: "Refreshing digestive wellness concept, soothing green herbal tea leaves, smooth intestinal comfort and lightness, serene aesthetic." },
    { id: "de_stress", name: "नेचुरामोर डी-स्ट्रेस (De-Stress)", cat: "health", prompt: "Peaceful calm meditation atmosphere, glowing soft candlelight, deep restful sleep and mental tranquility, zen minimalist style." },
    { id: "immune_plus", name: "नेचुरामोर इम्यून प्लस (Immune Plus)", cat: "health", prompt: "A glowing protective bio-shield repelling seasonal viral germs, a smiling resilient Indian family enjoying the rain safely." },
    { id: "eye_care", name: "नेचुरामोर आई केयर (Eye Care)", cat: "health", prompt: "Crystal-clear sharp vision, glowing healthy eyes, blue light protection concept from mobile and computer screens, modern wellness." },
    { id: "lifestyle_plus", name: "नेचुरामोर लाइफस्टाइल प्लस (Lifestyle Plus)", cat: "health", prompt: "Balanced blood sugar metabolism, healthy glycemic meter reading with a fresh green apple and whole grains, disciplined fitness." },
    { id: "women_wellness", name: "नेचुरामोर विमेन वेलनेस (Women Wellness)", cat: "health", prompt: "Harmonious hormonal balance, graceful Indian woman doing yoga outdoors, peaceful vitality and holistic care." },
    { id: "blood_purifier", name: "नेचुरामोर ब्लड प्यूरिफायर (Blood Purifier)", cat: "health", prompt: "Naturally clear blemish-free glowing facial skin, herbal neem and manjistha purification essence, pure morning freshness." },
    { id: "liver_support", name: "नेचुरामोर लिवर सपोर्ट (Liver Support)", cat: "health", prompt: "Healthy functioning human liver concept, herbal detoxification and efficient digestion, bright clinical wellness poster." },
    { id: "heart_support", name: "नेचुरामोर हार्ट सपोर्ट (Heart Support)", cat: "health", prompt: "Strong rhythmic healthy heart with clear arteries, brisk walking on treadmill, active cardiovascular longevity." },
    { id: "kidney_care", name: "नेचुरामोर किडनी केयर (Kidney Care)", cat: "health", prompt: "Natural fluid balance and crystal-clear filtration, pure mountain spring water pouring into crystal glass." },
    { id: "respiratory_care", name: "नेचुरामोर रेस्पिरेटरी केयर (Respiratory Care)", cat: "health", prompt: "Deep, effortless breathing of fresh mountain pine air, clear bronchial lungs, invigorating wellness." },

    // ✨ HERBS & MORE PERSONAL CARE & BEAUTY (31-40+)
    { id: "vitamin_day_cream", name: "विटामिन थेरेपी डे क्रीम (Day Cream)", cat: "beauty", prompt: "Radiant Indian woman with flawless glowing face, subtle morning sunlight highlighting dewy smooth skin, SPF protection concept, 8k luxury cosmetic." },
    { id: "vitamin_night_cream", name: "विटामिन थेरेपी नाइट क्रीम (Night Cream)", cat: "beauty", prompt: "Soothing nighttime cellular repair concept, glowing lavender and almond oil essence, silky smooth rejuvenation." },
    { id: "neem_face_wash", name: "नीम व हल्दी एंटी-एक्ने फेसवॉश", cat: "beauty", prompt: "Splash of pure fresh water with organic green neem leaves and turmeric root, blemish-free crystal clear skin." },
    { id: "herbal_hair_oil", name: "हर्बल 7-इन-1 हेयर ऑयल", cat: "beauty", prompt: "Long, thick, lustrous black hair flowing gracefully with silky shine, bhringraj and amla botanical essence, cinematic studio lighting." },
    { id: "dandruff_shampoo", name: "एंटी-डैंड्रफ स्कैल्प शैम्पू", cat: "beauty", prompt: "Clean, flake-free, deeply refreshed scalp with tea tree oil coolness, vibrant glossy hair vitality." },
    { id: "dental_paste", name: "हर्ब्स एंड मोर आयुर्वेदिक टूथपेस्ट", cat: "personal", prompt: "100% fluoride-free herbal dental sparkle, healthy pink gums and sparkling white teeth with fresh clove and mint aroma." },
    { id: "body_butter", name: "कोकोआ व शिया बॉडी बटर", cat: "personal", prompt: "Rich creamy golden butter texture melting into dry skin, 24-hour deep hydration, luxurious warm spa ambience." },
    { id: "shaving_cream", name: "हर्बल मॉइस्चराइजिंग शेव क्रीम", cat: "mens", prompt: "Crisp suave Indian gentleman with a sharp groomed beard and smooth refreshed skin, premium barber styling." },
    { id: "face_scrub", name: "एप्रिकॉट व वॉलनट फेस स्क्रब", cat: "beauty", prompt: "Exfoliating golden walnut micro-granules lifting dead cells, revealing silky soft glowing new skin." },
    { id: "sunscreen_lotion", name: "हर्बल यूवी सनस्क्रीन लोशन (SPF 30)", cat: "beauty", prompt: "Protective sheer barrier against harsh ultraviolet rays on sunny beach or field, non-greasy matte perfection." }
  ];

  // 2. VIRAL SOCIAL MEDIA PROMPTS
  SakhiPrompts.social = {
    gm_motivation: {
      title: "🌅 सुप्रभात (Good Morning) किसान प्रेरणा",
      prompt: "Breathtaking 8k cinematic morning shot of an Indian farmer looking toward the golden horizon at sunrise, holding a handful of rich soil with lush crops stretching to infinity, inspiring morning aura."
    },
    gn_peace: {
      title: "🌙 शुभ रात्रि (Good Night) शांति व आशीष",
      prompt: "Serene night view of a peaceful Indian village home under a sparkling starry sky and full moon, gentle warm lantern light, calm and restful ambience."
    },
    cinematic_field: {
      title: "🎬 सिनेमाई भारतीय किसान (Cinematic Farmer)",
      prompt: "Cinematic portrait of a proud, handsome Indian farmer wearing a traditional turban and crisp kurta, standing triumphantly in his flourishing crop field, dramatic rim lighting, 8k movie still."
    },
    couple_pose: {
      title: "👫 युगल किसान पोज़ (Farmer Couple in Farm)",
      prompt: "A lovely, smiling Indian farmer couple standing together affectionately in their flourishing green tomato farm, holding a basket of fresh red produce, warm sunset lighting, photorealistic."
    },
    corporate_leader: {
      title: "💼 नेट्सर्फ कॉर्पोरेट लीडर व स्टेज रिकग्निशन",
      prompt: "A polished and confident Indian direct selling leader in an elegant formal navy-blue suit, standing on a grand convention auditorium stage receiving applause and crystal trophy, royal blue and gold lighting."
    },
    royal_tractor: {
      title: "🚜 रॉयल ट्रैक्टर व एग्रो-एंटरप्रेन्योर",
      prompt: "Modern energetic young Indian agriculture entrepreneur sitting proudly on a gleaming powerful green tractor in a sprawling field, crisp morning breeze, cinematic agricultural prowess."
    },
    shayari: {
      title: "📜 कृषि व जीवन शायरी पोस्टर",
      prompt: "Artistic rustic background of traditional terracotta pots, green wheat stalks and vintage wooden plow, soft golden sun rays, ample negative space for inspirational poetry text."
    }
  };

  /**
   * Generates dynamic reference advice tailored to user's prompt request
   * Ensures User Face / Farm Photo AND Product Bottle Photo are requested!
   */
  SakhiPrompts.generatePromptAdvice = function(productOrCategory) {
    let advice = '💡 **सखी AI प्रो-टिप (100% असली पोस्टर बनाने हेतु):**\n';
    advice += 'जब आप इस प्रॉम्प्ट को AI टूल (Midjourney, Bing Image Creator या ChatGPT) में इस्तेमाल करें:\n';
    advice += '1. 📸 **अपनी या अपने खेत की असली फोटो भी साथ में रेफरेंस (Image-to-Image) के तौर पर अपलोड करें**, ताकि AI आपकी असली शक्ल और खेत को मिलाकर बिल्कुल हूबहू असली पोस्टर बना सके!\n';
    
    if (productOrCategory) {
      advice += `2. 🧪 साथ में **${productOrCategory} की असली बोतल/डिब्बे की फोटो** भी रेफरेंस इमेज के तौर पर दें, ताकि पोस्टर में असली उत्पाद का लेबल व ब्रांड 100% साफ और स्पष्ट दिखाई दे!`;
    } else {
      advice += '2. 🧪 यदि पोस्टर में कोई उत्पाद (जैसे स्टिमरिच, बायो-99 या नेचुरामोर) शामिल है, तो उसकी असली फोटो भी साथ में अटैच करें!';
    }
    return advice;
  };

  window.SakhiPrompts = SakhiPrompts;
  console.log('[SakhiPrompts] Creative Prompts Studio v2.0 initialized with 40+ products and dynamic reference advice.');
})(window);
