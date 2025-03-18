import React from "react"
import Card from "./Card"
import { formatNumberWithCommas } from "../../utils/helperFunctionsUtil"
import { translate } from "../../utils/translationUtil"

const NumberWithUnit = ({ value, percentage, language }) => {
    const formattedValue = percentage ? value : formatNumberWithCommas(value)
    const unit = percentage ? '%' : translate('yen', language)
    return (
      <div className='dashboard_total_number'>
        {formattedValue}&nbsp;
        <span>{unit}</span>
      </div>
    )
}
  
export const DashboardCard = ({ title, planningValue, resultValue, translateKey, language, percentage = false }) => {
  return (
    <Card
      backgroundColor='#fff'
      shadow='2px 2px 4px rgba(0, 0, 0, 0.2)'
      border='2px solid #ccc'
      width='auto'
      height='120px'
    >
      <div className='dashboard_custom-card-content'>
        <p className='dashboard_text1'>{title}</p>
        <div className='dashboard-card-planning'>
          <div
            className='dashboard_numTxt'
            style={{ backgroundColor: '#fec384c7', color: '#000', borderRadius: '5px', padding: '2px' }}
          >
            <span className='dashboard_totalTxt'>{translate('planningShort', language)}</span>
            <NumberWithUnit value={planningValue} percentage={percentage} language={language} />
          </div>
        </div>
        <div className='dashboard-card-result'>
          <div
            className='dashboard_numTxt'
            style={{ backgroundColor: '#CDE4FC', color: '#000', borderRadius: '5px', padding: '2px' }}
          >
            <span className='dashboard_totalTxt'>{translate('results', language)}</span>
            <NumberWithUnit value={resultValue} percentage={percentage} language={language} />
          </div>
        </div>
      </div>
    </Card>
  )
}
