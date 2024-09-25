// src/components/HeaderButtons/HeaderButtons.tsx
import React from 'react';
import Btn from '../Button/Button'; 
import { translate } from '../../utils/translationUtil';
import { useLanguage } from '../../contexts/LanguageContext';

interface HeaderButtonsProps {
  activeTab: string;
  handleTabClick: (tab: string) => void;
  isTranslateSwitchActive: boolean;
  handleTranslationSwitchToggle: () => void;
}

const HeaderButtons: React.FC<HeaderButtonsProps> = ({ activeTab, handleTabClick, isTranslateSwitchActive, handleTranslationSwitchToggle }) => {
  const { language } = useLanguage();

  return (
    <div className='HeaderButtons_header_cont'>
      <div className="HeaderButtons_header-buttons">
        <Btn
          label={translate('analysis', language)}
          onClick={() => handleTabClick("/dashboard")}
          className={activeTab === "/dashboard" ? "h-btn-active header-btn" : "header-btn"}
        />
        <Btn
          label={translate('profitAndlossPlanning', language)}
          onClick={() => handleTabClick("/planning-list")}
          className={activeTab === "/planning-list" ? "h-btn-active header-btn" : "header-btn"}
        />
        <Btn
          label={translate('results', language)}
          onClick={() => handleTabClick("/*")}
          className={activeTab === "/*" ? "h-btn-active header-btn" : "header-btn"}
        />
      </div>
      <div className="HeaderButtons_language-toggle">
        <p className="HeaderButtons_pl-label">English</p>
        <label className="HeaderButtons_switch">
          <input type="checkbox" checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle} />
          <span className="HeaderButtons_slider"></span>
        </label>
      </div>
    </div>
  );
}

export default HeaderButtons;
