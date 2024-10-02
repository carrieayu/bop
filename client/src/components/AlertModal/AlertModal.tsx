import React, { useState } from 'react';
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
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    
    if (!isOpen) return null;

    const handleCancelClick = () => {
        setShowCancelConfirmation(true);
    };

    const handleConfirmCancel = () => {
        setShowCancelConfirmation(false);  
        onCancel();  
    };

    const handleRejectCancel = () => {
        setShowCancelConfirmation(false); 
    };

    return (
        <div>
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
                        onClick={handleCancelClick}
                        className="btn-cancel"
                    />
                </div>
            </div>
        </div>
        {showCancelConfirmation && (
            <div className="alert-modal-overlay">
                <div className="alert-modal-content">
                    <p className="alert-modal-message">
                        {translate('cancelMessage', language)}
                    </p>
                    <div className="alert-modal-buttons">
                        <Btn
                            label={translate('accept', language)}
                            onClick={handleConfirmCancel}
                            className="btn-confirm"
                        />
                        <Btn
                            label={translate('reject', language)}
                            onClick={handleRejectCancel}
                            className="btn-cancel"
                        />
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default AlertModal;
