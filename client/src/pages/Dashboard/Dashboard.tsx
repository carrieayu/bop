import React, { useEffect, useState } from 'react'
import GraphDashboard from '../../components/GraphDashboard/GraphDashboard'
import { fetchAllCards } from '../../reducers/card/cardSlice'
import { useAppSelector } from '../../actions/hooks'
import { RootState } from '../../app/store'
import { fetchAllClientData } from '../../reducers/table/tableSlice'
import { fetchGraphData, fetchGraphDataTest } from '../../reducers/graph/graphSlice'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import { useAppDispatch } from '../../actions/hooks'
import TableDashboard from '../../components/TableDashboard/TableDashboard'

import { useSelector } from "react-redux";

// planning
import { fetchCos } from '../../reducers/costOfSale/costOfSaleSlice'
import { getCostOfSaleTotals } from '../../reducers/costOfSale/costOfSaleSlice'

import { fetchExpense } from '../../reducers/expenses/expensesSlice'
import { getExpenseTotals } from '../../reducers/expenses/expensesSlice'

import { fetchEmployeeExpense, getEmployeeExpenseTotals } from '../../reducers/employeeExpense/employeeExpenseSlice'
// results
import { fetchCosResult, getCostOfSaleResultsTotals } from '../../reducers/costOfSale/costOfSaleResultSlice'

import { fetchExpenseResult, getExpenseResultsTotals } from '../../reducers/expenses/expensesResultsSlice'

import { fetchProjectResult, getProjectTotalSales } from '../../reducers/project/projectResultSlice'
import { fetchProject, getProjectTotals, getMonthlyValues } from '../../reducers/project/projectSlice'

import { fetchEmployeeExpenseResult, getEmployeeExpenseResultTotals} from '../../reducers/employeeExpense/employeeExpenseResultSlice'

import {
fetchTotals,
selectTotals
} from '../../reducers/planningAndResultTotals/planningAndResultTotalsSlice'

import { DashboardCard } from '../../components/Card/DashboardCard'
// import { projects } from '../../../jest.config'
import { fetchNewGraphData, selectNewGraphValues} from '../../reducers/graph/newGraphSlice'
import { relative } from 'path'

