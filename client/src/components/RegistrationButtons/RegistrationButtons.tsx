import React from 'react'
import Btn from '../../components/Button/Button'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'

interface RegistrationButtonsProps {
  activeTabOther: string
  message: string
  handleTabsClick: (tab: string, navigate: (path: string) => void, setActiveTabOther: (tab: string) => void) => void
  handleListClick: () => void
  buttonConfig: Array<{ labelKey: string; tabKey: string }>
}

const RegistrationButtons: React.FC<RegistrationButtonsProps> = ({
  activeTabOther,
  message,
  handleTabsClick,
  handleListClick,
  buttonConfig,
}) => {
  const { language } = useLanguage()
  const navigate = useNavigate() // Get navigate from react-router
  const setActiveTabOther = (tab: string) => {
    console.log(`Active tab set to: ${tab}`)
    // Implement your tab state update logic here
  }
  return (
    <div>
      <div className='RegistrationButtons_btn_cont'>
        {buttonConfig.map((button, index) => (
          <Btn
            key={index}
            label={translate(button.labelKey, language)}
            onClick={() => handleTabsClick(button.tabKey, navigate, setActiveTabOther)}
            className={activeTabOther === button.tabKey ? 'body-btn-active body-btn' : 'body-btn'}
          />
        ))}
      </div>
      <div className='RegistrationButtons_title_container'>
        <div className='RegistrationButtons_title_table_cont'>
          <p className='RegistrationButtons_title'>{message}</p>
        </div>
        <div className='RegistrationButtons_title_btn_cont'>
          <Btn
            label={translate('listScreen', language)}
            size='normal'
            onClick={handleListClick}
            className='RegistrationButtons_btn'
          />
        </div>
      </div>
    </div>
  )
}

export default RegistrationButtons
