import React from 'react'
import Card from '../Card/Card'
import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { translate } from '../../utils/translationUtil'
import { formatDate } from '../../utils/helperFunctionsUtil'

interface CustomBarProps {
  className?: string
  style?: React.CSSProperties
  data: any
  language
}

const GraphDashboard: React.FC<CustomBarProps> = ({ className, style, data, language }) => {
  const categories = data.datasets[0].data.map((_: any, index: number) => `Category ${index + 1}`)
  
  const currentDate = new Date()
  const currentDateFormatted = formatDate(currentDate) // returns `${year}-${month}-${day}`

  const options: ApexOptions = {
    chart: {
      type: 'bar',
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
    ],
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toFixed(0)
        },
      },
    },
    colors: data.datasets.map((dataset: any) => dataset.backgroundColor),
  }

  const series = data.datasets.map((dataset: any) => ({
    name: dataset.label,
    type: dataset.type,
    data: dataset.data,
    color: dataset.backgroundColor,
  }))

  return (
    <Card
      backgroundColor='#ffffff'
      shadow='0px 4px 8px rgba(0, 0, 0, 0.1)'
      border='1px solid #dddddd'
      width='50%'
      height='30rem'
      CardClassName='card-custom'
    >
      <Chart options={options} series={series} type='bar' height={350} className='custom-bar' />
    </Card>
  )
}

export default GraphDashboard
