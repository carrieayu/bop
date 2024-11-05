import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil';
import axios from 'axios';
import { fetchMasterClient } from '../../reducers/client/clientSlice';
import { UnknownAction } from 'redux';

type TableProps = {
  header: string[];
  dates: string[];
  smallDate: string[];
  data: any;
};

const objectEntity = [
  'sales_revenue',
  'employee_expenses',
  'operating_profit',
  'non_operating_income',
  'non_operating_expense',
  'ordinary_profit',
  'ordinary_profit_margin',
];

const headerTitle = ['salesRevenue', 'personalExpenses', 'operatingIncome', 'nonOperatingIncome', 'nonOperatingExpenses', 'ordinaryIncome', 'ordinaryIncomeProfitMargin']

interface EntityGrid {
  clientName: string;
  grid: string[][];
  clientId: string; // Added clientId field
}

export const TablePlanningB: React.FC<TableProps> = (props) => {
  const gridRows = objectEntity.length;
  const gridCols = 12;
  const token = localStorage.getItem('accessToken')
  const [grid, setGrid] = useState<EntityGrid[]>([]);
  const [data, setData] = useState<any[]>([]);
  const { language, setLanguage } = useLanguage();
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');
  const [clients, setClients] = useState<any>([])
  const dispatch = useDispatch()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/projects/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("PROJECTS: ", response.data);

        // Filter data by client
        const groupedData: { [key: string]: EntityGrid } = {};

        response.data.forEach((project) => {
          const clientId = project.client;
          const clientName = clients.find(client => client.id === clientId)?.client_name; // Assuming project_name is the client's name

          // If the client already exists in the groupedData, push the project data
          if (!groupedData[clientId]) {
            groupedData[clientId] = {
              clientName,
              grid: Array.from({ length: gridRows }, () => Array.from({ length: gridCols }, () => '0')),
              clientId, // Store client ID
            };
          }

          // Update grid data with project values
          const month = project.month - 1; // Adjust month for 0-based index
          const adjustedMonth = (month + 9) % 12; // Your month adjustment logic

          objectEntity.forEach((field, index) => {
            if (project[field] !== undefined) {
              const fieldValue = parseFloat(project[field]);
              if (!isNaN(fieldValue)) {
                groupedData[clientId].grid[index][adjustedMonth] = (parseFloat(groupedData[clientId].grid[index][adjustedMonth]) + fieldValue).toString();
              }
            }
          });
        });

        // Convert groupedData object to array
        setData(Object.values(groupedData));
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const entityGrids: EntityGrid[] = data.map((entity) => ({
      clientName: entity.clientName,
      grid: entity.grid,
      clientId: entity.clientId, // Add clientId to the entity grid
    }));
    fetchClients();
    setGrid(entityGrids);
  }, [data]);

  const fetchClients = async () => {
    try {
      const resMasterClients = await dispatch(fetchMasterClient() as unknown as UnknownAction)
      console.log("PUTA: ", resMasterClients.payload)
      setClients(resMasterClients.payload)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en');
  }, [language]);

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
    setLanguage(newLanguage);
  };

  const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
  const monthNames: { [key: number]: { en: string; jp: string } } = {
    1: { en: "January", jp: "1月" },
    2: { en: "February", jp: "2月" },
    3: { en: "March", jp: "3月" },
    4: { en: "April", jp: "4月" },
    5: { en: "May", jp: "5月" },
    6: { en: "June", jp: "6月" },
    7: { en: "July", jp: "7月" },
    8: { en: "August", jp: "8月" },
    9: { en: "September", jp: "9月" },
    10: { en: "October", jp: "10月" },
    11: { en: "November", jp: "11月" },
    12: { en: "December", jp: "12 月" },
  };

  return (
    <div className='table_container'>
      <div className='table-container'>
        <table className='table_header'>
          <tbody>
            <tr className='tr_header'>
              <th style={{ borderRight: '1px solid black', width: '7%' }}></th>
              <th style={{ borderRight: '1px solid black', width: '7%' }}></th>
              <th style={{ borderRight: '1px solid black', width: '7%' }}></th>
              <th colSpan={5}></th>
              {props.header?.map((item, index) => (
                <th key={index}>{translate('planning', language)}</th>
              ))}
              <th colSpan={6}></th>
              <th style={{ borderLeft: '1px solid black' }}></th>
            </tr>
            <tr className='tr_title'>
              <th style={{ width: 100, textAlign: 'center', borderRight: '1px solid black' }}>{translate('itemNumber', language)}</th>
              <th style={{ width: 100, textAlign: 'center' }}>{translate('client', language)}</th>
              <th className='header_center' style={{ width: 100, borderRight: '1px solid black' }}>
                {translate('accountCategories', language)}
              </th>
              <th colSpan={12}></th>
              <th className='header_center'>{translate('totalAmount', language)}</th>
            </tr>
            <tr className='tr_dates'>
              <td className='td_border'></td>
              <td className='td_border'></td>
              <td className='td_border'></td>
              {months.map((month, index) => (
                <td
                  key={index}
                  className='td_right'
                  style={{ width: '6%', overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  {language === "en" ? monthNames[month].en : monthNames[month].jp}
                </td>
              ))}
              <td style={{ width: '8%' }}></td>
            </tr>
          </tbody>
        </table>
        <div className='scrollable_container planning_scrollable'>
          {grid?.map((entityGrid: EntityGrid, entityIndex: number) => (
            <div key={entityIndex}>
              <table className='tableGrid'>
                <thead></thead>
                <tbody>
                  {entityGrid.grid?.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td style={{ width: '7%', textAlign: 'center' }} className='div_border'>
                        {/* Display only the clientId */}
                        <div>{entityGrid.clientId}</div>
                      </td>
                      <td style={{ width: '7%', textAlign: 'center' }} className='div_border'>
                        {rowIndex === 3 ? <div>{entityGrid.clientName}</div> : rowIndex === 0 && <></>}
                      </td>
                      <td style={{ width: '7%', border: '1px solid black', textAlign: 'center' }}>
                        {translate(headerTitle[rowIndex], language)}
                      </td>
                      {Array.isArray(row) && row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          style={{ width: '6%', height: 50, border: '1px solid black', textAlign: 'center' }}
                        >
                          {cell}
                        </td>
                      ))}
                      <td>total</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