const Dashboard = () => {

  const { planning, results } = useSelector(selectTotals)
  
  const newGraphValues = useSelector(selectNewGraphValues)

  useEffect(() => {
    console.log('newGraphValues',newGraphValues)
  }, [newGraphValues])
  
  // START
  const [isGraphToggled, setIsGraphToggled]= useState(false)
  const { planningMonthly } = useSelector(selectNewGraphValues)
  const projectsSalesRevenueMonthlyPlanning = planningMonthly.projectSalesRevenueMonthlyPlanning
  const costOfSalesMontlyTotalsByDate = planning.costOfSales.monthlyTotalsByDate
  console.log('## projectsSalesRevenueMonthlyPlanning', projectsSalesRevenueMonthlyPlanning)
  console.log('## costOfSalesMontlyTest', costOfSalesMontlyTotalsByDate)
  console.log('## costOfSalesMontlyTest in graph slice', planningMonthly.costOfSalesTotalMonthlyPlanning)
  console.log('## gross profit monthly', planningMonthly.grossProfitMonthlyPlanning)
  const dates = planningMonthly.dates

  console.log('grossProfitMarginMonthlyPlanning', planningMonthly.grossProfitMarginMonthlyPlanning)
  console.log('** expenses monthly planning', planningMonthly.expensesMonthlyPlanning)

  const expenseMonthlyTotalTest = useSelector((state: RootState) => state.expenses.expensesMonthlyTotalsByDate)
  
  console.log('** expenseMonthlyTotalTest', expenseMonthlyTotalTest)

  const employeeExpensesMonthlyTotalsByDate = useSelector(
    (state: RootState) => state.employeeExpense.employeeExpensesMonthlyTotalsByDate,
  )

  console.log('** employeeExpensesMonthlyTotalsByDate', employeeExpensesMonthlyTotalsByDate)

  const adminAndGeneralExpenseMonthlyPlanning = useSelector((state:RootState)=> state.newGraph.planningMonthly.adminAndGeneralExpenseMonthlyPlanning)
  console.log('** adminAndGeneralExpenseMonthlyPlanning', adminAndGeneralExpenseMonthlyPlanning)

  const  operatingIncomeMonthlyTotalByDate = useSelector((state:RootState)=> state.newGraph.planningMonthly.operatingIncomeMonthlyPlanning)
  console.log('** operatingIncomeMonthlyTotalByDate', operatingIncomeMonthlyTotalByDate)

  const operatingProfitMarginMonthlyPlanning = useSelector((state: RootState) => state.newGraph.planningMonthly.operatingProfitMarginMonthlyPlanning)
  console.log('** operatingProfitMarginMonthlyPlanning', operatingProfitMarginMonthlyPlanning)

  const ordinaryIncomeMonthlyPlanning = useSelector((state:RootState)=> state.newGraph.planningMonthly.ordinaryIncomeMonthlyPlanning)
  console.log('** ordinaryIncomeMonthlyPlanning', ordinaryIncomeMonthlyPlanning)
  console.log('** ordinaryIncomeMonthlyPlanning[date]', dates.map((date) => ordinaryIncomeMonthlyPlanning[date]))
    console.log(
      '** ordinaryIncomeMonthlyPlanning compare',
      ordinaryIncomeMonthlyPlanning,
      'operatingIncomeMonthlyTotalByDate',
      operatingIncomeMonthlyTotalByDate,
      'planningMonthly.grossProfitMonthlyPlanning',
      planningMonthly.grossProfitMonthlyPlanning,
    )

  // const nonOperatingIncomeMonthly = useSelector(
  //   (state: RootState) => state.project.nonOperatingIncomeMonthly
  // )
  // console.log('** nonOperatingIncomeMonthly', nonOperatingIncomeMonthly)

  // END
  const [tableList, setTableList] = useState<any>([])

  const totalSalesByDate = useAppSelector((state: RootState) => state.graph.totalSalesByDate)
  console.log('## totalSalesByDate',totalSalesByDate)
  const totalOperatingIncomeByDate = useAppSelector((state: RootState) => state.graph.totalOperatingIncomeByDate)
  const totalGrossProfitByDate = useAppSelector((state: RootState) => state.graph.totalGrossProfitByDate)
  const totalCumulativeOrdinaryIncomeByDate = useAppSelector(
    (state: RootState) => state.graph.totalCumulativeOrdinaryIncome,
  )
  const totalGrossProfitMarginByDate = useAppSelector((state: RootState) => state.graph.totalGrossProfitMarginByDate)
  const totalOperatingProfitMarginByDate = useAppSelector(
    (state: RootState) => state.graph.totalOperatingProfitMarginByDate,
  )
  const month = useAppSelector((state: RootState) => state.graph.month)
  const [activeTab, setActiveTab] = useState('/dashboard')
  const [isSwitchActive, setIsSwitchActive] = useState(false)
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const navigate = useNavigate()
  const location = useLocation()
  const [isThousandYenChecked, setIsThousandYenChecked] = useState(false)
  const dispatch = useAppDispatch()

  const handleGraphToggle = () => {
    setIsGraphToggled((prevState) => !prevState)
  }

  const handleThousandYenToggle = () => {
    setIsThousandYenChecked((prevState) => !prevState)
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  useEffect(() => {
    // Updated to catch errors when executing dispatch
    const fetchData = async () => {
      try {
        // PLANNING
        // WHY IS THIS CALLED CLIENTDATA???? NEED TO INVESTIGATE AND POSSIBLY FIX
        const [clientData] = await Promise.all([
          dispatch(fetchAllClientData()).catch((error) => {
            console.error('Error fetching client data:', error)
            return null
          }),
          dispatch(fetchAllCards()).catch((error) => {
            console.error('Error fetching cards data:', error)
            return null
          }),
          dispatch(fetchGraphData()).catch((error) => {
            console.error('Error fetching graph data:', error)
            return null
          }),
          dispatch(fetchNewGraphData())
            .catch((error) => {
              console.error('Error fetching graph data:', error)
              return null
            }),
          dispatch(fetchCos())
            .catch((error) => {
              console.error('Error fetching COS data:', error)
              return null
            })
            .then(() => {
              dispatch(getCostOfSaleTotals())
            }),
          dispatch(fetchExpense())
            .catch((error) => {
              console.error('Error fetching Expense data:', error)
              return null
            })
            .then(() => {
              dispatch(getExpenseTotals())
            }),
          dispatch(fetchEmployeeExpense())
            .catch((error) => {
              console.error('Error fetching Expense Result data:', error)
              return null
            })
            .then(() => {
              dispatch(getEmployeeExpenseTotals())
            }),
          dispatch(fetchProject())
            .catch((error) => {
              console.error('Error fetching Project data:', error)
              return null
            })
            .then(() => {
              dispatch(getProjectTotals())
            })
            .then(() => {
              dispatch(getMonthlyValues())
            }),
          // RESULTS
          dispatch(fetchExpenseResult())
            .catch((error) => {
              console.error('Error fetching Expense Result data:', error)
              return null
            })
            .then(() => {
              dispatch(getExpenseResultsTotals())
            }),
          dispatch(fetchCosResult())
            .catch((error) => {
              console.error('Error fetching COS Result data:', error)
              return null
            })
            .then(() => {
              dispatch(getCostOfSaleResultsTotals())
            }),
          dispatch(fetchProjectResult())
            .catch((error) => {
              console.error('Error fetching Project Result data:', error)
              return null
            })
            .then(() => {
              dispatch(getProjectTotalSales())
            }),
          dispatch(fetchEmployeeExpenseResult())
            .catch((error) => {
              console.error('Error fetching Employee Expense Result data:', error)
              return null
            })
            .then(() => {
              dispatch(getEmployeeExpenseResultTotals())
            }),
          dispatch(fetchTotals()).catch((error) => {
            console.error('Error fetching TOTALS data:', error)
            return null
          }),
        ])
        if (clientData) {
          setTableList(clientData.payload)
        }
      } catch (error) {
        console.error('Unexpected error:', error)
      }
    }

    fetchData()
  }, [tableList])

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

  console.log('** months', month, '** dates', dates)

  const graphData = {
    labels: dates, // This displays the 'dates' in y axis in the csv.
    datasets: [
      {
        // updated
        type: 'bar' as const,
        label: translate('sales', language),
        data: dates.map((date) => projectsSalesRevenueMonthlyPlanning[date] || 0),
        backgroundColor: '#6e748c',
        borderColor: 'black',
        borderWidth: 1,
      },
      {
        // updated
        type: 'bar' as const,
        label: translate('grossProfit', language),
        data: dates.map((date) => planningMonthly.grossProfitMonthlyPlanning[date]),
        backgroundColor: '#7696c6',
        borderColor: 'black',
        borderWidth: 1,
      },
      {
        // working on
        type: 'bar' as const,
        label: translate('operatingIncome', language),
        data: dates.map((date) => operatingIncomeMonthlyTotalByDate[date]),
        backgroundColor: '#b8cbe2',
        borderColor: 'black',
        borderWidth: 1,
      },
      {
        type: 'bar' as const,
        label: translate('ordinaryIncome', language), // changed to monthly not cumulative
        data: month?.map((date) => ordinaryIncomeMonthlyPlanning[date]?? 0),
        backgroundColor: '#bde386',
        borderColor: 'black',
        borderWidth: 1,
      },
      // {
      //   // updated
      //   type: 'line' as const,
      //   label: translate('grossProfitMargin', language),
      //   data: dates
      //     ?.filter((date) => planningMonthly.grossProfitMarginMonthlyPlanning[date])
      //     .map((date) => planningMonthly.grossProfitMarginMonthlyPlanning[date]),
      //   backgroundColor: '#ff8e13',
      //   borderColor: '#ff8e13',
      //   borderWidth: 2,
      //   // fill: false,
      // },
      // {
      //   // workign on
      //   type: 'line' as const,
      //   label: translate('operatingProfitMargin', language),
      //   data: month?.map((date) => operatingProfitMarginMonthlyPlanning[date]),
      //   backgroundColor: '#ec3e4a',
      //   borderColor: '#ec3e4a',
      //   borderWidth: 2,
      //   // fill: false,
      // },
    ],
  }

  const lineGraphData = {
    labels: dates, // This displays the 'dates' in y axis in the csv.    datasets: [
    datasets: [
      {
        // updated
        type: 'line' as const,
        label: translate('grossProfitMargin', language),
        data: dates
          ?.filter((date) => planningMonthly.grossProfitMarginMonthlyPlanning[date])
          .map((date) => planningMonthly.grossProfitMarginMonthlyPlanning[date]),
        backgroundColor: '#ff8e13',
        borderColor: '#ff8e13',
        borderWidth: 2,
        // fill: false,
      },
      {
        // workign on
        type: 'line' as const,
        label: translate('operatingProfitMargin', language),
        data: month?.map((date) => operatingProfitMarginMonthlyPlanning[date] ?? 0),
        backgroundColor: '#ec3e4a',
        borderColor: '#ec3e4a',
        borderWidth: 2,
        // fill: false,
      },
    ],
  }

  return (
    <div className='dashboard_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='dashboard_content_wrapper'>
        <Sidebar />
        {/* <div className='dashboard_table_wrapper'> */}
        <div className='dashboard_content'>
          <div className='dashboard_body_cont'>
            <div className='dashboard_card_cont'>
              <div className='dashboard_left_card'>
                <DashboardCard
                  title={translate('sales', language)}
                  planningValue={planning.projects.totalSalesRevenue}
                  resultValue={results.projectsResults.totalSalesRevenue}
                  translateKey='sales'
                  language={language}
                />
                <DashboardCard
                  title={translate(language === 'en' ? 'operatingIncomeShort' : 'operatingIncome', language)}
                  planningValue={planning.calculations.operatingIncomeYearlyTotal}
                  resultValue={results.calculationsResults.operatingIncomeYearlyTotal}
                  translateKey='operatingIncome'
                  language={language}
                />
                <DashboardCard
                  title={translate('grossProfitMargin', language)}
                  planningValue={planning.calculations.grossProfitMargin.toFixed(2)}
                  resultValue={results.calculationsResults.grossProfitMargin.toFixed(2)}
                  translateKey='grossProfitMargin'
                  language={language}
                  percentage={true}
                />
              </div>
              &nbsp;&nbsp;&nbsp;
              <div className='dashboard_right_card'>
                <DashboardCard
                  title={translate('grossProfit', language)}
                  planningValue={planning.calculations.grossProfit}
                  resultValue={results.calculationsResults.grossProfit}
                  translateKey='grossProfit'
                  language={language}
                />
                <DashboardCard
                  title={translate(
                    language === 'en' ? 'cumulativeOrdinaryIncomeShort' : 'cumulativeOrdinaryIncome',
                    language,
                  )}
                  planningValue={planning.calculations.ordinaryIncome}
                  resultValue={results.calculationsResults.ordinaryIncome}
                  translateKey='cumulativeOrdinaryIncome'
                  language={language}
                />
                <DashboardCard
                  title={translate(
                    language === 'en' ? 'operatingProfitMarginShort' : 'operatingProfitMargin',
                    language,
                  )}
                  planningValue={planning.calculations.operatingProfitMargin.toFixed(2)}
                  resultValue={results.calculationsResults.operatingProfitMargin.toFixed(2)}
                  translateKey='operatingProfitMargin'
                  language={language}
                  percentage={true}
                />
              </div>
            </div>
            &nbsp;&nbsp;&nbsp;
            <div className='dashboard_graph_cont'>
              <div className='dashboard_graph_wrap'>
                <GraphDashboard data={graphData} secondData={lineGraphData} language={language} type={'bar'} />

              </div>
            </div>
          </div>
          <div className='dashboard_bottom_cont'>
            <div className='dashboard_right-content'>
              <div className='dashboard_switches'>
                <p className='dashboard_pl-label'>{translate('thousandYen', language)}</p>
                <label className='dashboard_switch'>
                  <input type='checkbox' checked={isThousandYenChecked} onChange={handleThousandYenToggle} />
                  <span className='dashboard_slider'></span>
                </label>
              </div>
            </div>
            <div className='dashboard_tbl_cont'>
              <div className={`dashboard_table_content_planning ${isSwitchActive ? 'hidden' : ''}`}>
                {/* Render the TablePlanning & TableResults here (TableDashboard) */}
                <TableDashboard isThousandYenChecked={isThousandYenChecked} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
