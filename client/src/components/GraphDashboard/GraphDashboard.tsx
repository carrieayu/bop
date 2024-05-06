import React from 'react'
import Card from '../Card/Card';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
)

interface CustomBarProps {
  className?: string;
  style?: React.CSSProperties;
}

const GraphDashboard: React.FC<CustomBarProps> = ({
 
  className,
  style,
}) => {
  const data = {
      labels: ['2021/04', '2021/05', '2021/06', '2021/07', '2021/09', '2021/10', '2021/11', '2021/12'],
      datasets: [
        {
          label: '売上高',
          data: [1200, 1100, 1400, 1500, 1300, 1600, 1700, 1800],
          backgroundColor: '#6e748c',
          borderColor: 'black',
          borderWidth: 1,
        },
        {
          label: '売上総利益',
          data: [800, 700, 1000, 1100, 900, 1200, 1300, 1400],
          backgroundColor: '#7696c6',
          borderColor: 'black',
          borderWidth: 1,
        },
        {
          label: ' 営業利益',
          data: [400, 300, 600, 700, 500, 800, 900, 1000],
          
          backgroundColor: '#b8cbe2',
          borderColor: 'black',
          borderWidth: 1,
        },
        {
          label: ' 当期純利益',
          data: [600, 500, 800, 900, 700, 1000, 1100, 1200],
          backgroundColor: '#bde386',
          borderColor: 'black',
          borderWidth: 1,
        },
        {
          label: ' 売上総利益率',
          data: [800, 200, 100, 400, 300, 700, 600, 500],
          backgroundColor: '#ff8e13',
          borderColor: 'black',
          borderWidth: 1,
        },
        {
          label: '営業利益率',
          data: [100, 200, 300, 400, 500, 600, 700, 800],
          backgroundColor: '#ec3e4a',
          borderColor: 'black',
          borderWidth: 1,
        },
      ]
    }


    const options = {
      plugins: {
        legend: {
          position: 'bottom' as const,
          maxWidth: 1,
        },
      },
    }
  return (
    <Card
    backgroundColor="#fffff"
    shadow="0px 4px 8px rgba(0, 0, 0, 0.1)"
    border="1px solid #dddddd"
    width="50%"
    height="30rem"
    CardClassName="card-custom"
  >
        <Bar 
          data = {data}
          options = {options}
          className="custom-bar"
          style={{
            width: '200px',
            height: '100px',
          }}
        ></Bar> 
        </Card>
  )
}

export default GraphDashboard
