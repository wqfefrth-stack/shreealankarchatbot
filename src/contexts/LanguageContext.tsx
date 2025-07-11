
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'english' | 'marathi';

interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>((localStorage.getItem('language') as Language) || 'english');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const translations = {
    english: {
      language: "English",
      chat: {
        title: "Chat with us",
        greeting: "Hello! How can I assist you today?",
        placeholder: "Type your message...",
        quickQuestions: "Here are some quick questions you can ask:",
        hello: "Hello! How can I help you? Here are some quick questions you can ask:"
      },
      question: {
        hours: "What are your opening hours?",
        custom: "Do you offer custom jewelry design?",
        rates: "What are the current gold and silver rates?",
        valuation: "Can you provide a valuation for my jewelry?",
        types: "What types of jewelry do you offer?",
        coins: "Do you sell gold or silver coins?",
        return: "What is your return policy?",
        repair: "Do you offer jewelry repair services?",
        checkRates: "How can I check today's gold and silver rates?",
        wedding: "Do you have a wedding jewelry collection?",
        certificates: "Are your diamonds certified?",
        online: "Can I purchase jewelry online?"
      },
      header: {
        title: "Shree Alankar Jewellers",
        subtitle: "Premium Gold & Silver Jewelry",
        customerSupport: "WhatsApp Support"
      },
      welcome: {
        title: "Welcome to Shree Alankar Jewellers",
        subtitle: "Your trusted partner for exquisite gold and silver jewelry since generations",
        contact: "+91 9921612155",
        address: "Near Bank Of Maharashtra, Lohoner 423301",
        hours: "9:00 AM - 7:30 PM Daily",
        mapLink: "View on Google Maps"
      },
      social: {
        website: "Visit Our Website",
        instagram: "Follow us on Instagram",
        youtube: "Subscribe on YouTube"
      },
      footer: {
        title: "Shree Alankar Jewellers",
        subtitle: "Premium Gold & Silver Jewelry",
        copyright: "© 2024 Shree Alankar Jewellers. All rights reserved."
      },
      response: {
        hours: "🕒 **Business Hours:**\n\n📅 **Daily:** 9:00 AM to 7:30 PM\n\n📍 **Location:** Shree Alankar, Near Bank Of Maharashtra, Lohoner 423301\n\n🗺️ **Google Maps:** https://maps.app.goo.gl/iuRDm7NZECG4no1RA\n\n📞 **Contact:** +91 9921612155\n\nWe're open every day to serve you with the finest jewelry collection!",
        custom: "💍 Yes, we offer custom jewelry design services! Bring in your ideas, and our skilled artisans will craft a unique piece just for you.",
        rates: "💰 Current gold and silver rates can vary. Please check our website or contact us directly for the most up-to-date information.",
        valuation: "💎 Yes, we provide jewelry valuation services. Our experts will assess your jewelry and provide an accurate appraisal.",
        types: "✨ We offer a wide range of jewelry, including gold, silver, diamond, and gemstone pieces. Visit our store to explore our collection!",
        coins: "🪙 Yes, we sell gold and silver coins. They are available in various weights and purities.",
        return: "↩️ Our return policy allows returns within [number] days with the original receipt. Please see our full policy for details.",
        repair: "🛠️ Yes, we offer jewelry repair services. Our experienced jewelers can fix your precious pieces with care.",
        checkRates: "🌐 You can check today's gold and silver rates on our website or by contacting our store directly.",
        wedding: "👰 We have an exquisite wedding jewelry collection, including bridal sets, rings, and necklaces. Visit us to find the perfect pieces for your special day!",
        certificates: "✅ Yes, our diamonds are certified by reputable gemological labs, ensuring their quality and authenticity.",
        online: "💻 Currently, we do not offer online purchasing. However, you can browse our catalog online and visit our store to make a purchase."
      }
    },
    marathi: {
      language: "मराठी",
      chat: {
        title: "आमच्याशी चॅट करा",
        greeting: "नमस्कार! मी तुम्हाला आज कशी मदत करू शकतो?",
        placeholder: "तुमचा संदेश टाइप करा...",
        quickQuestions: "तुम्ही विचारू शकता असे काही झटपट प्रश्न येथे आहेत:",
        hello: "नमस्कार! मी तुम्हाला कशी मदत करू शकतो? तुम्ही विचारू शकता असे काही झटपट प्रश्न येथे आहेत:"
      },
      question: {
        hours: "तुमचे व्यावसायिक तास काय आहेत?",
        custom: "तुम्ही कस्टम ज्वेलरी डिझाइन ऑफर करता का?",
        rates: "सोन्याचे आणि चांदीचे सध्याचे दर काय आहेत?",
        valuation: "तुम्ही माझ्या ज्वेलरीसाठी मूल्यांकन देऊ शकता का?",
        types: "तुम्ही कोणत्या प्रकारची ज्वेलरी ऑफर करता?",
        coins: "तुम्ही सोने किंवा चांदीची नाणी विकता का?",
        return: "तुमची रिटर्न पॉलिसी काय आहे?",
        repair: "तुम्ही ज्वेलरी दुरुस्ती सेवा पुरवता का?",
        checkRates: "मी आजचे सोने आणि चांदीचे दर कसे तपासू शकतो?",
        wedding: "तुमच्याकडे वेडिंग ज्वेलरी कलेक्शन आहे का?",
        certificates: "तुमचे हिरे प्रमाणित आहेत का?",
        online: "मी ऑनलाइन ज्वेलरी खरेदी करू शकतो का?"
      },
      header: {
        title: "श्री अलंकार ज्वेलर्स",
        subtitle: "प्रीमियम सोने आणि चांदीचे दागिने",
        customerSupport: "WhatsApp सपोर्ट"
      },
      welcome: {
        title: "श्री अलंकार ज्वेलर्स मध्ये आपले स्वागत",
        subtitle: "पिढ्यानपिढ्या आपले विश्वसनीय भागीदार उत्कृष्ट सोने आणि चांदीच्या दागिन्यांसाठी",
        contact: "+91 9921612155",
        address: "बँक ऑफ महाराष्ट्र जवळ, लोहोनेर 423301",
        hours: "सकाळी 9:00 - संध्याकाळी 7:30 दररोज",
        mapLink: "गूगल मॅप्सवर पहा"
      },
      social: {
        website: "आमच्या वेबसाइटला भेट द्या",
        instagram: "Instagram वर फॉलो करा",
        youtube: "YouTube वर सदस्यता घ्या"
      },
      footer: {
        title: "श्री अलंकार ज्वेलर्स",
        subtitle: "प्रीमियम सोने आणि चांदीचे दागिने",
        copyright: "© 2024 श्री अलंकार ज्वेलर्स. सर्व हक्क राखीव."
      },
      response: {
        hours: "🕒 **व्यावसायिक वेळ:**\n\n📅 **दररोज:** सकाळी 9:00 ते संध्याकाळी 7:30\n\n📍 **स्थान:** श्री अलंकार, बँक ऑफ महाराष्ट्र जवळ, लोहोनेर 423301\n\n🗺️ **गूगल मॅप्स:** https://maps.app.goo.gl/iuRDm7NZECG4no1RA\n\n📞 **संपर्क:** +91 9921612155\n\nआम्ही दररोज उपलब्ध आहोत तुमच्या सेवेसाठी उत्कृष्ट दागिन्यांच्या संग्रहासह!",
        custom: "💍 होय, आम्ही कस्टम ज्वेलरी डिझाइन सेवा ऑफर करतो! तुमच्या कल्पना आणा, आणि आमचे कुशल कारागीर तुमच्यासाठी एक अद्वितीय तुकडा तयार करतील.",
        rates: "💰 सोन्याचे आणि चांदीचे सध्याचे दर बदलू शकतात. कृपया नवीनतम माहितीसाठी आमच्या वेबसाइटला भेट द्या किंवा आमच्याशी थेट संपर्क साधा.",
        valuation: "💎 होय, आम्ही ज्वेलरी मूल्यांकन सेवा प्रदान करतो. आमचे तज्ञ तुमच्या ज्वेलरीचे मूल्यांकन करतील आणि अचूक मूल्यांकन प्रदान करतील.",
        types: "✨ आम्ही सोन्याचे, चांदीचे, हिऱ्यांचे आणि रत्नांचे दागिने विविध प्रकारात ऑफर करतो. आमचा संग्रह पाहण्यासाठी आमच्या स्टोअरला भेट द्या!",
        coins: "🪙 होय, आम्ही सोने आणि चांदीची नाणी विकतो. ते विविध वजनात आणि शुद्धतेत उपलब्ध आहेत.",
        return: "↩️ आमच्या रिटर्न पॉलिसीनुसार मूळ पावतीसह [number] दिवसांच्या आत रिटर्न्स स्वीकारले जातात. तपशीलांसाठी कृपया आमची संपूर्ण पॉलिसी पहा.",
        repair: "🛠️ होय, आम्ही ज्वेलरी दुरुस्ती सेवा पुरवतो. आमचे अनुभवी ज्वेलर्स तुमच्या मौल्यवान वस्तूंची काळजीपूर्वक दुरुस्ती करू शकतात.",
        checkRates: "🌐 तुम्ही आजचे सोन्याचे आणि चांदीचे दर आमच्या वेबसाइटवर तपासू शकता किंवा आमच्या स्टोअरशी थेट संपर्क साधू शकता.",
        wedding: "👰 आमच्याकडे उत्कृष्ट वेडिंग ज्वेलरी कलेक्शन आहे, ज्यात ब्राइडल सेट्स, अंगठ्या आणि नेकलेस समाविष्ट आहेत. तुमच्या विशेष दिवसासाठी योग्य वस्तू शोधण्यासाठी आम्हाला भेट द्या!",
        certificates: "✅ होय, आमचे हिरे प्रतिष्ठित जेमोलॉजिकल लॅबद्वारे प्रमाणित आहेत, जे त्यांची गुणवत्ता आणि सत्यता सुनिश्चित करतात.",
        online: "💻 सध्या, आम्ही ऑनलाइन खरेदीची सुविधा देत नाही. तथापि, तुम्ही आमची कॅटलॉग ऑनलाइन ब्राउझ करू शकता आणि खरेदी करण्यासाठी आमच्या स्टोअरला भेट देऊ शकता."
      }
    }
  };

  const t = useCallback((key: string) => {
    return translations[language as keyof typeof translations]?.[key] || key;
  }, [language]);

  const value: LanguageContextProps = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
