import React, { useState } from "react";
import { Globe, Check } from "lucide-react";

const languages = [
  { 
    id: "english", 
    name: "English", 
    nativeName: "English",
    translations: {
      title: "Language Settings",
      note: "Language changes will update all text, formulas, and unit labels. Some chemical formulas remain in international notation.",
      apply: "Apply Language"
    }
  },
  { 
    id: "chinese", 
    name: "Chinese", 
    nativeName: "中文",
    translations: {
      title: "语言设置",
      note: "语言更改将更新所有文本、公式和单位标签。某些化学公式保持国际记号。",
      apply: "应用语言"
    }
  },
  { 
    id: "hindi", 
    name: "Hindi", 
    nativeName: "हिन्दी",
    translations: {
      title: "भाषा सेटिंग्स",
      note: "भाषा परिवर्तन सभी पाठ, सूत्र और इकाई लेबल को अपडेट करेगा। कुछ रासायनिक सूत्र अंतर्राष्ट्रीय संकेतन में रहते हैं।",
      apply: "भाषा लागू करें"
    }
  },
  { 
    id: "french", 
    name: "French", 
    nativeName: "Français",
    translations: {
      title: "Paramètres de langue",
      note: "Les changements de langue mettront à jour tout le texte, les formules et les étiquettes d'unités. Certaines formules chimiques restent en notation internationale.",
      apply: "Appliquer la langue"
    }
  },
  { 
    id: "russian", 
    name: "Russian", 
    nativeName: "Русский",
    translations: {
      title: "Настройки языка",
      note: "Изменения языка обновят весь текст, формулы и метки единиц. Некоторые химические формулы остаются в международной нотации.",
      apply: "Применить язык"
    }
  },
  { 
    id: "arabic", 
    name: "Arabic", 
    nativeName: "العربية",
    translations: {
      title: "إعدادات اللغة",
      note: "ستؤدي تغييرات اللغة إلى تحديث جميع النصوص والصيغ وتسميات الوحدات. تبقى بعض الصيغ الكيميائية بالتدوين الدولي.",
      apply: "تطبيق اللغة"
    }
  }
];

export default function LanguageSettings() {
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [appliedLanguage, setAppliedLanguage] = useState("english");

  const currentLang = languages.find(lang => lang.id === appliedLanguage);
  const selectedLangData = languages.find(lang => lang.id === selectedLanguage);

  const applyLanguage = () => {
    setAppliedLanguage(selectedLanguage);
    // Here you would typically update the app's language context
    // For now, we just show the effect in the UI
  };

  return (
    <div className="space-y-6" dir={appliedLanguage === 'arabic' ? 'rtl' : 'ltr'}>
      <h2 className="text-xl font-bold text-gray-900">{currentLang?.translations.title || "Language Settings"}</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {languages.map((language, index) => (
          <div
            key={language.id}
            className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              index !== languages.length - 1 ? "border-b border-gray-200" : ""
            } ${selectedLanguage === language.id ? "bg-blue-50 border-blue-200" : ""}`}
            onClick={() => setSelectedLanguage(language.id)}
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  {language.name}
                  {appliedLanguage === language.id && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div className="text-sm text-gray-600">{language.nativeName}</div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 transition-colors ${
              selectedLanguage === language.id ? "bg-blue-600 border-blue-600" : "border-gray-300"
            }`}>
              {selectedLanguage === language.id && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedLanguage !== appliedLanguage && (
        <div className="flex justify-end">
          <button
            onClick={applyLanguage}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {selectedLangData?.translations.apply || "Apply Language"}
          </button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> {currentLang?.translations.note || "Language changes will update all text, formulas, and unit labels. Some chemical formulas remain in international notation."}
        </p>
      </div>
    </div>
  );
}
