// translations.ts
import generalWordsEn from '../translations/general_words_en.json';
import generalWordsJp from '../translations/general_words_jp.json';
import financialWordsEn from '../translations/financial_words_en.json';
import financialWordsJp from '../translations/financial_words_jp.json';
import screenNamesWordsEn from '../translations/screenNames_words_en.json';
import screenNamesWordsJp from '../translations/screenNames_words_jp.json';

type Language = 'en' | 'jp';

const translations = {
    en: { 
        ...generalWordsEn, 
        ...financialWordsEn, 
        ...screenNamesWordsEn,
      },
      jp: { 
        ...generalWordsJp, 
        ...financialWordsJp, 
        ...screenNamesWordsJp,
      }
};

export const translate = (key: string, language: Language): string => {
  return translations[language][key] || key;
};
