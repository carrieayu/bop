// MessageAlert.tsx
import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';


interface MessageAlertProps {
    code: number;
    message: string;
    customIcon?: React.ReactNode;
    iconPosition?: "left" | "right";
    borderRadius?: number;
    className?: string;
    onRemove?: () => void;
}

const MessageAlert: React.FC<MessageAlertProps> = ({
    code,
    message,
    customIcon,
    iconPosition = "left",
    borderRadius = 4,
    className = '',
    onRemove,
}) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleTransitionEnd = () => {
        if (!visible && onRemove) {
            onRemove();
        }
    };

    return (
        <div
            className={`message-alert ${visible ? 'visible' : 'hidden'} ${className}`}
            onTransitionEnd={handleTransitionEnd}
            style={{
                backgroundColor: getColor(code),
                color: getTextColor(code),
            }}
        >
            {customIcon && iconPosition === "left" && (
                <span className="icon-left">
                    {customIcon}
                </span>
            )}
            {getCustomIcon(code)}
            <span> {message}</span>
            {customIcon && iconPosition === "right" && (
                <span className="icon-right">
                    {customIcon}
                </span>
            )}
        </div>
    );
};

const getTextColor = (code: number): string => {
    if (code >= 200 && code < 300) {
        return "#155724"; 
    } else if (code >= 300 && code < 400) {
        return "#856404"; 
    } else if (code >= 400 && code < 600) {
        return "#721c24";
    } else {
        return "#721c24"; 
    }
};
const getColor = (code: number): string => {
    if (code >= 200 && code < 300) {
        return "#d4edda"; 
    } else if (code >= 300 && code < 400) {
        return "#ffeeba"; 
    } else if (code >= 400 && code < 600) {
        return "#f8d7da"; 
    } else {
        return "#f8d7da"; 
    }
};

const getCustomIcon = (code: number): React.ReactNode => {
    if (code >= 200 && code < 300) {
            return <FaCheckCircle />;
    } else if (code >= 300 && code < 400) {
        return <FaExclamationTriangle />;
    } else if (code >= 400 && code < 600) {
        return <FaTimesCircle />;
    }else{
        return <FaTimesCircle />;
    }
};

export default MessageAlert;
