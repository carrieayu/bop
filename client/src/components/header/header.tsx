import React from 'react'
import { FaCalendarAlt } from 'react-icons/fa'
import { IoIosArrowUp } from 'react-icons/io'
import { IoMdSettings } from 'react-icons/io'

type headerProps = {
    value: string
}

export const HeaderDashboard: React.FC<headerProps> = (props) => {
    return (
      <div className='header_container'>
        <div className='container_left'>
          <div className='header_div'>
            <label className='option_label'>Option1</label>
            <select className='options'>
              <option value='1'>Option 1</option>
            </select>
          </div>

          <div className='header_div'>
            <label className='option_label'>Option2</label>
            <select className='options'>
              <option value='1'>Option 1</option>
            </select>
          </div>

          <div className='header_div'>
            <label className='option_label'>Option3</label>
            <select className='options'>
              <option value='1'>Option 1</option>
            </select>
          </div>

          <div className='header_div'>
            <label className='option_label'>date</label>
            <div className='date-picker'>
              <div className='date'>
                date
                <FaCalendarAlt className='calendar-icon' />
              </div>
            </div>
          </div>

          <div className='header_div'>
            <label className='option_label'>Option4</label>
            <select className='options'>
              <option value='1'>Option 1</option>
            </select>
          </div>

          <div className='header_div'>
            <label className='option_label'>Option5</label>
            <select className='options'>
              <option value='1'>Option 1</option>
            </select>
          </div>

          <div className='header_div'>
            <label className='option_label'></label>
            <div className='blue_btn'>blue button</div>
          </div>

          <div className='header_div'>
            <label className='option_label'>
              <div className='question_mark'>?</div>
            </label>
            <div className='sky_btn'>sky button</div>
          </div>
        </div>

        <div className='container_right'>
          <div className='header_div_right'>
            <label className='option_label'></label>
            <div className='sml_bl_btn'>sml_bl_btn</div>
          </div>

          <div className='header_div_right'>
            <label className='option_label'></label>
            <div className='sml_white_btn'>sml_white_btn</div>
          </div>

          <div className='header_div'>
            <label className='option_label'></label>
            <div className='arrow_up_btn'>
              <IoIosArrowUp />
            </div>
          </div>

          <div className='header_div'>
            <label className='option_label'></label>
            <div className='btn_setting'>
              <IoMdSettings />
            </div>
          </div>
        </div>
      </div>
    )
}
