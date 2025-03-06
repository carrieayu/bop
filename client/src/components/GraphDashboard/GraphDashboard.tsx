import React, { useEffect, useMemo, useState } from 'react'
import Card from '../Card/Card'
import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { translate } from '../../utils/translationUtil'
import { formatDate, formatNumberWithCommas, mapDataset } from '../../utils/helperFunctionsUtil'

interface CustomBarProps {
  className?: string
  style?: React.CSSProperties
  language
  planningAndResultGraphData
  graphDataType
  isToggled
  handleToggle
}

const GraphDashboard: React.FC<CustomBarProps> = ({
  className,
  style,
  language,
  planningAndResultGraphData,
  graphDataType,
  isToggled,
  handleToggle,
}) => {
  const currentDate = new Date()
  const currentDateFormatted = formatDate(currentDate)

  const { planningData, resultsData } = planningAndResultGraphData

  const planningFinancials = planningData.financial // 円
  const planningMargins = planningData.margin // %

  const resultsFinancials = resultsData.financial // 円
  const resultsMargins = resultsData.margin // %

  const financialData = graphDataType === 'planning' ? planningFinancials : resultsFinancials
  const marginData = graphDataType === 'planning' ? planningMargins : resultsMargins

  // Financials
  const seriesOne = useMemo(
    () =>
      mapDataset(financialData.datasets).map((series) => ({
        ...series,
        data: series.data.map((value) => (typeof value === 'number' && isNaN(value) ? null : value)),
      })),
    [financialData, isToggled],
  )

  // Margins
  const seriesTwo = useMemo(
    () =>
      mapDataset(marginData.datasets).map((series) => ({
        ...series,
        data: series.data.map((value) => (typeof value === 'number' && isNaN(value) ? null : value)),
      })),
    [marginData, isToggled],
  )

  const seriesOneBoth = useMemo(() => {
    return planningFinancials.datasets.map((dataset, datasetIndex) => ({
      name: translate(`${dataset.label}`, language), // e.g., "売上"
      color: dataset.backgroundColor,
      data: dataset.data.map((value, index) => ({
        x: planningFinancials.labels[index], // Use index or replace with actual labels if available
        y: typeof value === 'number' && isNaN(value) ? null : value,
        goals: resultsFinancials.datasets[datasetIndex] // Check if corresponding data exists in resultsFinancials
          ? [
            {
              name: translate('results', language),
              value: resultsFinancials.datasets[datasetIndex].data[index] ?? null, // Get the expected value from results
              strokeHeight: 2,
              strokeWidth: 4,
              // strokeLineCap: 'round',
              strokeColor: 'red',
            },
          ]
          : [],
      })),
    }))
  }, [planningFinancials.datasets, resultsFinancials.datasets])


  const seriesTwoBoth = useMemo(() => {

    const planningSeries = planningMargins.datasets.map((dataset, datasetIndex) => ({
      name: `${translate(`${dataset.label}`, language)} (${translate('planningShort', language)})`,
      color: dataset.backgroundColor,
      data: dataset.data.map((value, index) => ({
        x: planningMargins.labels[index],
        y: typeof value === 'number' && !isNaN(value) ? value : null,
      })),
    }))

    const resultsSeries = resultsMargins.datasets.map((dataset, datasetIndex) => ({
      name: `${translate(`${dataset.label}`, language)} (${translate('results', language)})`,
      color: dataset.backgroundColor,
      data: dataset.data.map((value, index) => ({
        x: resultsMargins.labels[index],
        y: typeof value === 'number' && !isNaN(value) ? value : null,
      })),
    }))

    return [...planningSeries, ...resultsSeries] // Merge both datasets
  }, [planningMargins.datasets, resultsMargins.datasets])

  // Helpers
  const selectedSeries = () => {
    if (graphDataType === 'both') {
      return isToggled ? seriesTwoBoth : seriesOneBoth
    } else {
      return isToggled ? seriesTwo : seriesOne
    }
  }

  let series = selectedSeries()

  const getTitle = () => {
    const titlesMap = {
      planning: isToggled ? 'marginsPlanning' : 'financialsPlanning',
      results: isToggled ? 'marginsResults' : 'financialsResults',
      both: isToggled ? 'marginsPlanningAndResults' : 'financialsPlanningAndResults',
    }
    return titlesMap[graphDataType] || ''; // Return the mapped title or fallback to an empty string
  }

  const graphTitle = useMemo(() => translate(getTitle(), language), [getTitle, language])

  // Apex Chart Options
  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        toolbar: {
          show: true,
          tools: {
            reset: false,
            zoom: false,
            pan: false,
            zoomin: false,
            zoomout: false,
          },
          export: {
            csv: {
              filename: graphTitle,
              headerCategory: translate('yearMonth', language),
            },
            png: {
              filename: graphTitle,
            },
            svg: {
              filename: graphTitle,
            },
          },
        },
      },
      title: {
        text: graphTitle,
        align: 'left',
      },
      xaxis: {
        categories: marginData.labels,
        labels: {
          offsetX: 2,
        },
      },
      yaxis: {
        title: {
          text: isToggled ? '%' : '円',
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
        dashArray: graphDataType === 'both' && isToggled ? [5, 5, 0, 0] : [0, 0, 0, 0],
      },
      markers: {
        size: 6,
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5,
        },
        padding: {
          left: 20,
        },
      },
      colors: marginData.datasets.map((dataset: any) => dataset.backgroundColor),
      tooltip: {
        enabled: true,
        followCursor: true,
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => (isToggled ? `${val} %` : `${formatNumberWithCommas(val)} 円`),
        },
      },
    }),
    [isToggled, graphDataType],
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
      <div className='dashboard-graph-switch-type' style={{ left: '70px', height: '35px' }}>
        <label className='slider-switch'>
          <input type='checkbox' checked={isToggled} onChange={handleToggle} />
          <span className='slider'></span>
        </label>
      </div>
      <Chart
        key={isToggled}
        options={options}
        series={series}
        type={isToggled ? 'line' : 'bar'}
        height={350}
        className='custom-bar'
      />
    </Card>
  )
}

export default GraphDashboard