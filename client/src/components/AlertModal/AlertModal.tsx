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
    const [showConfirmConfirmation, setShowConfirmConfirmation] = useState(false);
    
    if (!isOpen) return null;

    const handleConfirmClick = () => {
        setShowConfirmConfirmation(true);
    };

    const handleConfirmAccept = () => {
        setShowConfirmConfirmation(false);  
        onConfirm();  
    };

    const handleRejectConfirm = () => {
        setShowConfirmConfirmation(false); 
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
                            onClick={handleConfirmClick}
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
            {showConfirmConfirmation && (
                <div className="alert-modal-overlay">
                    <div className="alert-modal-content">
                        <p className="alert-modal-message">
                            {translate('confirmationMessage', language)}
                        </p>
                        <div className="alert-modal-buttons">
                            <Btn
                                label={translate('accept', language)}
                                onClick={handleConfirmAccept}
                                className="btn-confirm"
                            />
                            <Btn
                                label={translate('reject', language)}
                                onClick={handleRejectConfirm}
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
