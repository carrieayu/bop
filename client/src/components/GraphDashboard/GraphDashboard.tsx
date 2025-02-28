import React, { useMemo, useState } from 'react'
import Card from '../Card/Card'
import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { translate } from '../../utils/translationUtil'
import { formatDate, formatNumberWithCommas, mapDataset } from '../../utils/helperFunctionsUtil'

interface CustomBarProps {
  className?: string
  style?: React.CSSProperties
  financialData: any
  marginData: any
  language
  // type
}

const GraphDashboard: React.FC<CustomBarProps> = ({ className, style, financialData, marginData, language }) => {
  const currentDate = new Date()
  const currentDateFormatted = formatDate(currentDate)
  const [isToggled, setIsToggled] = useState(false)

  const handleToggle = () => {
    setIsToggled((prevState) => !prevState)
  }

  const seriesOne = useMemo(
    () =>
      mapDataset(financialData.datasets).map((series) => ({
        ...series,
        data: series.data.map((value) => (typeof value === 'number' && isNaN(value) ? null : value)),
      })),
    [financialData, isToggled],
  )

  const seriesTwo = useMemo(
    () =>
      mapDataset(marginData.datasets).map((series) => ({
        ...series,
        data: series.data.map((value) => (typeof value === 'number' && isNaN(value) ? null : value)),
      })),
    [marginData, isToggled],
  )

  const optionsOne: ApexOptions = useMemo(
    () => ({
      series:[seriesOne],
      chart: {
        type: 'bar',
        height: 350,
        offsetY: 10,
        offsetX: -10,
        toolbar: {
          show: true,
          tools: {
          
            reset: true,
            zoom: false,
            pan: false,
          },
          export: {
            csv: {
              filename: `${translate('csvFileName', language)}:${currentDateFormatted}`,
              headerCategory: translate('yearMonth', language),
            },
          },
        },
      },
      title: {
        text: translate('financials', language),
        align: 'left',
      },
      xaxis: {
        categories: financialData.labels,
        tickPlacement: 'on',
      },
      yaxis: {
        // tickAmount:10,
        title: {
          text: '円',
          rotate: 0,
          offsetX: -2,
        },
        opposite: true,
        labels: {
          formatter: (val: number) => formatNumberWithCommas(val),
        },
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
        padding: {
        },
      },
      colors: financialData.datasets.map((dataset: any) => dataset.backgroundColor),
      plotOptions: {
        bar: {
          columnWidth: '80%',
        },
      },
      tooltip: {
        followCursor: true,
        shared: true,
        intersect: false,

        y: {
          formatter: function (val: number) {
            return `${formatNumberWithCommas(val)} 円`
          },
        },
      },
    }),
    [financialData, isToggled],
  )

  const optionsTwo: ApexOptions = useMemo(
    () => ({
      series: [seriesTwo],
      chart: {
        type: 'line',
        // height: 350,
        toolbar: {
          export: {
            csv: {
              filename: `${translate('csvFileName', language)}:${currentDateFormatted}`,
              headerCategory: translate('yearMonth', language),
            },
          },
        },
      },
      
      title: {
        text: translate('margins', language),
        align: 'left',
      },
      xaxis: {
        categories: marginData.labels,
        labels: {
          // trim: false,
          // offsetX:2,
        }
      },
      yaxis: {
        // tickAmount:10,
        title: {
          text: '%',
          rotate: 0,
          offsetX: -2,
        },
        opposite: true,
        labels: {
          formatter: (val: number) => formatNumberWithCommas(val),
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        curve: 'straight',
        width: 2,
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
        padding: {
          left:20
        }
      },
      colors: marginData.datasets.map((dataset: any) => dataset.backgroundColor),
      tooltip: {
        enabled: true,
        followCursor: true,
        shared: true,
        y: {
          formatter: (val: number) => `${val} %`,
        },
      },
    }),
    [marginData, isToggled],
  )

  return (
    <Card
      backgroundColor='#ffffff'
      shadow='0px 4px 8px rgba(0, 0, 0, 0.1)'
      border='1px solid #dddddd'
      width='60%'
      height='30rem'
      CardClassName='card-custom'
    >
      <div className='dashboard-graph-switch-type'>
        <label className='slider-switch'>
          <input type='checkbox' checked={isToggled} onChange={handleToggle} />
          <span className='slider'></span>
        </label>
        <p>{translate(isToggled ? 'margins' : 'financials', language)}</p>
      </div>
      <Chart
        keys={isToggled}
        options={isToggled ? optionsTwo : optionsOne}
        series={isToggled ? seriesTwo : seriesOne}
        type={isToggled ? 'line' : 'bar'}
        height={350}
        className='custom-bar'
      />
    </Card>
  )
}

export default GraphDashboard