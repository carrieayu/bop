import React, { useState } from 'react'
import Card from '../Card/Card'
import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { translate } from '../../utils/translationUtil'
import { formatDate , formatNumberWithCommas} from '../../utils/helperFunctionsUtil'
import { MAX_SAFE_INTEGER } from '../../constants'

interface CustomBarProps {
  className?: string
  style?: React.CSSProperties
  data: any
  language
  secondData
  type
}

const GraphDashboard: React.FC<CustomBarProps> = ({ className, style, data, secondData, language, type}) => {
  const categories = data.datasets[0].data.map((_: any, index: number) => `Category ${index + 1}`)
  
  const currentDate = new Date()
  const currentDateFormatted = formatDate(currentDate) // returns `${year}-${month}-${day}`
  const [isToggled, setIsToggled] = useState(false)
      const handleToggle = () => {
        setIsToggled((prevState) => !prevState)
      }


  const options: ApexOptions = {
    chart: {
      // stacked: true,
      type: type,
      height: 350,
      toolbar: {
        export: {
          csv: {
            filename: `${translate('csvFileName', language)}:${currentDateFormatted}`, // Filename title on download CSV.
            headerCategory: translate('yearMonth', language), // Manually override default 'category' header.
          },
        },
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '55%',
        distributed: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      curve: 'straight',
      width: [0, 2, 2, 2, 2, 2],
    },
    xaxis: {
      categories: data.labels,
    },
    yaxis: [
      {
        opposite: true,
        title: {
          text: '',
        },
      },
      // {
      //   opposite: true,
      //   show: false,
      //   title: {
      //     text: '',
      //   },
      // },
      // {
      //   opposite: true,
      //   show: false,
      //   title: {
      //     text: '',
      //   },
      // },
      // {
      //   opposite: true,
      //   show: false,
      //   title: {
      //     text: '',
      //   },
      // },
      // {
      //   opposite: false,
      //   min: -400,
      //   max: 400,
      //   title: {
      //     text: '',
      //   },
      // },
      // {
      //   opposite: false,
      //   show: false,
      //   // min: 0,
      //   // max: 100,
      //   title: {
      //     text: '',
      //   },
      // },
    ],
    fill: {
      opacity: 1,
    },
    tooltip: {
      followCursor:true,
      y: {
        formatter: function (val: number) {
          if (type !== 'line'){
            return `${formatNumberWithCommas(val)} 円`
          }
          else {
            return `${val.toFixed(2)}%`
          }
        },
      },
    },
  
    colors: data.datasets.map((dataset: any) => dataset.backgroundColor),
  }

  const optionsTwo: ApexOptions = {
    tooltip: {
      followCursor: true,
      y: {
        formatter: function (val: number) {
            return `${val} %`
        },
      },
    },
  }

  const seriesOne = data.datasets.map((dataset: any, index: number) => ({
    name: dataset.label,
    data: dataset.data,
    type: dataset.type,
    color: dataset.backgroundColor,
  }))

  const seriesTwo = secondData.datasets.map((dataset: any, index: number) => ({
    name: dataset.label,
    data: dataset.data,
    type: dataset.type,
    color: dataset.backgroundColor,
  }))

  return (
    <div>
      <Card
        // language={language}
        backgroundColor='#ffffff'
        shadow='0px 4px 8px rgba(0, 0, 0, 0.1)'
        border='1px solid #dddddd'
        width='50%'
        height='30rem'
        CardClassName='card-custom'
      >
        <div style={{ position: 'absolute', top: 0, left: 0, padding: '10px' }}>
          <div className='dashboard_switches'>
            <p className='dashboard_pl-label'>{translate('margins', language)}</p>
            <label className='dashboard_switch'>
              <input type='checkbox' checked={isToggled} onChange={handleToggle} />
              <span className='dashboard_slider'></span>
            </label>
          </div>
        </div>
        {isToggled ? (
          <Chart options={options} series={seriesOne} type='line' height={350} className='custom-bar' />
        ) : (
          <Chart options={optionsTwo} series={seriesTwo} type='line' height={350} className='custom-bar' />
        )}
      </Card>
    </div>
  )
}

export default GraphDashboard
