import React from 'react';
import Btn from '../../components/Button/Button';
import { translate } from '../../utils/translationUtil';
import { useLanguage } from '../../contexts/LanguageContext';

interface ListButtonsProps {
  activeTabOther: string;
  message: string;
  handleTabsClick: (tab: string) => void;
  handleNewRegistrationClick: () => void;
  buttonConfig: Array<{ labelKey: string; tabKey: string }>;
}

const ListButtons: React.FC<ListButtonsProps> = ({
  activeTabOther,
  message,
  handleTabsClick,
  handleNewRegistrationClick,
  buttonConfig, 
}) => {
  const { language } = useLanguage();

  return (
    <div>
      <div className='ListButtons_btn_cont'>
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
      <div className="ListButtons_title_container">
        <div className='ListButtons_title_table_cont'>
          <p className='ListButtons_title'>
            {message}
          </p>
        </div>
        <div className="ListButtons_title_btn_cont">
          <Btn
            label={translate('newRegistration', language)}
            size='normal'
            onClick={handleNewRegistrationClick}
            className='ListButtons_btn'
          />
        </div>
      </div>
    </div>
  );
};

export default ListButtons;
