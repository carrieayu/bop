import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil';

interface CrudModalProps {
  message: string;
  onClose: () => void;
  isCRUDOpen: boolean;
}

const CrudModal: React.FC<CrudModalProps> = ({ message, onClose, isCRUDOpen }) => {
  const { language } = useLanguage();

  if (!isCRUDOpen) return null;

  return (
    <div className="Crud_alert-modal-overlay">
      <div className="Crud_alert-modal-content">
        <p className="Crud_alert-modal-message">{message}</p>
        <button className="Crud_close-button" onClick={onClose}>
          {translate('close', language)}
        </button>
      </div>
    </div>
  );
};

export default CrudModal;
