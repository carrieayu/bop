import React from 'react'

// Define props for the reusable button component
interface ButtonProps {
  label: string
  onClick: (...args: any[]) => void
  customIcon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  borderRadius?: number
  size?: 'small' | 'normal' | 'medium' | 'large'
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const Btn: React.FC<ButtonProps> = ({
  label,
  onClick,
  customIcon,
  iconPosition = "left",
  borderRadius = 100,
  size = "normal",
  className,
  type,
}) => {
  // Determine button class based on size
  const btnClass = 
    size === "small"
      ? "is-small"
      : size === "medium"
      ? "is-medium"
      : size === "large"
      ? "is-large"
      : "";
  
  // Determine icon position Class
  const iconClass = iconPosition === "right" ? "icon is-small is-right" : "icon is-small is-left";
  

  return (
    <button className={`button ${btnClass} ${className}`} onClick={onClick} style={{ borderRadius }} type={type}>
      {customIcon && iconPosition === "left" && (
        <span className={iconClass} style={{ marginRight: '5px' }}>
          {customIcon}
        </span>
      )}
      {label}
      {customIcon && iconPosition === "right" && (
        <span className={iconClass} style={{ marginLeft: '5px' }}>
          {customIcon}
        </span>
      )}
    </button>
  );
};

export default Btn
