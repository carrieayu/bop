import React from 'react'
import Card from '../Card/Card'
import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { translate } from '../../utils/translationUtil'
import { darkenColor, formatNumberWithCommas, mapDataset, reOrderArray } from '../../utils/helperFunctionsUtil'

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
  // Provides Default empty data for cases when dara fails to load.
  const defaultGraphData = { financial: { datasets: [], labels: [] }, margin: { datasets: [], labels: [] } }
  
  const planningData = planningAndResultGraphData?.planningData || defaultGraphData
  const resultsData = planningAndResultGraphData?.resultsData || defaultGraphData

  // Planning
  const planningFinancials = planningData?.financial // 円
  const planningMargins = planningData?.margin // %
  // Results
  const resultsFinancials = resultsData?.financial // 円
  const resultsMargins = resultsData?.margin // %
  // Set Data based on whether selected graph is planning Or results
  const financialData = graphDataType === 'planning' ? planningFinancials : resultsFinancials
  const marginData = graphDataType === 'planning' ? planningMargins : resultsMargins

  // Helper Functions for Series
  const createSeries = (data: any, type: 'planning' | 'results', colorModifier?: (hex: string) => string) =>
    (data?.datasets || []).map((dataset: any) => ({
      name: `${translate(dataset.label, language)} (${translate(type === 'planning' ? 'planningShort' : 'resultsShort', language)})`,
      color: colorModifier ? colorModifier(dataset.backgroundColor) : dataset.backgroundColor,
      data: dataset.data.map((value: number, index: number) => ({
        x: data.labels[index],
        y: typeof value === 'number' && !isNaN(value) ? value : null,
      })),
    }))

  // Financials (Bar Charts)
  const seriesFinancials = mapDataset(financialData.datasets).map((series) => ({
    ...series,
    data: series.data.map((value) => (typeof value === 'number' && isNaN(value) ? null : value)),
  }))
  
  const seriesFinancialsBoth = reOrderArray(
    [
      ...createSeries(planningData.financial, 'planning'),
      ...createSeries(resultsData.financial, 'results', (color) => darkenColor(color, 40)),
    ],
    8,
  )
   
  // Margins (Line Charts)
  const seriesMargins = mapDataset(marginData.datasets).map((series) => ({
    ...series,
    data: series.data.map((value) => (typeof value === 'number' && value !== null ? value : null)),
  }))
  
  const seriesMarginsBoth = reOrderArray(
    [...createSeries(planningData.margin, 'planning'), ...createSeries(resultsData.margin, 'results')],
    4,
  )

  // Helpers: Used to reduce code in Apex Options Below
  const selectedSeries = () => {
    if (graphDataType === 'both') {
      return isToggled ? seriesMarginsBoth : seriesFinancialsBoth;
    } else {
      return isToggled ? seriesMargins : seriesFinancials
    }
  }

  const series = selectedSeries()

  const graphTitle = translate(
    {
      planning: isToggled ? 'marginsPlanning' : 'financialsPlanning',
      results: isToggled ? 'marginsResults' : 'financialsResults',
      both: isToggled ? 'marginsPlanningAndResults' : 'financialsPlanningAndResults',
    }[graphDataType] || '',
    language,
  )

  // Apex Chart Options
  const options: ApexOptions = {

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
      dashArray:
        graphDataType === 'planning'
          ? isToggled
            ? [5, 5] // dashed line for planning when toggled
            : [0, 0]
          : graphDataType === 'results'
            ? [0, 0] // solid line for results
            : graphDataType === 'both'
              ? isToggled
                ? [5, 0, 5, 0] // dashed line for planning and solid for results in both
                : [0, 0, 0, 0] // solid for both
              : [0, 0, 0, 0], // default case
    },
    markers: {
      size: 6,
    },
    legend: {
      show: true,
      itemMargin: {
        horizontal: 4,
        vertical: 4,
      },
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
        formatter: (val: number | null | string) => {
          if (val === null || val === '' || Number.isNaN(val)) {
            return translate('noData', language)
          }
          return isToggled ? `${val} %` : `${formatNumberWithCommas(val)} 円`
        },
      },
    },
  }

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
      {series && options ? (
        <Chart
          key={`${graphDataType}-${isToggled}`}  // Force re-render when toggling graphs
          options={ options || {} }
          series={ series || [] }
          type={isToggled ? 'line' : 'bar'}
          height={350}
          className={`custom-bar`}
        />
      ) : (
        <div>Loading</div>
      )}
    </Card>
  )
}

export default GraphDashboard