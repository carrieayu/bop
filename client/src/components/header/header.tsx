import React, { useState } from 'react'
import { FaCalendarAlt } from 'react-icons/fa'
import { IoIosArrowUp } from 'react-icons/io'
import { IoMdSettings } from 'react-icons/io'
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';

type headerProps = {
    value: string
}

const dataOptions1 = ['オプション 1', 'オプション 2', 'オプション 3', 'オプション 4', 'オプション 5'];
const dataOptions2 = ['オプション A', 'オプション B', 'オプション C', 'オプション D', 'オプション E'];
const periods = ['期間 1', '期間 2', '期間 3', '期間 4', '期間 5'];

export const HeaderDashboard: React.FC<headerProps> = (props) => {
  const today = new Date();
  const [startDate, setStartDate] = useState<Date | null>(today);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCalendarClick = () => {
      setShowDatePicker(!showDatePicker);
  };

  const formattedDate = startDate ? format(startDate, 'MM/dd/yyyy') : 'date';
    return (
      <div className='header_container'>
        <div className='container_left'>
          <div className='header_div'>
            <label className='option_label'>表示データ①</label>
            <select className='options'>
            {dataOptions1.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className='header_div'>
            <label className='option_label'>表示データ②</label>
            <select className='options'>
            {dataOptions2.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className='header_div'>
            <label className='option_label'>会計期間</label>
            <select className='options'>
            {periods.map((period, index) => (
                <option key={index} value={period}>{period}</option>
              ))}
            </select>
          </div>

          <div className='header_div'>
            <label className='option_label'>表示データ②の範囲</label>
            <div className='date-picker'>
              <div className='date'>
              {formattedDate}
                <FaCalendarAlt className='calendar-icon' onClick={handleCalendarClick}/>
              </div>
              {showDatePicker && (
                <div className="date-picker__calendar">
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => setStartDate(date)}
                    inline
                  />
                </div>
              )}
            </div>
          </div>

          <div className='header_div_right'>
            <div className='header_div_right_1'>
              <label className='option_label'></label>
              <div className='blue_btn'>条件の適用</div>
            </div>

            <div className='header_div_right_2'>
              <label className='option_label'>
                <div className='question_mark'>?</div>
              </label>
              <div className='sky_btn'>初期条件の保存</div>
            </div>
          </div>
        </div>
      </div>
    )
}