// translations.ts
import generalWordsEn from '../translations/general_words_en.json';
import generalWordsJp from '../translations/general_words_jp.json';
import financialWordsEn from '../translations/financial_words_en.json';
import financialWordsJp from '../translations/financial_words_jp.json';
import validationErrorsEn from '../translations/validation_errors_en.json';
import validationErrorsJP from '../translations/validation_errors_jp.json';
import screenNamesWordsEn from '../translations/screenNames_words_en.json';
import screenNamesWordsJp from '../translations/screenNames_words_jp.json';

type Language = 'en' | 'jp';

const translations = {
    en: { 
        ...generalWordsEn, 
        ...financialWordsEn, 
        ...validationErrorsEn,
        ...screenNamesWordsEn,
        
      },
      jp: { 
        ...generalWordsJp, 
        ...financialWordsJp, 
        ...validationErrorsJP,
        ...screenNamesWordsJp,
      }
};

export const translate = (key: string, language: Language, variables?: { [key: string]: string }): string => {
  // Get the translation string from the translations object
  let translation = translations[language][key] || key

  // If variables are provided, replace the placeholders in the translation string
  if (variables) {
    Object.keys(variables).forEach((variable) => {
      const placeholder = `{${variable}}`
      translation = translation.replace(new RegExp(placeholder, 'g'), variables[variable])
    })
  }

  return translation
}

