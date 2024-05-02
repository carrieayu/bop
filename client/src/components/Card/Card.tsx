import React from "react";

interface CardProps {
  backgroundColor?: string;
  shadow?: string;
  border?: string;
  width?: string;
  height?: string;
  contentClassName?: string;
  txt1?: string; 
  numtxt?: string; 
  totaltxt?: string;
  txt2?: string; 
  customIcon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  backgroundColor = "#fff",
  shadow = "0px 4px 8px rgba(0, 0, 0, 0.1)",
  border = "1px solid #ddd",
  width = "auto", 
  height = "auto",
  contentClassName = "",
  txt1 = "", 
  numtxt = "", 
  totaltxt = "",
  txt2 = "",
  customIcon,
}: CardProps) => {
  return (
    <div
      className="card"
      style={{
        backgroundColor: backgroundColor,
        boxShadow: shadow,
        border: border,
        width: width,
        height: height,
      }}
    >
      <div className={`${contentClassName}`}>
        <p className="txt1">{txt1}&nbsp;<span className="customIcon">{customIcon}</span></p>
        <p className="numtxt">{numtxt}&nbsp;<span className="totaltxt">{totaltxt}</span></p>
        <p className="txt2">{txt2}</p>
      </div>

    </div>
  );
};

export default Card;
