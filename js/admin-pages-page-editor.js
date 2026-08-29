/**
 * ====================================================================
 * AAROGYAM INDIA - UNIVERSAL SITE PAGES EDITOR & BUILDER (ADMIN)
 * Version: 27.0 (Ultimate PRO Edition)
 * 
 * Features:
 * - Drag & Drop / Up-Down Section Reordering for all 14+ site sections
 * - Multi-Slide Hero Banner Carousel Manager with image upload & CTAs
 * - Breaking News Ticker Manager with live marquee speed
 * - Dynamic KPI & Feature Cards Customizer (Icons, Titles, Images)
 * - YouTube Video Guides & Walkthrough Showcase Manager
 * - Interspersed Book Marketing Cards Manager (Live Sales Counters & Share)
 * - Farmer Testimonials & Reviews Customizer
 * - FAQ Accordion Manager
 * - 24x7 WhatsApp AI Doctor Support & Universal Social Share System
 * - 1-Click LocalStorage Sync & JSON Export (site-pages-config.json)
 * ====================================================================
 */

export async function initPageEditor() {
  const container = document.getElementById('page-content');
  if (!container) return;

  const defaultPages = [
    {
      id: 'page_home',
      slug: 'index',
      name: '🏠 मुख्य पृष्ठ (Home Page)',
      url: '/index.html',
      category: 'Core',
      status: 'active',
      theme_primary: '#15803d',
      theme_dark: '#0e5227',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '📢 10,000+ किसानों का पहला भरोसेमंद मंच | 24×7 WhatsApp AI डॉक्टर सहायता उपलब्ध! ✦ प्रमाणित ई-बुक्स व मंडी भाव',
      hero_slides: [
        {
          image: '/images/banners/kharif-master-guide-2026-hero-banner.webp',
          tag: '🌾 खरीफ 2026 स्पेशल एडिशन',
          title: 'Aarogyam India - सम्पूर्ण किसान व डिजिटल ज्ञान मंच',
          subtitle: 'वैज्ञानिक खेती, फसल डॉक्टर, मंडी भाव, और 100% प्रमाणित डिजिटल ई-बुक्स',
          cta_text: '📚 डिजिटल स्टोर देखें',
          cta_link: '/ebooks/ebook.html',
          cta_secondary_text: '🌱 कृषि हब',
          cta_secondary_link: '/ebooks/agriculture.html'
        },
        {
          image: '/images/banners/farmer-community-banner.jpeg',
          tag: '👑 VIP Annual Pass',
          title: 'Aarogyam Pro VIP सदस्यता - 1 वर्ष का ऑल-एक्सेस',
          subtitle: 'सभी ई-बुक्स, लाइव वेबिनार्स और 24×7 WhatsApp AI डॉक्टर सहायता बिल्कुल मुफ़्त!',
          cta_text: '👑 VIP मेम्बर बनें (₹99)',
          cta_link: '/subscription.html',
          cta_secondary_text: '🛒 कार्ट देखें',
          cta_secondary_link: '/ebooks/cart.html'
        }
      ],
      sections_order: [
        'sec_ticker',
        'sec_hero_slider',
        'sec_kpi_badges',
        'sec_category_pills',
        'sec_shelves_bestseller',
        'sec_interspersed_marketing',
        'sec_shelves_new',
        'sec_combo_promo',
        'sec_videos',
        'sec_reviews',
        'sec_trust_guarantee',
        'sec_faqs',
        'sec_help_support'
      ],
      hidden_sections: [],
      kpi_cards: [
        { icon: 'fa-book-open', title: '120+ रंगीन पेज', desc: 'उच्च गुणवत्ता सचित्र मार्गदर्शिका' },
        { icon: 'fa-bolt', title: 'इंस्टेंट PDF डाउनलोड', desc: 'भुगतान के तुरंत बाद आजीवन एक्सेस' },
        { icon: 'fa-robot', title: '24×7 WhatsApp AI डॉक्टर', desc: 'किताब पढ़ते समय तुरंत सवाल पूछें' },
        { icon: 'fa-shield-halved', title: '100% सुरक्षित भुगतान', desc: 'UPI, PhonePe, GPay व कार्ड्स' }
      ],
      videos: [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '📖 खरीफ मास्टर गाइड - अंदर के पेज व डेमो', desc: '300+ वास्तविक फोटो और स्प्रे साइंस चार्ट का लाइव प्रीव्यू।', ratio: '16:9' },
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '📲 24×7 WhatsApp AI डॉक्टर सहायता कैसे काम करती है?', desc: 'किताब पढ़ते समय सवाल पूछने और तुरंत समाधान पाने का तरीका।', ratio: '16:9' }
      ],
      marketing_cards: [
        { book_id: 'BK001', tag: '🔥 सर्वाधिक लोकप्रिय', headline: 'खरीफ फसल मास्टर गाइड 2026', desc: 'सोयाबीन, मक्का, धान व कपास की वैज्ञानिक खेती और रोग समाधान।', sales_counter: '1,420+ किसानों ने खरीदा' },
        { book_id: 'BK002', tag: '🌱 किसान का पॉकेट डॉक्टर', headline: 'खेती का डॉक्टर (फसल का डॉक्टर)', desc: 'रोग, कीट, फंगल और पोषक तत्वों की कमी की पहचान व सटीक इलाज।', sales_counter: '980+ किसानों ने खरीदा' }
      ],
      reviews: [
        { name: 'रामेश्वर पटेल', location: 'उज्जैन, मध्य प्रदेश', rating: 5, comment: 'खरीफ मास्टर गाइड बहुत ही उपयोगी है। स्प्रे साइंस चार्ट से मेरी फसल बच गई।' },
        { name: 'सुरेश कुमार यादव', location: 'करनाल, हरियाणा', rating: 5, comment: 'WhatsApp AI डॉक्टर सहायता से जब भी सवाल पूछा तुरंत उत्तर मिला। बहुत बढ़िया मंच!' }
      ],
      faqs: [
        { q: 'ई-बुक खरीदने के बाद कैसे मिलेगी?', a: 'भुगतान होते ही आपको तुरंत PDF डाउनलोड लिंक मिलेगा और पुस्तक आपकी "मेरी लाइब्रेरी" में आजीवन सुरक्षित रहेगी।' },
        { q: 'क्या मैं मोबाइल पर पढ़ सकता हूँ?', a: 'हाँ, सभी पुस्तकें मोबाइल और टैबलेट के लिए पूरी तरह ऑप्टिमाइज़्ड हैं।' }
      ],
      whatsapp_support: {
        number: '919876543210',
        prompt: 'नमस्ते आरोग्यम इंडिया, मुझे वेबसाइट व ई-बुक्स के बारे में जानकारी चाहिए।'
      }
    },
    {
      id: 'page_agriculture',
      slug: 'agriculture',
      name: '🌱 कृषि मार्गदर्शिका हब (Agriculture Hub)',
      url: '/ebooks/agriculture.html',
      category: 'eBooks',
      status: 'active',
      theme_primary: '#15803d',
      theme_dark: '#0e5227',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🌾 खरीफ व रबी स्पेशल फसल गाइड्स उपलब्ध | ₹198 में 2-बुक कॉम्बो बंडल व WhatsApp AI डॉक्टर सहायता!',
      hero_slides: [
        {
          image: '/images/books/kharif-master-guide-2026-cover.webp',
          tag: '🌾 BESTSELLER AGRICULTURE EBOOK',
          title: 'खरीफ फसल मास्टर गाइड 2026',
          subtitle: 'धान, सोयाबीन व मक्का की सम्पूर्ण प्रैक्टिकल गाइड। बीज उपचार से लेकर कटाई तक सम्पूर्ण समाधान।',
          cta_text: '⚡ अभी ऑर्डर करें (₹99)',
          cta_link: '/ebooks/kharif-master-guide-2026.html',
          cta_secondary_text: '← सभी पुस्तकें',
          cta_secondary_link: '/ebooks/ebook.html'
        },
        {
          image: '/images/books/fasal-ka-doctor-cover.webp',
          tag: '🩺 सर्वाधिक बिकने वाली ई-बुक (TOP BESTSELLER)',
          title: 'खेती का डॉक्टर (फसल का डॉक्टर)',
          subtitle: 'रोग, कीट, वायरल, फंगल और पोषक तत्वों की कमी की पहचान सीखें। अब तक की सर्वाधिक बिकने वाली ई-बुक!',
          cta_text: '⚡ अभी ऑर्डर करें (₹99)',
          cta_link: '/ebooks/kheti-dr.html',
          cta_secondary_text: '← सभी पुस्तकें',
          cta_secondary_link: '/ebooks/ebook.html'
        }
      ],
      sections_order: [
        'sec_ticker',
        'sec_hero_slider',
        'sec_combo_promo',
        'sec_kpi_badges',
        'sec_shelves_bestseller',
        'sec_interspersed_marketing',
        'sec_videos',
        'sec_reviews',
        'sec_trust_guarantee',
        'sec_faqs',
        'sec_help_support'
      ],
      hidden_sections: [],
      kpi_cards: [
        { icon: 'fa-seedling', title: 'बीज उपचार व किस्में', desc: 'टॉप उन्नत वैरायटी का चयन' },
        { icon: 'fa-spray-can', title: 'स्प्रे साइंस चार्ट', desc: 'सटीक रासायनिक व जैविक स्प्रे' },
        { icon: 'fa-bug', title: 'कीट व रोग नियंत्रण', desc: 'लक्षण व प्रमाणित रोकथाम' },
        { icon: 'fa-comments', title: '24×7 WhatsApp AI सहायता', desc: 'कृषि विशेषज्ञों का डिजिटल सहयोग' }
      ],
      videos: [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '🎥 खरीफ फसलों में रोग व कीट प्रबंधन कैसे करें?', desc: 'खेत पर विशेषज्ञों द्वारा तैयार विस्तृत वीडियो गाइड।', ratio: '16:9' }
      ],
      marketing_cards: [
        { book_id: 'BK001', tag: '🌾 खरीफ स्पेशल', headline: 'खरीफ फसल मास्टर गाइड 2026', desc: 'सोयाबीन, मक्का व धान के उत्पादन को दोगुना करने के वैज्ञानिक तरीके।', sales_counter: '1,420+ किसानों ने खरीदा' },
        { book_id: 'BK002', tag: '🌱 फसल डॉक्टर', headline: 'खेती का डॉक्टर', desc: 'सभी प्रकार के रोगों और कीटों का 1-क्लिक समाधान।', sales_counter: '980+ किसानों ने खरीदा' }
      ],
      reviews: [
        { name: 'दिनेश जाट', location: 'इंदौर, मध्य प्रदेश', rating: 5, comment: 'सोयाबीन में खरपतवार नियंत्रण का बहुत ही सही फॉर्मूला इस किताब में मिला।' },
        { name: 'प्रदीप वर्मा', location: 'वाराणसी, उत्तर प्रदेश', rating: 5, comment: 'धान की फसल के लिए धान मास्टर गाइड और खेती डॉक्टर दोनों लाजवाब हैं।' }
      ],
      faqs: [
        { q: 'क्या कॉम्बो में दोनों पुस्तकें तुरंत मिलेंगी?', a: 'हाँ, पेमेंट के बाद दोनों PDF डाउनलोड लिंक्स तुरंत स्क्रीन पर दिखेंगे।' }
      ],
      whatsapp_support: {
        number: '919876543210',
        prompt: 'नमस्ते, मुझे कृषि पुस्तकों और कॉम्बो ऑफर के बारे में जानकारी चाहिए।'
      }
    },
    {
      id: 'page_ebook_store',
      slug: 'ebook',
      name: '📚 ई-बुक स्टोर (eBook Store Marketplace)',
      url: '/ebooks/ebook.html',
      category: 'eBooks',
      status: 'active',
      theme_primary: '#14532d',
      theme_dark: '#052e16',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🚨 स्पेशल ऑफर: ₹1999 की VIP Pro मेम्बरशिप व AI डॉक्टर सहायता बिल्कुल FREE! ✦ 10,000+ किसानों का विश्वास',
      hero_slides: [
        {
          image: '/images/books/kharif-master-guide-2026-cover.webp',
          tag: '🌾 BESTSELLER AGRICULTURE EBOOK',
          title: 'खरीफ फसल मास्टर गाइड 2026',
          subtitle: 'धान, सोयाबीन, मक्का की सम्पूर्ण प्रैक्टिकल गाइड — 300+ रंगीन फोटो व स्प्रे साइंस चार्ट!',
          cta_text: '⚡ अभी आर्डर करें - मात्र ₹99',
          cta_link: '/ebooks/kharif-master-guide-2026.html',
          cta_secondary_text: '🛒 कार्ट में जोड़ें',
          cta_secondary_link: '/ebooks/cart.html'
        },
        {
          image: '/images/books/fasal-ka-doctor-cover.webp',
          tag: '🩺 सर्वाधिक बिकने वाली ई-बुक (TOP BESTSELLER)',
          title: 'खेती का डॉक्टर (फसल का डॉक्टर)',
          subtitle: 'किसान का Pocket Doctor 🌾 रोग, कीट, वायरल, फंगल व पोषण कमी की पहचान व तुरंत स्प्रे फॉर्मूला!',
          cta_text: '⚡ अभी आर्डर करें - मात्र ₹99',
          cta_link: '/ebooks/kheti-dr.html',
          cta_secondary_text: '🛒 कार्ट में जोड़ें',
          cta_secondary_link: '/ebooks/cart.html'
        }
      ],
      sections_order: [
        'sec_ticker',
        'sec_hero_slider',
        'sec_category_pills',
        'sec_shelves_bestseller',
        'sec_interspersed_marketing',
        'sec_shelves_new',
        'sec_shelves_coming_soon',
        'sec_videos',
        'sec_trust_guarantee',
        'sec_faqs',
        'sec_help_support'
      ],
      hidden_sections: [],
      kpi_cards: [
        { icon: 'fa-bolt', title: 'Instant PDF', desc: '1-सेकंड में डाउनलोड' },
        { icon: 'fa-seedling', title: '100% Practical', desc: 'प्रमाणित वैज्ञानिक ज्ञान' },
        { icon: 'fa-robot', title: 'AI Doctor Support', desc: '24×7 WhatsApp सहायता' },
        { icon: 'fa-lock', title: '256-Bit SSL', desc: '100% सुरक्षित चेकआउट' }
      ],
      videos: [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '📖 खरीफ फसल मास्टर गाइड - अंदर के पेज व डेमो', desc: '300+ वास्तविक फोटो और स्प्रे साइंस चार्ट का लाइव प्रीव्यू।', ratio: '16:9' },
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '📲 24×7 WhatsApp AI डॉक्टर सहायता कैसे काम करती है?', desc: 'किताब पढ़ते समय सवाल पूछने और तुरंत समाधान पाने का तरीका।', ratio: '16:9' }
      ],
      marketing_cards: [
        { book_id: 'BK001', tag: '🔥 Best Seller', headline: 'खरीफ फसल मास्टर गाइड 2026', desc: 'सोयाबीन, मक्का, धान व कपास की सम्पूर्ण प्रैक्टिकल गाइड।', sales_counter: '1,420+ किसानों ने खरीदा' },
        { book_id: 'BK002', tag: '🌱 Top Rated', headline: 'खेती का डॉक्टर (फसल डॉक्टर)', desc: 'रोग, कीट और फंगल का 1-क्लिक समाधान।', sales_counter: '980+ किसानों ने खरीदा' }
      ],
      reviews: [
        { name: 'मनोज सिंह', location: 'भोपाल, मध्य प्रदेश', rating: 5, comment: 'किंडल जैसी 3D कवर्स और शानदार लेआउट! तुरंत डाउनलोड हो गया।' },
        { name: 'विक्रम सिंह', location: 'जयपुर, राजस्थान', rating: 5, comment: 'Aarogyam India का यह स्टोर किसानों के लिए बहुत बड़ा वरदान है।' }
      ],
      faqs: [
        { q: 'क्या पुस्तकें डाउनलोड के बाद ऑफलाइन पढ़ी जा सकती हैं?', a: 'हाँ, एक बार डाउनलोड करने के बाद आप बिना इंटरनेट के भी कभी भी पढ़ सकते हैं।' }
      ],
      whatsapp_support: {
        number: '919876543210',
        prompt: 'नमस्ते, मुझे ई-बुक स्टोर के बारे में जानकारी चाहिए।'
      }
    },
    {
      id: 'page_cart',
      slug: 'cart',
      name: '🛒 शॉपिंग कार्ट (Shopping Cart)',
      url: '/ebooks/cart.html',
      category: 'Checkout',
      status: 'active',
      theme_primary: '#15803d',
      theme_dark: '#0e5227',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '⚡ 256-Bit SSL सुरक्षित भुगतान | इंस्टेंट PDF डाउनलोड व लाइफटाइम एक्सेस',
      hero_slides: [],
      sections_order: ['sec_ticker', 'sec_trust_guarantee', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '919876543210', prompt: 'नमस्ते, मुझे कार्ट चेकआउट में सहायता चाहिए।' }
    },
    {
      id: 'page_library',
      slug: 'my-library',
      name: '📖 मेरी डिजिटल लाइब्रेरी (My Library)',
      url: '/ebooks/my-library.html',
      category: 'User Area',
      status: 'active',
      theme_primary: '#15803d',
      theme_dark: '#0e5227',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '📖 आपकी सभी खरीदी गई ई-बुक्स और बोनस गाइड्स यहाँ सुरक्षित हैं',
      hero_slides: [],
      sections_order: ['sec_ticker', 'sec_shelves_bestseller', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '919876543210', prompt: 'नमस्ते, मुझे मेरी लाइब्रेरी एक्सेस में मदद चाहिए।' }
    },
    {
      id: 'page_wishlist',
      slug: 'wishlist',
      name: '❤️ मेरी विशलिस्ट (Saved Wishlist)',
      url: '/ebooks/wishlist.html',
      category: 'User Area',
      status: 'active',
      theme_primary: '#db2777',
      theme_dark: '#831843',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '❤️ आपकी पसंदीदा पुस्तकें सुरक्षित हैं - जब चाहें 1-क्लिक में कार्ट में जोड़ें',
      hero_slides: [],
      sections_order: ['sec_ticker', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '919876543210', prompt: 'नमस्ते, मुझे विशलिस्ट में मदद चाहिए।' }
    },
    {
      id: 'page_profile',
      slug: 'profile',
      name: '👤 यूजर प्रोफ़ाइल (User Profile)',
      url: '/pages/profile.html',
      category: 'User Area',
      status: 'active',
      theme_primary: '#15803d',
      theme_dark: '#0e5227',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '👑 Aarogyam Pro VIP मेम्बरशिप डैशबोर्ड व सेटिंग्स',
      hero_slides: [],
      sections_order: ['sec_ticker', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '919876543210', prompt: 'नमस्ते, मुझे यूजर प्रोफ़ाइल में मदद चाहिए।' }
    },
    {
      id: 'page_mandi',
      slug: 'mandi',
      name: '🌾 मंडी भाव (Mandi Rates Live)',
      url: '/mandi.html',
      category: 'Utilities',
      status: 'active',
      theme_primary: '#0284c7',
      theme_dark: '#075985',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🌾 ताज़ा मंडी भाव अपडेट्स | सोयाबीन, गेहूं, धान, कपास और दलहन के दैनिक प्रमाणित दाम',
      hero_slides: [],
      sections_order: ['sec_ticker', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '919876543210', prompt: 'नमस्ते, मुझे आज के मंडी भाव के बारे में जानकारी चाहिए।' }
    },
    {
      id: 'page_weather',
      slug: 'weather',
      name: '⛅ मौसम पूर्वानुमान (Live Weather)',
      url: '/weather.html',
      category: 'Utilities',
      status: 'active',
      theme_primary: '#0284c7',
      theme_dark: '#075985',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '⛅ आज का मौसम, आगामी 7 दिनों का पूर्वानुमान व स्प्रे अनुकूलता अलर्ट्स',
      hero_slides: [],
      sections_order: ['sec_ticker', 'sec_help_support'],
      hidden_sections: [],
      kpi_cards: [],
      videos: [],
      marketing_cards: [],
      reviews: [],
      faqs: [],
      whatsapp_support: { number: '919876543210', prompt: 'नमस्ते, मुझे मौसम पूर्वानुमान के बारे में जानकारी चाहिए।' }
    },
    {
      id: 'page_kharif_guide',
      slug: 'kharif-master-guide-2026',
      name: '🌾 खरीफ फसल मास्टर गाइड 2026 (Kharif Guide Landing Page)',
      url: '/ebooks/kharif-master-guide-2026.html',
      category: 'Book Landing Page',
      status: 'active',
      theme_primary: '#2E7D32',
      theme_dark: '#1B5E20',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🌾 खरीफ स्पेशल: ₹299 की जगह मात्र ₹99 में सम्पूर्ण गाइड | धान • सोयाबीन • मक्का • कपास ✦ 24×7 AI डॉक्टर सपोर्ट',
      hero_slides: [
        {
          image: '/images/banners/kharif-master-guide-2026-hero-banner.webp',
          tag: '🌾 Bestseller Agriculture eBook',
          title: 'खरीफ फसल मास्टर गाइड 2026',
          subtitle: 'धान • सोयाबीन • मक्का की सम्पूर्ण Practical Guide',
          cta_text: '⚡ अभी ऑर्डर करें (₹99)',
          cta_link: '/ebooks/checkout.html?id=BK001',
          cta_secondary_text: '📖 फ्री डेमो देखें',
          cta_secondary_link: '/ebooks/demo-kharif.html'
        }
      ],
      sections_order: [
        'sec_ticker',
        'sec_hero_slider',
        'sec_kpi_badges',
        'sec_combo_promo',
        'sec_videos',
        'sec_reviews',
        'sec_trust_guarantee',
        'sec_faqs',
        'sec_help_support'
      ],
      hidden_sections: [],
      kpi_cards: [
        { icon: 'fa-seedling', title: '150+ रंगीन पेज', desc: 'उच्च गुणवत्ता सचित्र मार्गदर्शिका' },
        { icon: 'fa-camera', title: '300+ वास्तविक फोटो', desc: 'रोग, कीट व पोषण की वास्तविक पहचान' },
        { icon: 'fa-circle-check', title: 'Scientific Guide', desc: 'वैज्ञानिक व प्रैक्टिकल कृषि समाधान' },
        { icon: 'fa-robot', title: '24×7 WhatsApp AI डॉक्टर', desc: 'किताब पढ़ते समय त्वरित समाधान' }
      ],
      videos: [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '🎥 खरीफ फसल मास्टर गाइड - वीडियो ओवरव्यू व डेमो', desc: 'धान, सोयाबीन व मक्का की सम्पूर्ण सुरक्षा तकनीक।', ratio: '16:9' }
      ],
      marketing_cards: [
        { book_id: 'BK002', tag: '🌱 कॉम्बो सुझाव', headline: 'खेती का डॉक्टर (फसल डॉक्टर)', desc: 'रोग, कीट और फंगल का 1-क्लिक समाधान।', sales_counter: '980+ किसानों ने खरीदा' }
      ],
      reviews: [
        { name: 'रामेश्वर पटेल', location: 'उज्जैन, मध्य प्रदेश', rating: 5, comment: 'खरीफ मास्टर गाइड बहुत ही उपयोगी है। स्प्रे साइंस चार्ट से मेरी फसल बच गई।' },
        { name: 'सुरेश कुमार यादव', location: 'करनाल, हरियाणा', rating: 5, comment: 'WhatsApp AI डॉक्टर सहायता से जब भी सवाल पूछा तुरंत उत्तर मिला। बहुत बढ़िया गाइड!' }
      ],
      faqs: [
        { q: 'ई-बुक खरीदने के बाद कैसे मिलेगी?', a: 'भुगतान होते ही आपको तुरंत PDF डाउनलोड लिंक मिलेगा और पुस्तक आपकी "मेरी लाइब्रेरी" में आजीवन सुरक्षित रहेगी।' },
        { q: 'क्या मैं मोबाइल पर पढ़ सकता हूँ?', a: 'हाँ, सभी पुस्तकें मोबाइल और टैबलेट के लिए पूरी तरह ऑप्टिमाइज़्ड हैं।' }
      ],
      whatsapp_support: {
        number: '919876543210',
        prompt: 'नमस्ते, मुझे खरीफ फसल मास्टर गाइड 2026 के बारे में जानकारी चाहिए।'
      }
    },
    {
      id: 'page_kheti_dr',
      slug: 'kheti-dr',
      name: '🩺 खेती का डॉक्टर (Kheti Ka Doctor Landing Page)',
      url: '/ebooks/kheti-dr.html',
      category: 'Book Landing Page',
      status: 'active',
      theme_primary: '#059669',
      theme_dark: '#064e3b',
      fb_pixel: true,
      ga_tag: true,
      ticker_text: '🩺 किसान का पॉकेट डॉक्टर: रोग, कीट, फंगल व पोषक तत्वों की कमी की पहचान व सटीक स्प्रे फॉर्मूला',
      hero_slides: [
        {
          image: '../images/banners/kheti-dr-banner-1.webp',
          tag: '🩺 Pocket Doctor Edition',
          title: 'खेती का डॉक्टर (फसल का डॉक्टर)',
          subtitle: 'रोग, कीट, वायरल, फंगल और पोषण प्रबंधन का सचित्र गाइड',
          cta_text: '⚡ अभी ऑर्डर करें (₹99)',
          cta_link: '/ebooks/checkout.html?id=BK002',
          cta_secondary_text: '📖 फ्री डेमो देखें',
          cta_secondary_link: '/ebooks/demo-kharif.html'
        }
      ],
      sections_order: [
        'sec_ticker',
        'sec_hero_slider',
        'sec_kpi_badges',
        'sec_combo_promo',
        'sec_videos',
        'sec_reviews',
        'sec_trust_guarantee',
        'sec_faqs',
        'sec_help_support'
      ],
      hidden_sections: [],
      kpi_cards: [
        { icon: 'fa-stethoscope', title: 'पॉकेट डॉक्टर', desc: 'खेत पर तुरंत रोग व कीट पहचान' },
        { icon: 'fa-spray-can', title: 'स्प्रे फॉर्मूले', desc: 'सटीक दवा व खुराक की तालिका' },
        { icon: 'fa-circle-check', title: '120+ रंगीन पेज', desc: 'सचित्र व सरल हिंदी भाषा' },
        { icon: 'fa-robot', title: '24×7 AI हेल्प', desc: 'WhatsApp पर तुरंत समाधान' }
      ],
      videos: [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '🎥 खेती का डॉक्टर - वीडियो डेमो व गाइड', desc: 'फसलों के मुख्य रोगों की पहचान व वैज्ञानिक स्प्रे विधि।', ratio: '16:9' }
      ],
      marketing_cards: [
        { book_id: 'BK001', tag: '🌾 कॉम्बो सुझाव', headline: 'खरीफ फसल मास्टर गाइड 2026', desc: 'धान, सोयाबीन व मक्का की अधिक पैदावार के गुर।', sales_counter: '1,420+ किसानों ने खरीदा' }
      ],
      reviews: [
        { name: 'कमलेश पाटीदार', location: 'रतलाम, मध्य प्रदेश', rating: 5, comment: 'रोगों की फोटो देखकर पहचानना बहुत आसान हो गया। हर किसान के पास यह किताब होनी चाहिए।' }
      ],
      faqs: [
        { q: 'क्या इसमें कीटनाशकों की मात्रा भी दी गई है?', a: 'हाँ, प्रति एकड़ व प्रति पंप सही खुराक व मिश्रण की विस्तृत जानकारी दी गई है।' }
      ],
      whatsapp_support: {
        number: '919876543210',
        prompt: 'नमस्ते, मुझे खेती का डॉक्टर ई-बुक के बारे में जानकारी चाहिए।'
      }
    }
  ];

  // Load from localStorage or defaults
  let allPages = [];
  try {
    const stored = localStorage.getItem('AAROGYAM_SITE_PAGES_CONFIG');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        allPages = parsed;
        // Merge missing default pages (like new landing pages) into existing list
        defaultPages.forEach(dp => {
          if (!allPages.some(p => p.id === dp.id || p.slug === dp.slug)) {
            allPages.push(dp);
          }
        });
      }
    }
  } catch (e) {}

  if (allPages.length === 0) {
    allPages = defaultPages;
  }
  try {
    localStorage.setItem('AAROGYAM_SITE_PAGES_CONFIG', JSON.stringify(allPages));
  } catch (e) {}

  // Load books for marketing card select dropdown
  let availableBooks = [];
  try {
    const res = await fetch('/data/books.json?v=' + Date.now());
    if (res.ok) {
      const j = await res.json();
      availableBooks = j.books || [];
    }
  } catch (e) {}

  // Merge custom books
  try {
    const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
    if (Array.isArray(customBooks)) {
      customBooks.forEach(cb => {
        const idx = availableBooks.findIndex(x => x.id === cb.id);
        if (idx >= 0) availableBooks[idx] = cb;
        else availableBooks.push(cb);
      });
    }
  } catch (e) {}

  // Current editing state
  let editingPageId = null;
  let currentSlides = [];
  let currentSectionsOrder = [];
  let currentHiddenSections = [];
  let currentKpiCards = [];
  let currentVideos = [];
  let currentMarketingCards = [];
  let currentReviews = [];
  let currentFaqs = [];

  const ALL_SECTION_DEFS = [
    { key: 'sec_ticker', name: '🚨 1. ब्रेकिंग न्यूज़ लाइव टिकर बार (News Ticker)', desc: 'चलती हुई हेडलाइन व लाइव पल्सिंग बैज' },
    { key: 'sec_hero_slider', name: '🖼️ 2. हीरो बैनर स्लाइडर / हिंडोला (Hero Slider)', desc: 'मल्टी-स्लाइड बैनर, टाइटल्स व CTA बटन्स' },
    { key: 'sec_kpi_badges', name: '✨ 3. मुख्य KPI व फीचर बैजेस ग्रिड (KPI Features)', desc: '120+ रंगीन पेज, इंस्टेंट एक्सेस आदि के कार्ड्स' },
    { key: 'sec_category_pills', name: '🏷️ 4. कैटेगरी फ़िल्टर पिल्स (Category Pills)', desc: 'कृषि, स्वास्थ्य, AI, बिज़नेस कैटेगरी बटन्स' },
    { key: 'sec_shelves_bestseller', name: '🔥 5. बेस्टसेलर्स शेल्फ ग्रिड (Best Sellers)', desc: 'सर्वाधिक बिकने वाली ई-बुक्स का किंडल शेल्फ' },
    { key: 'sec_interspersed_marketing', name: '📢 6. भारत भर के किसानों के लाइव सेलिंग कार्ड्स (Marketing Showcase)', desc: '1,400+ किसानों द्वारा खरीदी जा रही प्रमुख पुस्तकों के लाइव कार्ड्स' },
    { key: 'sec_shelves_new', name: '🆕 7. नई पुस्तकें व ट्रेंडिंग शेल्फ (New Arrivals)', desc: 'हाल ही में जोड़ी गई नई डिजिटल ई-बुक्स' },
    { key: 'sec_shelves_coming_soon', name: '⏳ 8. आगामी पुस्तकें शेल्फ (Coming Soon)', desc: 'प्री-लॉन्च पुस्तकें व Notify Me लीड्स' },
    { key: 'sec_combo_promo', name: '🎁 9. बेस्टसेलर 2-बुक कॉम्बो बॉक्स (Combo Box)', desc: '₹198 में 2-बुक कॉम्बो व बचत ऑफर' },
    { key: 'sec_videos', name: '🎥 10. यूट्यूब वीडियो गाइड व वॉकथ्रू (Video Guides)', desc: 'पुस्तकों के अंदर का डेमो व AI डॉक्टर डेमो' },
    { key: 'sec_reviews', name: '💬 11. संतुष्ट पाठकों व किसानों की समीक्षाएं (Reviews)', desc: 'अवतार फोटो, स्टार रेटिंग व अनुभव' },
    { key: 'sec_trust_guarantee', name: '🛡️ 12. सुरक्षा व गारंटी ग्रिड (Trust Badges)', desc: '256-Bit SSL, इंस्टेंट PDF व 24×7 सहायता' },
    { key: 'sec_faqs', name: '❓ 13. अक्सर पूछे जाने वाले सवाल (FAQs Accordion)', desc: 'प्रश्नोत्तरी व सहायता विवरण' },
    { key: 'sec_help_support', name: '💬 14. 24×7 WhatsApp AI डॉक्टर सहायता बॉक्स', desc: 'हेल्पलाइन लिंक व चैट सपोर्ट' }
  ];

  container.innerHTML = `
    <!-- Top Action Header -->
    <div class="admin-section" style="margin-bottom: 16px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
            <span>📑 Universal Site Pages Editor & Manager</span>
            <span style="font-size: 0.75rem; background: rgba(37,99,235,0.15); color: #3b82f6; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Ultimate PRO V27</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 4px 0 0 0;">
            ड्रैग-एंड-ड्रॉप सेक्शंस, हीरो बैनर स्लाइडर, लाइव टिकर, यूट्यूब वीडियो डेमो, और लाइव सेलिंग कार्ड्स के साथ पूरी वेबसाइट का कोई भी पेज बनाएं व कस्टमाइज़ करें।
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button id="btn-toggle-page-editor-form" class="admin-button" style="background: #16a34a; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(22,163,74,0.3);">
            <span>✨</span> <span>+ नया साइट पेज बनाएं</span>
          </button>
          <button id="btn-export-pages-json" class="admin-button small-button" style="background: #0f766e; color: #fff; font-weight: 700;">
            📥 Export Config JSON
          </button>
          <a href="/ebooks/ebook.html" target="_blank" class="admin-button small-button" style="background: #2563eb; color: #fff; text-decoration: none; font-weight: 700;">
            🏪 स्टोर देखें
          </a>
        </div>
      </div>
    </div>

    <!-- ADVANCED UNIVERSAL PAGE EDITOR & BUILDER FORM -->
    <div id="page-editor-form-card" class="admin-card" style="display: none; margin-bottom: 24px; background: var(--admin-surface-2, #0f172a); border: 2px solid #3b82f6; border-radius: 14px; padding: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid var(--admin-border, #334155); padding-bottom: 12px; margin-bottom: 18px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">📑</span>
          <div>
            <h3 id="page-editor-form-title" style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #60a5fa;">
              पेज कस्टमाइज़र व बिल्डर (Universal Page Builder)
            </h3>
            <small style="color: var(--admin-muted); font-size: 0.75rem;">पेज के सभी सेक्शंस, हीरो स्लाइडर और लाइव सेलिंग कार्ड्स को एडिट करें</small>
          </div>
        </div>
        <button type="button" id="btn-close-page-editor-form" class="admin-button icon-button" style="color: var(--admin-muted); font-size: 1.2rem;">✕</button>
      </div>

      <form id="site-page-customizer-form">
        <!-- 1. Basic Page Settings -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <span>⚙️ 1. मूल पेज सेटिंग्स (Page Information & Route)</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">पेज का नाम (Page Name)*</label>
              <input type="text" id="pe_input_name" class="admin-input" placeholder="उदा. 📚 ई-बुक स्टोर (eBook Store)" required style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">पेज स्लग (Slug)*</label>
              <input type="text" id="pe_input_slug" class="admin-input" placeholder="उदा. ebook, agriculture, health" required style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">Live URL / Path*</label>
              <input type="text" id="pe_input_url" class="admin-input" placeholder="/ebooks/ebook.html" required style="width: 100%; padding: 8px 12px;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">कैटेगरी (Category)</label>
              <select id="pe_select_category" class="admin-select" style="width: 100%; padding: 8px 12px;">
                <option value="eBooks">eBooks / डिजिटल स्टोर</option>
                <option value="Agriculture">Agriculture / कृषि</option>
                <option value="Health">Health / स्वास्थ्य</option>
                <option value="Business">Business / व्यापार</option>
                <option value="Digital AI">Digital AI / तकनीक</option>
                <option value="Core">Core / मुख्य</option>
                <option value="User Area">User Area / यूजर एरिया</option>
                <option value="Utilities">Utilities / सुविधाएं</option>
              </select>
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">थीम प्राइमरी कलर</label>
              <input type="color" id="pe_input_theme_primary" value="#15803d" style="width: 100%; height: 38px; border-radius: 8px; border: 1px solid var(--admin-border); cursor: pointer; background: transparent;" />
            </div>
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">पेज स्टेटस (Status)</label>
              <select id="pe_select_status" class="admin-select" style="width: 100%; padding: 8px 12px;">
                <option value="active">🟢 Live (सक्रिय)</option>
                <option value="draft">🔴 Offline / Draft (ड्राफ्ट)</option>
              </select>
            </div>
          </div>

          <!-- Tracking Toggles -->
          <div style="display: flex; gap: 20px; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--admin-border); flex-wrap: wrap;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #94a3b8; cursor: pointer;">
              <input type="checkbox" id="pe_chk_fb" checked style="width: 16px; height: 16px; accent-color: #3b82f6;" />
              <span>🔵 Facebook Meta Pixel Active (1671873500553134)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #94a3b8; cursor: pointer;">
              <input type="checkbox" id="pe_chk_ga" checked style="width: 16px; height: 16px; accent-color: #eab308;" />
              <span>🟡 Google Analytics Tag Active (G-2BWPJVQWPK)</span>
            </label>
          </div>
        </div>

        <!-- 2. Breaking News Live Ticker -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span>🚨 2. ब्रेकिंग न्यूज़ लाइव टिकर बार (Live Marquee Ticker)</span>
          </div>
          <div>
            <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">टिकर हेडलाइंस टेक्स्ट (Marquee Headline Text)</label>
            <input type="text" id="pe_input_ticker" class="admin-input" placeholder="उदा. 🌾 खरीफ फसल मास्टर गाइड 2026 पर 67% छूट! ✦ 📲 24×7 WhatsApp AI डॉक्टर सहायता मुफ़्त!" style="width: 100%; padding: 8px 12px;" />
          </div>
        </div>

        <!-- 3. Multi-Slide Hero Banner Slider Customizer -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>🖼️ 3. हीरो बैनर स्लाइडर (Hero Banner Slider / Carousel)</span>
              </div>
              <small style="color: var(--admin-muted); font-size: 0.75rem;">पेज पर सबसे ऊपर दिखने वाले एनिमेटेड बैनर स्लाइड्स</small>
            </div>
            <button type="button" id="btn_add_hero_slide" class="admin-button small-button" style="background: #3b82f6; color: #fff; font-weight: 800;">
              + नया स्लाइड बैनर जोड़ें
            </button>
          </div>

          <div id="pe_hero_slides_container" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 4. Drag & Drop Section Reordering -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>🔀 4. पेज सेक्शंस का क्रम व दृश्यता (Drag & Drop Section Reordering)</span>
              </div>
              <small style="color: var(--admin-muted); font-size: 0.75rem;">↑ ↓ बटनों से सेक्शंस का क्रम बदलें या चेकबॉक्स से ऑन/ऑफ करें</small>
            </div>
            <button type="button" id="btn_reset_page_sections_order" class="admin-button small-button" style="background: transparent; border: 1px solid var(--admin-border); color: var(--admin-muted);">
              🔄 डिफ़ॉल्ट क्रम रीसेट करें
            </button>
          </div>

          <div id="pe_sections_reordering_list" style="display: flex; flex-direction: column; gap: 8px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 5. KPI & Feature Badges Manager -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem;">
              <span>✨ 5. मुख्य KPI व फीचर बैजेस (Feature Highlights)</span>
            </div>
            <button type="button" id="btn_add_kpi_card" class="admin-button small-button" style="background: #16a34a; color: #fff; font-weight: 800;">
              + नया फीचर कार्ड जोड़ें
            </button>
          </div>
          <div id="pe_kpi_cards_container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 6. Interspersed Book Sell Marketing Cards Manager -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>📢 6. भारत भर के किसानों के लाइव सेलिंग कार्ड्स (Interspersed Sales Cards)</span>
              </div>
              <small style="color: var(--admin-muted); font-size: 0.75rem;">स्टोर शेल्फ्स के बीच-बीच में दिखने वाले हाई-कन्वर्टिंग 1-क्लिक बुक सेलिंग कार्ड्स</small>
            </div>
            <button type="button" id="btn_add_marketing_card" class="admin-button small-button" style="background: #eab308; color: #000; font-weight: 900;">
              + नया सेलिंग कार्ड जोड़ें
            </button>
          </div>
          <div id="pe_marketing_cards_container" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 7. YouTube Video Guides Showcase -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem;">
              <span>🎥 7. यूट्यूब वीडियो गाइड व डेमो (Video Showcase)</span>
            </div>
            <button type="button" id="btn_add_page_video" class="admin-button small-button" style="background: #ef4444; color: #fff; font-weight: 800;">
              + नया यूट्यूब वीडियो जोड़ें
            </button>
          </div>
          <div id="pe_videos_container" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 8. Testimonials & Farmer Reviews -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem;">
              <span>💬 8. पाठकों व किसानों की समीक्षाएं (Customer Reviews)</span>
            </div>
            <button type="button" id="btn_add_page_review" class="admin-button small-button" style="background: #8b5cf6; color: #fff; font-weight: 800;">
              + नई समीक्षा जोड़ें
            </button>
          </div>
          <div id="pe_reviews_container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 9. FAQs Accordion Manager -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--admin-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem;">
              <span>❓ 9. अक्सर पूछे जाने वाले सवाल (FAQs Accordion)</span>
            </div>
            <button type="button" id="btn_add_page_faq" class="admin-button small-button" style="background: #0284c7; color: #fff; font-weight: 800;">
              + नया प्रश्न जोड़ें
            </button>
          </div>
          <div id="pe_faqs_container" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 10. WhatsApp AI Support & Social Share Settings -->
        <div style="background: var(--admin-surface, #1e293b); border-radius: 10px; padding: 16px; margin-bottom: 20px; border: 1px solid var(--admin-border);">
          <div style="font-weight: 800; color: #f8fafc; font-size: 0.95rem; margin-bottom: 12px;">
            <span>💬 10. 24×7 WhatsApp AI डॉक्टर सहायता व यूनिवर्सल सोशल शेयर</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
            <div>
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">WhatsApp हेल्पलाइन नंबर</label>
              <input type="text" id="pe_input_wa_number" class="admin-input" placeholder="919876543210" style="width: 100%; padding: 8px 12px;" />
            </div>
            <div style="grid-column: 1 / -1;">
              <label class="admin-label" style="font-size: 0.8rem; font-weight: 700; color: var(--admin-text);">WhatsApp ऑटो-मैसेज प्रॉम्प्ट</label>
              <input type="text" id="pe_input_wa_prompt" class="admin-input" placeholder="नमस्ते, मुझे इस पेज और पुस्तकों के बारे में जानकारी चाहिए।" style="width: 100%; padding: 8px 12px;" />
            </div>
          </div>
        </div>

        <!-- Submit & Save Actions -->
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <button type="submit" class="admin-button" style="background: #16a34a; color: #fff; font-weight: 900; padding: 12px 28px; font-size: 1rem; box-shadow: 0 4px 14px rgba(22,163,74,0.4);">
            💾 यह साइट पेज सुरक्षित करें (Save Page)
          </button>
          <button type="button" id="btn-cancel-page-editor-form" class="admin-button" style="background: transparent; border: 1px solid var(--admin-border); color: var(--admin-muted);">
            रद्द करें
          </button>
        </div>
      </form>
    </div>

    <!-- Active Site Pages Table -->
    <div class="admin-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: var(--admin-text);">
          📋 सभी सक्रिय वेबसाइट पेजेस (All Website Pages)
        </h3>
        <input type="text" id="pe_search_input" class="admin-input" placeholder="🔍 पेज खोजें..." style="max-width: 260px; padding: 6px 10px; font-size: 0.82rem;" />
      </div>

      <div id="pe_table_container" class="admin-table-wrapper">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  const formCard = document.getElementById('page-editor-form-card');
  const toggleBtn = document.getElementById('btn-toggle-page-editor-form');
  const closeBtn = document.getElementById('btn-close-page-editor-form');
  const cancelBtn = document.getElementById('btn-cancel-page-editor-form');
  const form = document.getElementById('site-page-customizer-form');
  const searchInput = document.getElementById('pe_search_input');
  const exportBtn = document.getElementById('btn-export-pages-json');

  toggleBtn?.addEventListener('click', () => {
    resetPageForm();
    formCard.style.display = formCard.style.display === 'none' ? 'block' : 'none';
    if (formCard.style.display === 'block') formCard.scrollIntoView({ behavior: 'smooth' });
  });

  closeBtn?.addEventListener('click', () => { formCard.style.display = 'none'; });
  cancelBtn?.addEventListener('click', () => { formCard.style.display = 'none'; });
  searchInput?.addEventListener('input', renderPagesTable);
  exportBtn?.addEventListener('click', exportPagesJson);

  document.getElementById('btn_add_hero_slide')?.addEventListener('click', () => {
    currentSlides.push({
      image: '/images/banners/kharif-master-guide-2026-hero-banner.webp',
      tag: '🌾 नया स्पेशल ऑफर',
      title: 'नया बैनर शीर्षक यहाँ लिखें',
      subtitle: 'बैनर का आकर्षक विवरण और लाभ यहाँ लिखें',
      cta_text: '📚 अभी देखें',
      cta_link: '/ebooks/ebook.html',
      cta_secondary_text: '🛒 लाइव कार्ट',
      cta_secondary_link: '/ebooks/cart.html'
    });
    renderHeroSlidesInBuilder();
  });

  document.getElementById('btn_reset_page_sections_order')?.addEventListener('click', () => {
    currentSectionsOrder = ALL_SECTION_DEFS.map(s => s.key);
    currentHiddenSections = [];
    renderSectionsReorderingList();
    showToast('🔄 सेक्शंस का डिफ़ॉल्ट क्रम बहाल किया गया!', 'info');
  });

  document.getElementById('btn_add_kpi_card')?.addEventListener('click', () => {
    currentKpiCards.push({ icon: 'fa-star', title: 'नया फीचर शीर्षक', desc: 'फीचर का विवरण यहाँ लिखें...' });
    renderKpiCardsInBuilder();
  });

  document.getElementById('btn_add_marketing_card')?.addEventListener('click', () => {
    currentMarketingCards.push({
      book_id: availableBooks[0]?.id || 'BK001',
      tag: '🔥 बेस्टसेलर डील',
      headline: availableBooks[0]?.heading || 'विशेष ई-बुक गाइड',
      desc: 'विशेषज्ञों द्वारा तैयार प्रमाणित मार्गदर्शिका।',
      sales_counter: '1,200+ किसानों ने खरीदा'
    });
    renderMarketingCardsInBuilder();
  });

  document.getElementById('btn_add_page_video')?.addEventListener('click', () => {
    currentVideos.push({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: '🎥 नया वीडियो डेमो शीर्षक',
      desc: 'वीडियो का विवरण यहाँ लिखें...',
      ratio: '16:9'
    });
    renderVideosInBuilder();
  });

  document.getElementById('btn_add_page_review')?.addEventListener('click', () => {
    currentReviews.push({
      name: 'संतुष्ट पाठक',
      location: 'भारत',
      rating: 5,
      comment: 'बहुत ही उपयोगी व व्यावहारिक पुस्तक है।'
    });
    renderReviewsInBuilder();
  });

  document.getElementById('btn_add_page_faq')?.addEventListener('click', () => {
    currentFaqs.push({ q: 'नया प्रश्न यहाँ लिखें?', a: 'उत्तर यहाँ लिखें।' });
    renderFaqsInBuilder();
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    savePageConfig();
  });

  // -------------------------------------------------------------
  // RENDER DYNAMIC BUILDER SECTIONS
  // -------------------------------------------------------------
  function renderHeroSlidesInBuilder() {
    const wrap = document.getElementById('pe_hero_slides_container');
    if (!wrap) return;

    if (currentSlides.length === 0) {
      wrap.innerHTML = '<div style="color:var(--admin-muted);font-size:0.8rem;text-align:center;padding:12px;">कोई स्लाइड बैनर नहीं है। "+ नया स्लाइड बैनर जोड़ें" बटन दबाएं।</div>';
      return;
    }

    wrap.innerHTML = currentSlides.map((slide, idx) => `
      <div style="background: #0f172a; border: 1px solid var(--admin-border); border-radius: 8px; padding: 12px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 800; color: #60a5fa; font-size: 0.85rem;">स्लाइड #${idx + 1}</span>
          <button type="button" onclick="window.removeHeroSlide(${idx})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.8rem; font-weight: 800;">&times; हटाएं</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">बैनर इमेज URL</label>
            <input type="text" value="${escapeHtml(slide.image)}" onchange="window.updateHeroSlideField(${idx}, 'image', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">टैग / ऑफर बैज</label>
            <input type="text" value="${escapeHtml(slide.tag || '')}" onchange="window.updateHeroSlideField(${idx}, 'tag', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">मुख्य शीर्षक (Headline)</label>
            <input type="text" value="${escapeHtml(slide.title || '')}" onchange="window.updateHeroSlideField(${idx}, 'title', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">उप-शीर्षक (Subtitle)</label>
            <input type="text" value="${escapeHtml(slide.subtitle || '')}" onchange="window.updateHeroSlideField(${idx}, 'subtitle', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">CTA बटन टेक्स्ट</label>
            <input type="text" value="${escapeHtml(slide.cta_text || 'देखें')}" onchange="window.updateHeroSlideField(${idx}, 'cta_text', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">CTA बटन लिंक (URL)</label>
            <input type="text" value="${escapeHtml(slide.cta_link || '')}" onchange="window.updateHeroSlideField(${idx}, 'cta_link', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
        </div>
      </div>
    `).join('');
  }

  window.updateHeroSlideField = function(idx, field, val) {
    if (currentSlides[idx]) currentSlides[idx][field] = val;
  };

  window.removeHeroSlide = function(idx) {
    currentSlides.splice(idx, 1);
    renderHeroSlidesInBuilder();
  };

  function renderSectionsReorderingList() {
    const wrap = document.getElementById('pe_sections_reordering_list');
    if (!wrap) return;

    wrap.innerHTML = currentSectionsOrder.map((secKey, idx) => {
      const def = ALL_SECTION_DEFS.find(d => d.key === secKey) || { key: secKey, name: secKey, desc: '' };
      const isHidden = currentHiddenSections.includes(secKey);

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; background: #0f172a; border: 1px solid ${isHidden ? '#475569' : '#334155'}; border-radius: 8px; padding: 8px 12px; gap: 8px; opacity: ${isHidden ? '0.6' : '1'};">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-family: monospace; font-weight: 800; color: #38bdf8; font-size: 0.85rem;">#${idx + 1}</span>
            <div>
              <strong style="font-size: 0.88rem; color: ${isHidden ? 'var(--admin-muted)' : '#f8fafc'};">${def.name}</strong>
              <div style="font-size: 0.72rem; color: var(--admin-muted);">${def.desc}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button type="button" onclick="window.movePageSection(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} class="admin-button small-button" style="padding: 2px 8px; font-size: 0.75rem;">▲</button>
            <button type="button" onclick="window.movePageSection(${idx}, 1)" ${idx === currentSectionsOrder.length - 1 ? 'disabled' : ''} class="admin-button small-button" style="padding: 2px 8px; font-size: 0.75rem;">▼</button>
            <button type="button" onclick="window.togglePageSectionVisibility('${secKey}')" class="admin-button small-button" style="background: ${isHidden ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'}; color: ${isHidden ? '#ef4444' : '#22c55e'}; border: 1px solid ${isHidden ? '#ef4444' : '#22c55e'}; padding: 2px 8px; font-size: 0.75rem; font-weight: 800;">
              ${isHidden ? 'छिपा हुआ (Hidden)' : 'दिखेगा (Visible)'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.movePageSection = function(idx, dir) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= currentSectionsOrder.length) return;
    const item = currentSectionsOrder.splice(idx, 1)[0];
    currentSectionsOrder.splice(newIdx, 0, item);
    renderSectionsReorderingList();
  };

  window.togglePageSectionVisibility = function(secKey) {
    if (currentHiddenSections.includes(secKey)) {
      currentHiddenSections = currentHiddenSections.filter(k => k !== secKey);
    } else {
      currentHiddenSections.push(secKey);
    }
    renderSectionsReorderingList();
  };

  function renderKpiCardsInBuilder() {
    const wrap = document.getElementById('pe_kpi_cards_container');
    if (!wrap) return;

    wrap.innerHTML = currentKpiCards.map((card, idx) => `
      <div style="background: #0f172a; border: 1px solid var(--admin-border); border-radius: 8px; padding: 10px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #34d399;">कार्ड #${idx + 1}</span>
          <button type="button" onclick="window.removeKpiCard(${idx})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.75rem;">&times;</button>
        </div>
        <input type="text" value="${escapeHtml(card.icon || '')}" onchange="window.updateKpiCard(${idx}, 'icon', this.value)" class="admin-input" placeholder="FontAwesome Icon (e.g. fa-seedling)" style="width: 100%; padding: 4px 6px; font-size: 0.75rem; margin-bottom: 4px;" />
        <input type="text" value="${escapeHtml(card.title || '')}" onchange="window.updateKpiCard(${idx}, 'title', this.value)" class="admin-input" placeholder="शीर्षक (Title)" style="width: 100%; padding: 4px 6px; font-size: 0.75rem; margin-bottom: 4px;" />
        <input type="text" value="${escapeHtml(card.desc || '')}" onchange="window.updateKpiCard(${idx}, 'desc', this.value)" class="admin-input" placeholder="विवरण (Desc)" style="width: 100%; padding: 4px 6px; font-size: 0.75rem;" />
      </div>
    `).join('');
  }

  window.updateKpiCard = function(idx, field, val) {
    if (currentKpiCards[idx]) currentKpiCards[idx][field] = val;
  };

  window.removeKpiCard = function(idx) {
    currentKpiCards.splice(idx, 1);
    renderKpiCardsInBuilder();
  };

  function renderMarketingCardsInBuilder() {
    const wrap = document.getElementById('pe_marketing_cards_container');
    if (!wrap) return;

    wrap.innerHTML = currentMarketingCards.map((m, idx) => `
      <div style="background: #0f172a; border: 1px solid var(--admin-border); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 800; color: #facc15; font-size: 0.82rem;">📢 सेलिंग कार्ड #${idx + 1}</span>
          <button type="button" onclick="window.removeMarketingCard(${idx})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.8rem; font-weight: 800;">&times; हटाएं</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">प्रमोट की जाने वाली पुस्तक (Book ID)</label>
            <select onchange="window.updateMarketingCardBook(${idx}, this.value)" class="admin-select" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;">
              ${availableBooks.map(b => `<option value="${b.id}" ${b.id === m.book_id ? 'selected' : ''}>[${b.id}] ${b.heading || b.name} (₹${b.offerPrice || 99})</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">ऑफर टैग (Offer Tag)</label>
            <input type="text" value="${escapeHtml(m.tag || '')}" onchange="window.updateMarketingCardField(${idx}, 'tag', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">लाइव सेलिंग काउंटर (Sales Counter)</label>
            <input type="text" value="${escapeHtml(m.sales_counter || '')}" onchange="window.updateMarketingCardField(${idx}, 'sales_counter', this.value)" class="admin-input" placeholder="उदा. 1,400+ किसानों ने खरीदा" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">हेडलाइन (Headline)</label>
            <input type="text" value="${escapeHtml(m.headline || '')}" onchange="window.updateMarketingCardField(${idx}, 'headline', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
          <div style="grid-column: 1 / -1;">
            <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">संक्षिप्त विवरण (Description)</label>
            <input type="text" value="${escapeHtml(m.desc || '')}" onchange="window.updateMarketingCardField(${idx}, 'desc', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
          </div>
        </div>
      </div>
    `).join('');
  }

  window.updateMarketingCardBook = function(idx, bookId) {
    if (currentMarketingCards[idx]) {
      currentMarketingCards[idx].book_id = bookId;
      const b = availableBooks.find(x => x.id === bookId);
      if (b) {
        currentMarketingCards[idx].headline = b.heading || b.name || '';
      }
      renderMarketingCardsInBuilder();
    }
  };

  window.updateMarketingCardField = function(idx, field, val) {
    if (currentMarketingCards[idx]) currentMarketingCards[idx][field] = val;
  };

  window.removeMarketingCard = function(idx) {
    currentMarketingCards.splice(idx, 1);
    renderMarketingCardsInBuilder();
  };

  function renderVideosInBuilder() {
    const wrap = document.getElementById('pe_videos_container');
    if (!wrap) return;

    wrap.innerHTML = currentVideos.map((v, idx) => `
      <div style="background: #0f172a; border: 1px solid var(--admin-border); border-radius: 8px; padding: 10px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; position: relative;">
        <div>
          <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">YouTube URL</label>
          <input type="text" value="${escapeHtml(v.url || '')}" onchange="window.updateVideoItem(${idx}, 'url', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
        </div>
        <div>
          <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">वीडियो शीर्षक</label>
          <input type="text" value="${escapeHtml(v.title || '')}" onchange="window.updateVideoItem(${idx}, 'title', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
        </div>
        <div>
          <label style="font-size: 0.72rem; color: var(--admin-muted); display: block;">विवरण</label>
          <input type="text" value="${escapeHtml(v.desc || '')}" onchange="window.updateVideoItem(${idx}, 'desc', this.value)" class="admin-input" style="width: 100%; padding: 5px 8px; font-size: 0.8rem;" />
        </div>
        <div style="display: flex; align-items: flex-end; justify-content: flex-end;">
          <button type="button" onclick="window.removeVideoItem(${idx})" class="admin-button small-button" style="background: #ef4444; color: #fff;">&times; हटाएं</button>
        </div>
      </div>
    `).join('');
  }

  window.updateVideoItem = function(idx, field, val) {
    if (currentVideos[idx]) currentVideos[idx][field] = val;
  };

  window.removeVideoItem = function(idx) {
    currentVideos.splice(idx, 1);
    renderVideosInBuilder();
  };

  function renderReviewsInBuilder() {
    const wrap = document.getElementById('pe_reviews_container');
    if (!wrap) return;

    wrap.innerHTML = currentReviews.map((r, idx) => `
      <div style="background: #0f172a; border: 1px solid var(--admin-border); border-radius: 8px; padding: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #a78bfa;">समीक्षा #${idx + 1}</span>
          <button type="button" onclick="window.removeReviewItem(${idx})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.75rem;">&times;</button>
        </div>
        <input type="text" value="${escapeHtml(r.name || '')}" onchange="window.updateReviewItem(${idx}, 'name', this.value)" class="admin-input" placeholder="नाम" style="width: 100%; padding: 4px 6px; font-size: 0.75rem; margin-bottom: 4px;" />
        <input type="text" value="${escapeHtml(r.location || '')}" onchange="window.updateReviewItem(${idx}, 'location', this.value)" class="admin-input" placeholder="स्थान / शहर" style="width: 100%; padding: 4px 6px; font-size: 0.75rem; margin-bottom: 4px;" />
        <input type="text" value="${escapeHtml(r.comment || '')}" onchange="window.updateReviewItem(${idx}, 'comment', this.value)" class="admin-input" placeholder="टिप्पणी" style="width: 100%; padding: 4px 6px; font-size: 0.75rem;" />
      </div>
    `).join('');
  }

  window.updateReviewItem = function(idx, field, val) {
    if (currentReviews[idx]) currentReviews[idx][field] = val;
  };

  window.removeReviewItem = function(idx) {
    currentReviews.splice(idx, 1);
    renderReviewsInBuilder();
  };

  function renderFaqsInBuilder() {
    const wrap = document.getElementById('pe_faqs_container');
    if (!wrap) return;

    wrap.innerHTML = currentFaqs.map((faq, idx) => `
      <div style="background: #0f172a; border: 1px solid var(--admin-border); border-radius: 8px; padding: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #38bdf8;">प्रश्न #${idx + 1}</span>
          <button type="button" onclick="window.removeFaqItem(${idx})" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.75rem;">&times;</button>
        </div>
        <input type="text" value="${escapeHtml(faq.q || '')}" onchange="window.updateFaqItem(${idx}, 'q', this.value)" class="admin-input" placeholder="प्रश्न (Question)" style="width: 100%; padding: 4px 6px; font-size: 0.75rem; margin-bottom: 4px;" />
        <textarea onchange="window.updateFaqItem(${idx}, 'a', this.value)" class="admin-input" placeholder="उत्तर (Answer)" style="width: 100%; padding: 4px 6px; font-size: 0.75rem; height: 50px;">${escapeHtml(faq.a || '')}</textarea>
      </div>
    `).join('');
  }

  window.updateFaqItem = function(idx, field, val) {
    if (currentFaqs[idx]) currentFaqs[idx][field] = val;
  };

  window.removeFaqItem = function(idx) {
    currentFaqs.splice(idx, 1);
    renderFaqsInBuilder();
  };

  // -------------------------------------------------------------
  // TABLE & ACTIONS
  // -------------------------------------------------------------
  function renderPagesTable() {
    const wrap = document.getElementById('pe_table_container');
    if (!wrap) return;

    const q = (searchInput?.value || '').toLowerCase().trim();
    const filtered = allPages.filter(p => {
      return (p.name || '').toLowerCase().includes(q) || (p.url || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      wrap.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--admin-muted);">कोई पेज नहीं मिला।</div>';
      return;
    }

    wrap.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>पेज का नाम (Page Name)</th>
            <th>कैटेगरी</th>
            <th>Live URL</th>
            <th>स्लाइड्स व सेक्शंस</th>
            <th>ट्रैकिंग</th>
            <th>स्थिति (Status)</th>
            <th style="text-align:center;">एक्शन (Actions)</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(p => {
            const isLive = p.status === 'active';
            const slidesCount = (p.hero_slides || []).length;
            const secCount = (p.sections_order || []).length;

            return `
              <tr>
                <td>
                  <strong style="color:var(--admin-text);font-size:0.95rem;">${p.name}</strong>
                  <div style="font-size:0.75rem;color:var(--admin-muted);">${p.ticker_text ? p.ticker_text.substring(0, 45) + '...' : ''}</div>
                </td>
                <td>
                  <span style="font-size:0.75rem;background:rgba(59,130,246,0.15);color:#3b82f6;padding:2px 8px;border-radius:4px;font-weight:700;">
                    ${p.category || 'General'}
                  </span>
                </td>
                <td>
                  <code style="font-size:0.8rem;color:#16a34a;background:rgba(22,163,74,0.1);padding:2px 6px;border-radius:4px;">${p.url}</code>
                </td>
                <td>
                  <span style="font-size:0.75rem;background:rgba(168,85,247,0.15);color:#c084fc;padding:2px 6px;border-radius:4px;font-weight:700;">
                    🖼️ ${slidesCount} स्लाइड | 📑 ${secCount} सेक्शंस
                  </span>
                </td>
                <td>
                  <span style="font-size:0.72rem;background:rgba(37,99,235,0.15);color:#3b82f6;padding:2px 6px;border-radius:4px;font-weight:700;">
                    ${p.fb_pixel !== false ? '🔵 FB + GA ON' : 'Off'}
                  </span>
                </td>
                <td>
                  <button type="button" onclick="window.toggleSitePageStatus('${p.id}')" class="admin-button small-button" style="background:${isLive ? 'rgba(22,163,74,0.15)' : 'rgba(239,68,68,0.15)'};color:${isLive ? '#16a34a' : '#ef4444'};border:1px solid ${isLive ? '#16a34a' : '#ef4444'};padding:3px 8px;border-radius:6px;font-size:0.78rem;font-weight:800;">
                    ${isLive ? '🟢 Live' : '🔴 Offline'}
                  </button>
                </td>
                <td>
                  <div style="display:flex;gap:6px;align-items:center;justify-content:center;">
                    <button type="button" onclick="window.editSitePage('${p.id}')" class="admin-button small-button" style="background:#f59e0b;color:#000;font-weight:900;padding:5px 12px;" title="एडिट करें">
                      ✏️ एडिट
                    </button>
                    <a href="${p.url}" target="_blank" class="admin-button small-button" style="background:#2563eb;color:#fff;text-decoration:none;font-weight:700;" title="लाइव देखें">
                      👁️ देखें
                    </a>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  window.editSitePage = function(pageId) {
    const p = allPages.find(x => x.id === pageId);
    if (!p) return;

    editingPageId = p.id;
    document.getElementById('page-editor-form-title').textContent = `✏️ पेज एडिट करें: ${p.name}`;
    document.getElementById('pe_input_slug').value = p.slug || p.id;
    document.getElementById('pe_input_name').value = p.name || '';
    document.getElementById('pe_input_url').value = p.url || '';
    document.getElementById('pe_select_category').value = p.category || 'eBooks';
    document.getElementById('pe_select_status').value = p.status || 'active';
    document.getElementById('pe_input_theme_primary').value = p.theme_primary || '#15803d';
    document.getElementById('pe_input_ticker').value = p.ticker_text || '';
    document.getElementById('pe_chk_fb').checked = p.fb_pixel !== false;
    document.getElementById('pe_chk_ga').checked = p.ga_tag !== false;
    document.getElementById('pe_input_wa_number').value = p.whatsapp_support?.number || '919876543210';
    document.getElementById('pe_input_wa_prompt').value = p.whatsapp_support?.prompt || '';

    currentSlides = Array.isArray(p.hero_slides) ? JSON.parse(JSON.stringify(p.hero_slides)) : [];
    currentSectionsOrder = Array.isArray(p.sections_order) && p.sections_order.length > 0 ? [...p.sections_order] : ALL_SECTION_DEFS.map(s => s.key);
    currentHiddenSections = Array.isArray(p.hidden_sections) ? [...p.hidden_sections] : [];
    currentKpiCards = Array.isArray(p.kpi_cards) ? JSON.parse(JSON.stringify(p.kpi_cards)) : [];
    currentVideos = Array.isArray(p.videos) ? JSON.parse(JSON.stringify(p.videos)) : [];
    currentMarketingCards = Array.isArray(p.marketing_cards) ? JSON.parse(JSON.stringify(p.marketing_cards)) : [];
    currentReviews = Array.isArray(p.reviews) ? JSON.parse(JSON.stringify(p.reviews)) : [];
    currentFaqs = Array.isArray(p.faqs) ? JSON.parse(JSON.stringify(p.faqs)) : [];

    renderHeroSlidesInBuilder();
    renderSectionsReorderingList();
    renderKpiCardsInBuilder();
    renderMarketingCardsInBuilder();
    renderVideosInBuilder();
    renderReviewsInBuilder();
    renderFaqsInBuilder();

    formCard.style.display = 'block';
    formCard.scrollIntoView({ behavior: 'smooth' });
  };

  window.toggleSitePageStatus = function(pageId) {
    const p = allPages.find(x => x.id === pageId);
    if (!p) return;
    p.status = p.status === 'active' ? 'draft' : 'active';
    savePagesToStorage();
    renderPagesTable();
    showToast(`स्टेटस बदला गया: ${p.status === 'active' ? '🟢 Live' : '🔴 Offline'}`, 'success');
  };

  function resetPageForm() {
    editingPageId = null;
    document.getElementById('page-editor-form-title').textContent = 'नया साइट पेज बनाएं (Universal Page Editor)';
    document.getElementById('site-page-customizer-form')?.reset();
    currentSlides = [];
    currentSectionsOrder = ALL_SECTION_DEFS.map(s => s.key);
    currentHiddenSections = [];
    currentKpiCards = [];
    currentVideos = [];
    currentMarketingCards = [];
    currentReviews = [];
    currentFaqs = [];

    renderHeroSlidesInBuilder();
    renderSectionsReorderingList();
    renderKpiCardsInBuilder();
    renderMarketingCardsInBuilder();
    renderVideosInBuilder();
    renderReviewsInBuilder();
    renderFaqsInBuilder();
  }

  function savePageConfig() {
    const slug = (document.getElementById('pe_input_slug')?.value || '').trim();
    const name = (document.getElementById('pe_input_name')?.value || '').trim();
    const url = (document.getElementById('pe_input_url')?.value || '').trim();
    const cat = document.getElementById('pe_select_category')?.value || 'eBooks';
    const status = document.getElementById('pe_select_status')?.value || 'active';
    const themeCol = document.getElementById('pe_input_theme_primary')?.value || '#15803d';
    const ticker = (document.getElementById('pe_input_ticker')?.value || '').trim();
    const fb = document.getElementById('pe_chk_fb')?.checked !== false;
    const ga = document.getElementById('pe_chk_ga')?.checked !== false;
    const waNum = (document.getElementById('pe_input_wa_number')?.value || '').trim();
    const waPrompt = (document.getElementById('pe_input_wa_prompt')?.value || '').trim();

    const pageObj = {
      id: editingPageId || `page_${slug.replace(/[^a-zA-Z0-9_]/g, '_')}`,
      slug: slug,
      name: name,
      url: url,
      category: cat,
      status: status,
      theme_primary: themeCol,
      theme_dark: adjustColorBrightness(themeCol, -30),
      ticker_text: ticker,
      fb_pixel: fb,
      ga_tag: ga,
      hero_slides: currentSlides,
      sections_order: currentSectionsOrder,
      hidden_sections: currentHiddenSections,
      kpi_cards: currentKpiCards,
      marketing_cards: currentMarketingCards,
      videos: currentVideos,
      reviews: currentReviews,
      faqs: currentFaqs,
      whatsapp_support: {
        number: waNum,
        prompt: waPrompt
      }
    };

    const existingIdx = allPages.findIndex(x => x.id === pageObj.id);
    if (existingIdx >= 0) allPages[existingIdx] = pageObj;
    else allPages.unshift(pageObj);

    savePagesToStorage();
    formCard.style.display = 'none';
    resetPageForm();
    renderPagesTable();
    showToast(`✅ पेज '${name}' सम्पूर्ण कॉन्फ़िगरेशन के साथ सुरक्षित हो गया!`, 'success');
  }

  function savePagesToStorage() {
    try {
      localStorage.setItem('AAROGYAM_SITE_PAGES_CONFIG', JSON.stringify(allPages));
      const homePage = allPages.find(p => p.id === 'page_home' || p.slug === 'index');
      if (homePage) {
        localStorage.setItem('AAROGYAM_HOME_CMS_CONFIG', JSON.stringify(homePage));
      }
    } catch (e) {}
  }

  function exportPagesJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ sitePages: allPages }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "site-pages-config.json");
    dlAnchorElem.click();
    showToast('📥 site-pages-config.json डाउनलोड हो गया!', 'success');
  }

  function adjustColorBrightness(hex, percent) {
    let num = parseInt(hex.replace('#', ''), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = (num >> 8 & 0x00FF) + amt;
    let B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;background:${type === 'success' ? '#16a34a' : '#2563eb'};color:#fff;padding:12px 20px;border-radius:10px;font-weight:700;font-size:0.9rem;box-shadow:0 8px 24px rgba(0,0,0,0.3);z-index:999999;animation:slideIn 0.3s ease;`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
  }

  renderPagesTable();

  // Check URL hash/query for direct page editor target
  try {
    const rawHash = location.hash || location.search || '';
    const queryPart = rawHash.includes('?') ? rawHash.split('?')[1] : '';
    const params = new URLSearchParams(queryPart);
    const targetPage = params.get('page');
    if (targetPage) {
      const found = allPages.find(p => p.slug === targetPage || p.id.includes(targetPage));
      if (found) {
        setTimeout(() => {
          window.editSitePage(found.id);
        }, 150);
      }
    }
  } catch (e) {}
}
