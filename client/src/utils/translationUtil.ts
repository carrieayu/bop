// translations.ts
import generalWordsEn from '../translations/general_words_en.json';
import generalWordsJp from '../translations/general_words_jp.json';
import financialWordsEn from '../translations/financial_words_en.json';
import financialWordsJp from '../translations/financial_words_jp.json';
import dashboardWordsEn from '../translations/dashboard_words_en.json';
import dashboardWordsJp from '../translations/dashboard_words_jp.json';
import sidebarWordsEn from '../translations/sidebarcomponent_words_en.json';
import sidebarWordsJp from '../translations/sidebarcomponent_words_jp.json';
import tablecomponentsWordsEn from '../translations/tablecomponents_words_en.json';
import tablecomponentsWordsJp from '../translations/tablecomponents_words_jp.json';
import projectWordsEn from '../translations/project_words_en.json';
import projectWordsJp from '../translations/project_words_jp.json';
import personnelWordsEn from '../translations/personnel_words_en.json';
import personnelWordsJp from '../translations/personnel_words_jp.json';
import expensesWordsEn from '../translations/expenses_words_en.json';
import expensesWordsJp from '../translations/expenses_words_jp.json';
import costOfsalesWordsEn from '../translations/costOfsales_words_en.json';
import costOfsalesWordsJp from '../translations/costOfsales_words_jp.json';

type Language = 'en' | 'jp';

const translations = {
    en: { 
        ...generalWordsEn, 
        ...financialWordsEn, 
        ...dashboardWordsEn,
        ...sidebarWordsEn,
        ...tablecomponentsWordsEn,
        ...projectWordsEn,
        ...personnelWordsEn,
        ...expensesWordsEn,
        ...costOfsalesWordsEn,
      },
      jp: { 
        ...generalWordsJp, 
        ...financialWordsJp, 
        ...dashboardWordsJp,
        ...sidebarWordsJp,
        ...tablecomponentsWordsJp,
        ...projectWordsJp,
        ...personnelWordsJp,
        ...expensesWordsJp,
        ...costOfsalesWordsJp,
      }
};

export const translate = (key: string, language: Language): string => {
  return translations[language][key] || key;
};
