import React from 'react';
import Btn from '../../components/Button/Button';
import { translate } from '../../utils/translationUtil';
import { useLanguage } from '../../contexts/LanguageContext';

interface RegistrationButtonsProps {
  activeTabOther: string;
  message: string;
  handleTabsClick: (tab: string) => void;
  buttonConfig: Array<{ labelKey: string; tabKey: string }>;
}

const RegistrationButtons: React.FC<RegistrationButtonsProps> = ({
  activeTabOther,
  message,
  handleTabsClick,
  buttonConfig, 
}) => {
  const { language } = useLanguage();

  return (
    <div>
      <div className='RegistrationButtons_btn_cont'>
        {buttonConfig.map((button, index) => (
          <Btn
            key={index}
            label={translate(button.labelKey, language)}
            onClick={() => handleTabsClick(button.tabKey)}
            className={
              activeTabOther === button.tabKey
                ? 'body-btn-active body-btn'
                : 'body-btn'
            }
          />
        ))}
      </div>
      <div className="RegistrationButtons_title_container">
        <div className='RegistrationButtons_title_table_cont'>
          <p className='RegistrationButtons_title'>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationButtons;
