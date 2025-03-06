import React from "react";

interface OptionSliderProps {
  option: string
  optionArray
  onChange
  min: number
  max: number
  step: number
}

const OptionSlider: React.FC<OptionSliderProps> = ({
  option,
  optionArray,
  onChange,
  min,
  max,
  step,
}: OptionSliderProps) => {
  return (
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={optionArray.indexOf(option)}
        style={{ width: '60px', height: '25px' }}
        onChange={onChange}
      />
  )
}

export default OptionSlider