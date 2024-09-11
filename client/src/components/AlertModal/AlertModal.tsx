import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil';
import Btn from '../Button/Button';

interface AlertModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isOpen: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({ message, onConfirm, onCancel, isOpen }) => {
    const { language } = useLanguage();
    
    if (!isOpen) return null;

    return (
        <div className="alert-modal-overlay">
            <div className="alert-modal-content">
                <p className="alert-modal-message">
                    {message}
                </p>
                <div className="alert-modal-buttons">
                    <Btn
                        label={translate('confirm', language)}
                        onClick={onConfirm}
                        className="btn-confirm"
                    />
                    <Btn
                        label={translate('cancel', language)}
                        onClick={onCancel}
                        className="btn-cancel"
                    />
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
