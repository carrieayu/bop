import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil';

interface CrudModalProps {
  message: string;
  onClose: () => void;
  isCRUDOpen: boolean;
  validationMessages?: string[];
}

const CrudModal: React.FC<CrudModalProps> = ({ message, onClose, isCRUDOpen, validationMessages }) => {
  const { language } = useLanguage();

  if (!isCRUDOpen) return null;

  return (
    <div className='Crud_alert-modal-overlay'>
      <div className='Crud_alert-modal-content'>
        {validationMessages && validationMessages.length > 0 ? (
          validationMessages.map((msg, index) => (
            <div className="crud_alert_validation_error_list_container">
              <p key={index} className='Crud_alert-modal-message'>
                {msg}
              </p>
            </div>
          ))
        ) : (
          <p className='Crud_alert-modal-message'>{message}</p>
        )}
        <button className='Crud_close-button' onClick={onClose}>
          {translate('close', language)}
        </button>
      </div>
    </div>
  )
};

export default CrudModal;
