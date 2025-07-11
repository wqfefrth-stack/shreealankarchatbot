import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'english' | 'marathi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  english: {
    // Header
    'header.title': 'Shree Alankar',
    'header.subtitle': 'Fine Jewelry Seller Since 1998',
    'header.customerSupport': 'Customer Support',
    
    // Welcome Section
    'welcome.title': 'Welcome to Shree Alankar ChatBot Assistant',
    'welcome.subtitle': 'Your 24/7 customer support for all jewelry-related queries',
    'welcome.contact': 'Contact: 9921612155',
    'welcome.address': 'Shree Alankar, Near Bank Of Maharashtra, Lohoner',
    'welcome.hours': '9:00 AM to 7:30 PM Daily',
    
    // Chat
    'chat.title': 'Chat with Shree Alankar Assistant',
    'chat.placeholder': 'Type your message...',
    'chat.quickQuestions': '💡 Quick Questions - Click to ask:',
    'chat.greeting': '🙏 Namaste! Welcome to Shree Alankar - Your trusted jewelry partner since 1998. How may I assist you today?',
    'chat.hello': '🙏 Hello! Welcome to Shree Alankar! I\'m here to help you with all your jewelry needs. Please feel free to ask any questions or select from the quick questions below.',
    
    // Questions
    'question.hours': 'What are your business hours?',
    'question.custom': 'Do you offer custom jewelry design?',
    'question.rates': 'How often are gold and silver rates updated?',
    'question.valuation': 'Do you provide jewelry valuation services?',
    'question.types': 'What types of jewelry do you sell?',
    'question.coins': 'Do you offer gold coins and bars?',
    'question.return': 'What is your return policy?',
    'question.repair': 'Do you provide jewelry repair services?',
    'question.checkRates': 'How can I check current gold rates?',
    'question.wedding': 'Do you offer wedding jewelry collections?',
    'question.certificates': 'What certifications do you provide?',
    'question.online': 'Do you offer online shopping?',
    
    // Responses
    'response.hours': 'We are open daily from 9:00 AM to 7:30 PM. We\'re located at Shree Alankar, Near Bank Of Maharashtra, Lohoner.',
    'response.custom': 'Yes, we offer custom jewelry design services! Please visit our store or contact us to discuss your requirements. Our experienced craftsmen can create unique pieces tailored to your preferences.',
    'response.rates': 'Our rates are updated daily based on market fluctuations. You can always check the latest rates on our homepage or call us at 9921612155 for current pricing.',
    'response.valuation': 'Yes, we provide jewelry valuation services. Please bring your items to our store during business hours for professional assessment.',
    'response.types': 'We offer a wide range of jewelry including gold ornaments, silver jewelry, diamond pieces, traditional Indian jewelry, modern designs, rings, necklaces, earrings, bracelets, and more.',
    'response.coins': 'Yes, we deal in gold coins and bars of various weights and purities. Please visit our store or contact us for current availability and pricing.',
    'response.return': 'We have a customer-friendly return policy. Please contact us at 9921612155 or visit our store to discuss specific return requirements for your purchase.',
    'response.repair': 'Yes, we provide professional jewelry repair and maintenance services. Our skilled craftsmen can handle various types of repairs and restorations.',
    'response.checkRates': 'You can check current gold and silver rates by visiting our website, calling us at 9921612155, or visiting our store. Rates are updated daily.',
    'response.wedding': 'Absolutely! We specialize in wedding jewelry collections including bridal sets, mangalsutras, bangles, and complete bridal jewelry ensembles.',
    'response.certificates': 'We provide proper certifications and bills for all our jewelry purchases. For precious stones and diamonds, we also provide relevant quality certificates.',
    'response.online': 'Currently, we recommend visiting our store for the best experience. However, you can contact us at 9921612155 to discuss specific requirements and availability.',
    'response.default': 'Thank you for your question! For detailed information, please contact us at 9921612155 or visit our store at Shree Alankar, Near Bank Of Maharashtra, Lohoner. Our team will be happy to assist you personally.',
    
    // Footer
    'footer.title': 'Shree Alankar',
    'footer.subtitle': 'Fine Jewelry Seller Since 1998',
    'footer.copyright': '© 2024 Shree Alankar. All rights reserved.',
    
    // Social Links
    'social.website': 'Visit Our Website',
    'social.instagram': 'Follow on Instagram',
    'social.youtube': 'Subscribe YouTube',
    
    // Language Selector
    'language.title': 'Select Language / भाषा निवडा',
    'language.english': 'English',
    'language.marathi': 'मराठी',
    'language.continue': 'Continue',
    'language.select': 'Please select your preferred language'
  },
  marathi: {
    // Header
    'header.title': 'श्री अलंकार',
    'header.subtitle': '१९९८ पासून उत्कृष्ट दागिने विक्रेता',
    'header.customerSupport': 'ग्राहक सेवा',
    
    // Welcome Section
    'welcome.title': 'श्री अलंकार चॅटबॉट सहाय्यकामध्ये आपले स्वागत',
    'welcome.subtitle': 'दागिन्यांच्या सर्व प्रश्नांसाठी आपली २४/७ ग्राहक सेवा',
    'welcome.contact': 'संपर्क: ९९२१६१२१५५',
    'welcome.address': 'श्री अलंकार, बँक ऑफ महाराष्ट्र जवळ, लोहोनेर',
    'welcome.hours': 'दररोज सकाळी ९:०० ते संध्याकाळी ७:३०',
    
    // Chat
    'chat.title': 'श्री अलंकार सहाय्यकाशी संवाद',
    'chat.placeholder': 'आपला संदेश टाइप करा...',
    'chat.quickQuestions': '💡 त्वरित प्रश्न - विचारण्यासाठी क्लिक करा:',
    'chat.greeting': '🙏 नमस्कार! श्री अलंकारमध्ये आपले स्वागत - १९९८ पासून आपला विश्वसनीय दागिने भागीदार. आज मी आपली कशी मदत करू शकतो?',
    'chat.hello': '🙏 नमस्कार! श्री अलंकारमध्ये आपले स्वागत! मी आपल्या सर्व दागिन्यांच्या गरजांमध्ये मदत करण्यासाठी येथे आहे. कृपया कोणतेही प्रश्न विचारण्यास मोकळ्या मनाने किंवा खालील त्वरित प्रश्न निवडा.',
    
    // Questions
    'question.hours': 'आपले व्यवसायिक वेळा काय आहेत?',
    'question.custom': 'तुम्ही सानुकूल दागिने डिझाइन ऑफर करता का?',
    'question.rates': 'सोने आणि चांदीचे दर कितीदा अपडेट होतात?',
    'question.valuation': 'तुम्ही दागिन्यांचे मूल्यांकन सेवा प्रदान करता का?',
    'question.types': 'तुम्ही कोणत्या प्रकारचे दागिने विकता?',
    'question.coins': 'तुम्ही सोन्याची नाणी आणि बार ऑफर करता का?',
    'question.return': 'तुमची परतावा धोरण काय आहे?',
    'question.repair': 'तुम्ही दागिन्यांच्या दुरुस्तीच्या सेवा प्रदान करता का?',
    'question.checkRates': 'मी सध्याचे सोन्याचे दर कसे तपासू शकतो?',
    'question.wedding': 'तुम्ही लग्नाच्या दागिन्यांचे संग्रह ऑफर करता का?',
    'question.certificates': 'तुम्ही कोणती प्रमाणपत्रे प्रदान करता?',
    'question.online': 'तुम्ही ऑनलाइन खरेदी ऑफर करता का?',
    
    // Responses
    'response.hours': 'आम्ही दररोज सकाळी ९:०० ते संध्याकाळी ७:३० पर्यंत उघडे आहोत. आम्ही श्री अलंकार, बँक ऑफ महाराष्ट्र जवळ, लोहोनेर येथे आहोत.',
    'response.custom': 'होय, आम्ही सानुकूल दागिने डिझाइन सेवा ऑफर करतो! कृपया आमच्या दुकानाला भेट द्या किंवा आपल्या आवश्यकतांबद्दल चर्चा करण्यासाठी आमच्याशी संपर्क साधा. आमचे अनुभवी कारागीर आपल्या पसंतीनुसार अनन्य तुकडे तयार करू शकतात.',
    'response.rates': 'आमचे दर बाजारातील चढउतारांच्या आधारे दररोज अपडेट केले जातात. तुम्ही आमच्या होमपेजवर नवीनतम दर तपासू शकता किंवा सध्याच्या किंमतीसाठी ९९२१६१२१५५ वर कॉल करू शकता.',
    'response.valuation': 'होय, आम्ही दागिन्यांचे मूल्यांकन सेवा प्रदान करतो. कृपया व्यावसायिक मूल्यांकनासाठी व्यवसायिक वेळेत आपली वस्तू आमच्या दुकानात आणा.',
    'response.types': 'आम्ही सोन्याचे अलंकार, चांदीचे दागिने, हिरे तुकडे, पारंपारिक भारतीय दागिने, आधुनिक डिझाइन, रिंग, हार, कानातले, कंकणे आणि बरेच काही यासह दागिन्यांची विस्तृत श्रेणी ऑफर करतो.',
    'response.coins': 'होय, आम्ही विविध वजन आणि शुद्धतेच्या सोन्याच्या नाण्या आणि बारमध्ये व्यवहार करतो. कृपया सध्याच्या उपलब्धता आणि किंमतीसाठी आमच्या दुकानाला भेट द्या किंवा आमच्याशी संपर्क साधा.',
    'response.return': 'आमची ग्राहक-अनुकूल परतावा धोरण आहे. कृपया ९९२१६१२१५५ वर आमच्याशी संपर्क साधा किंवा आपल्या खरेदीच्या विशिष्ट परतावा आवश्यकतांवर चर्चा करण्यासाठी आमच्या दुकानाला भेट द्या.',
    'response.repair': 'होय, आम्ही व्यावसायिक दागिने दुरुस्ती आणि देखभाल सेवा प्रदान करतो. आमचे कुशल कारागीर विविध प्रकारच्या दुरुस्ती आणि जीर्णोद्धार हाताळू शकतात.',
    'response.checkRates': 'तुम्ही आमची वेबसाइट भेट देऊन, ९९२१६१२१५५ वर आम्हाला कॉल करून किंवा आमच्या दुकानाला भेट देऊन सध्याचे सोने आणि चांदीचे दर तपासू शकता. दर दररोज अपडेट केले जातात.',
    'response.wedding': 'नक्कीच! आम्ही वधूचे सेट, मंगळसूत्र, कंकणे आणि संपूर्ण वधूचे दागिने संच यासह लग्नाच्या दागिन्यांच्या संग्रहात विशेषज्ञ आहोत.',
    'response.certificates': 'आम्ही आमच्या सर्व दागिन्यांच्या खरेदीसाठी योग्य प्रमाणपत्रे आणि बिले प्रदान करतो. मौल्यवान दगड आणि हिरे यासाठी आम्ही संबंधित गुणवत्ता प्रमाणपत्रे देखील प्रदान करतो.',
    'response.online': 'सध्या, आम्ही सर्वोत्तम अनुभवासाठी आमच्या दुकानाला भेट देण्याची शिफारस करतो. तथापि, विशिष्ट आवश्यकता आणि उपलब्धतेवर चर्चा करण्यासाठी तुम्ही ९९२१६१२१५५ वर आमच्याशी संपर्क साधू शकता.',
    'response.default': 'आपल्या प्रश्नासाठी धन्यवाद! तपशीलवार माहिती यासाठी, कृपया ९९२१६१२१५५ वर आमच्याशी संपर्क साधा किंवा श्री अलंकार, बँक ऑफ महाराष्ट्र जवळ, लोहोनेर येथील आमच्या दुकानाला भेट द्या. आमची टीम आपल्याला व्यक्तिशः मदत करण्यास आनंदित असेल.',
    
    // Footer
    'footer.title': 'श्री अलंकार',
    'footer.subtitle': '१९९८ पासून उत्कृष्ट दागिने विक्रेता',
    'footer.copyright': '© २०२४ श्री अलंकार. सर्व हक्क राखीव.',
    
    // Social Links
    'social.website': 'आमची वेबसाइट पहा',
    'social.instagram': 'इन्स्टाग्रामवर फॉलो करा',
    'social.youtube': 'यूट्यूब सब्सक्राइब करा',
    
    // Language Selector
    'language.title': 'Select Language / भाषा निवडा',
    'language.english': 'English',
    'language.marathi': 'मराठी',
    'language.continue': 'पुढे',
    'language.select': 'कृपया आपली पसंतीची भाषा निवडा'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('english');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
