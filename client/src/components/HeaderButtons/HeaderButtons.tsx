// src/components/HeaderButtons/HeaderButtons.tsx
import React, { useState } from 'react'
import Btn from '../Button/Button'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { TbLogout } from 'react-icons/tb'
import AlertModal from '../AlertModal/AlertModal'
import { closeModal, openModal } from '../../actions/hooks'
import { token } from '../../constants'
interface HeaderButtonsProps {
  activeTab: string
  handleTabClick: (tab: string) => void
  isTranslateSwitchActive: boolean
  handleTranslationSwitchToggle: () => void
}

const HeaderButtons: React.FC<HeaderButtonsProps> = ({
  activeTab,
  handleTabClick,
  isTranslateSwitchActive,
  handleTranslationSwitchToggle,
}) => {
  const { language } = useLanguage()
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const handleCloseModal = () => closeModal(setModalIsOpen)
  const handleConfirm = async () => {
    localStorage.removeItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }
    setModalIsOpen(false)
  }

  return (
    <div className='HeaderButtons_header_cont'>
      <div className='HeaderButtons_header-buttons'>
        <Btn
          label={translate('analysis', language)}
          onClick={() => handleTabClick('/dashboard')}
          className={activeTab === '/dashboard' ? 'h-btn-active header-btn' : 'header-btn'}
        />
        <Btn
          label={translate('profitAndlossPlanning', language)}
          onClick={() => handleTabClick('/planning-list')}
          className={activeTab === '/planning-list' ? 'h-btn-active header-btn' : 'header-btn'}
        />
        <Btn
          label={translate('results', language)}
          onClick={() => handleTabClick('/results')}
          className={activeTab === '/results' ? 'h-btn-active header-btn' : 'header-btn'}
        />
      </div>
      <div className='HeaderButtons_language-toggle'>
        {isTranslateSwitchActive ? (
          <p className='HeaderButtons_pl-label'>English</p>
        ) : (
          <p className='HeaderButtons_pl-label'>日本語</p>
        )}
        <label className='HeaderButtons_switch'>
          <input type='checkbox' checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle} />
          <span className='HeaderButtons_slider'></span>
        </label>
        <TbLogout className='logout-icon' onClick={() => openModal(setModalIsOpen)} />
        <div>
          <AlertModal
            isOpen={modalIsOpen}
            onConfirm={handleConfirm}
            onCancel={handleCloseModal}
            message={translate('logout', language)}
          />
        </div>
      </div>
    </div>
  )
}

export default HeaderButtons
