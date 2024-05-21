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
