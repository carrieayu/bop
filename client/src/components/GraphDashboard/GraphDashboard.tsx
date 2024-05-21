import React from 'react';
import Card from '../Card/Card';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

interface CustomBarProps {
  className?: string;
  style?: React.CSSProperties;
  data: any;
}

const GraphDashboard: React.FC<CustomBarProps> = ({
  className,
  style,
  data,
}) => {
  const data = {
    labels: ['2021/04', '2021/05', '2021/06', '2021/07', '2021/09', '2021/10', '2021/11', '2021/12'],
    datasets: [
      {
        type: 'bar' as const,
        label: '売上高',
        data: [1200, 1100, 1400, 1500, 1300, 1600, 1700, 1800],
        backgroundColor: '#6e748c',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: '売上総利益',
        data: [800, 700, 1000, 1100, 900, 1200, 1300, 1400],
        backgroundColor: '#7696c6',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: '営業利益',
        data: [400, 300, 600, 700, 500, 800, 900, 1000],
        backgroundColor: '#b8cbe2',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: '当期純利益',
        data: [600, 500, 800, 900, 700, 1000, 1100, 1200],
        backgroundColor: '#bde386',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: '売上総利益率',
        data: [66, 60, 71, 73, 69, 75, 76, 77], 
        backgroundColor: '#ff8e13',
        borderColor: '#ff8e13',
        borderWidth: 1,
        yAxisID: 'y1',
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 7,
        showLine: true, 
        fill: false,
      },
      {
        type: 'line' as const,
        label: '営業利益率',
        data: [33, 28, 43, 47, 38, 50, 53, 56], 
        backgroundColor: '#ec3e4a',
        borderColor: '#ec3e4a',
        borderWidth: 1,
        yAxisID: 'y1',
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 7,
        showLine: true, 
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: false,
        },

      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value;
          },
        },
      },
      y1: {
        type: 'linear' as const,
        beginAtZero: true,
        position: 'right' as const,
        ticks: {
          callback: function (value) {
            return value + '%';
          },
        },
      },
    },
    elements: {
      point: {
        pointStyle: 'circle',
        radius: 5,
        hoverRadius: 7,
      },
    },
  };

  return (
    <Card
      backgroundColor="#fffff"
      shadow="0px 4px 8px rgba(0, 0, 0, 0.1)"
      border="1px solid #dddddd"
      width="50%"
      height="30rem"
      CardClassName="card-custom"
    >
      <Chart
        type="bar"
        data={data}
        options={options}
        className="custom-bar"
        style={{
          width: '200px',
          height: '100px',
        }}
      />
    </Card>
  );
};

export default GraphDashboard;
