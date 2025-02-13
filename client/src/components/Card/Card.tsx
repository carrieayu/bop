import React from "react";

interface CardProps {
  backgroundColor?: string;
  shadow?: string;
  border?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  contentClassName?: string;
  CardClassName?: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  backgroundColor = "#fff",
  shadow = "0px 4px 8px rgba(0, 0, 0, 0.1)",
  border = "1px solid #ddd",
  width = "auto", 
  height = "auto",
  borderRadius = "5px",
  contentClassName = "",
  CardClassName = "",
  children,
}: CardProps) => {
  return (
    <div
      className={`card ${CardClassName}`}
      style={{
        backgroundColor: backgroundColor,
        boxShadow: shadow,
        border: border,
        borderRadius: borderRadius,
        width: typeof width === 'number'? `${width}px` : width,
        height: typeof height === 'number'? `${height}px` : height,
      }}
    >
      <div className={`custom ${contentClassName}`}>
        {children}
      </div>
      
    </div>
  );
};

export default Card;
