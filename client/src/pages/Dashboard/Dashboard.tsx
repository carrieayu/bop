import React, { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import { useAppDispatch, useAppSelector } from '../../actions/hooks'
import GraphDashboard from '../../components/GraphDashboard/GraphDashboard'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import TableDashboard from '../../components/TableDashboard/TableDashboard'
import Sidebar from '../../components/Sidebar/Sidebar'
import { DashboardCard } from '../../components/Card/DashboardCard'
// Reducers
import { fetchAllCards } from '../../reducers/card/cardSlice'
import { fetchAllClientData } from '../../reducers/table/tableSlice'
// Graph
import { fetchGraphData } from '../../reducers/graph/graphSlice'
import { fetchNewGraphData, selectNewGraphValues } from '../../reducers/graph/newGraphSlice'
// Planning
import { fetchCos } from '../../reducers/costOfSale/costOfSaleSlice'
import { getCostOfSaleTotals } from '../../reducers/costOfSale/costOfSaleSlice'
import { fetchExpense } from '../../reducers/expenses/expensesSlice'
import { getExpenseTotals } from '../../reducers/expenses/expensesSlice'
import { fetchEmployeeExpense, getEmployeeExpenseTotals } from '../../reducers/employeeExpense/employeeExpenseSlice'
// Results
import { fetchCosResult, getCostOfSaleResultsTotals } from '../../reducers/costOfSale/costOfSaleResultSlice'
import { fetchExpenseResult, getExpenseResultsTotals } from '../../reducers/expenses/expensesResultsSlice'
import {
  fetchProjectResult,
  getProjectResultTotals,
  getMonthlyResultValues,
} from '../../reducers/project/projectResultSlice'
import { fetchProject, getProjectTotals, getMonthlyValues } from '../../reducers/project/projectSlice'
import {
  fetchEmployeeExpenseResult,
  getEmployeeExpenseResultTotals,
} from '../../reducers/employeeExpense/employeeExpenseResultSlice'
// Totals
import { fetchTotals, selectTotals } from '../../reducers/planningAndResultTotals/planningAndResultTotalsSlice'
import { RootState } from '../../app/store'
import { stat } from 'fs'
import { Root } from 'react-dom/client'

const Dashboard = () => {
  // DATA FOR CARDS
  const { planning, results } = useAppSelector(selectTotals)
  // DATA FOR GRAPH
  const { planningMonthly, resultsMonthly } = useAppSelector(selectNewGraphValues)

  const [test, setTest] = useState<any>([])

  useEffect(() => {
    console.log('Current Planning:', planning)
    console.log('Current Results:', results)
  }, [planning, results]) // L

  const {
    projectSalesRevenueMonthlyPlanning,
    operatingIncomeMonthlyPlanning,
    operatingProfitMarginMonthlyPlanning,
    ordinaryIncomeMonthlyPlanning,
    grossProfitMarginMonthlyPlanning,
    grossProfitMonthlyPlanning,
    dates,
  } = planningMonthly

  const {
    projectSalesRevenueMonthlyResults,
    operatingIncomeMonthlyResults,
    operatingProfitMarginMonthlyResults,
    ordinaryIncomeMonthlyResults,
    grossProfitMarginMonthlyResults,
    grossProfitMonthlyResults,
    datesResults,
  } = resultsMonthly

  const dispatch = useAppDispatch()
  const [tableList, setTableList] = useState<any>([])

  const [activeTab, setActiveTab] = useState('/dashboard')
  const [isSwitchActive, setIsSwitchActive] = useState(false)
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [isPlanningGraph, setIsPlanningGraph] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const [isThousandYenChecked, setIsThousandYenChecked] = useState(false)
  const isDataFetchedRef = useRef(false)

  const handleThousandYenToggle = () => {
    setIsThousandYenChecked((prevState) => !prevState)
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleGraphToggle = () => {
    setIsPlanningGraph((prevState) => !prevState)
  }
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data] = await Promise.all([
          dispatch(fetchAllClientData()).catch(handleError('client data')),
          // dispatch(fetchAllCards()).catch(handleError('cards data')),
          // dispatch(fetchGraphData()).catch(handleError('graph data')),
          dispatch(fetchNewGraphData()).catch(handleError('new graph data')),

          dispatch(fetchExpense())
            .catch(handleError('Expenses Planning data'))
            .then(() => dispatch(getExpenseTotals())),
          dispatch(fetchCos())
            .catch(handleError('Cost Of Sales Planning data'))
            .then(() => dispatch(getCostOfSaleTotals())),
          dispatch(fetchEmployeeExpense())
            .catch(handleError('Employee Expenses Planning data'))
            .then(() => dispatch(getEmployeeExpenseTotals())),
          dispatch(fetchProject())
            .catch(handleError('Projects Planning data'))
            .then(() => dispatch(getProjectTotals()))
            .then(() => dispatch(getMonthlyValues())),
          
          dispatch(fetchExpenseResult())
            .catch(handleError('Expenses Result data'))
            .then(() => dispatch(getExpenseResultsTotals())),
          dispatch(fetchCosResult())
            .catch(handleError('Cost Of Sales Result data'))
            .then(() => dispatch(getCostOfSaleResultsTotals())),
            dispatch(fetchEmployeeExpenseResult())
              .catch(handleError('Employee Expenses Result data'))
              .then(() => dispatch(getEmployeeExpenseResultTotals())),
          dispatch(fetchProjectResult())
            .catch(handleError('Projects Result data'))
            .then(() => dispatch(getProjectResultTotals()))
            .then(() => dispatch(getMonthlyResultValues())),
          
          dispatch(fetchTotals()).catch(handleError('Totals data')),
        ])
        if (data) setTableList(data.payload)
      } catch (error) {
        console.error('Unexpected error:', error)
      }
    }
    fetchData()
  }, [tableList])
          

  const handleError = (dataType) => (error) => {
    console.error(`Error fetching ${dataType}:`, error)
    return null
  }

  useEffect(() => {
    console.log('TEST TEST',test)
   },
  [test])
  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname, activeTab])

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

  const planningGraphData = {
    labels: dates, // This displays the 'dates' in y axis in the csv.
    datasets: [
      {
        type: 'bar' as const,
        label: translate('sales', language),
        data: dates.map((date) => projectSalesRevenueMonthlyPlanning[date] || 0),
        backgroundColor: '#6e748c',
        borderColor: 'black',
        borderWidth: 1,
      },
      {
        type: 'bar' as const,
        label: translate('grossProfit', language),
        data: dates.map((date) => grossProfitMonthlyPlanning[date]),
        backgroundColor: '#7696c6',
        borderColor: 'black',
        borderWidth: 1,
      },
      {
        type: 'bar' as const,
        label: translate('operatingIncome', language),
        data: dates.map((date) => operatingIncomeMonthlyPlanning[date]),
        backgroundColor: '#b8cbe2',
        borderColor: 'black',
        borderWidth: 1,
      },
      {
        type: 'bar' as const,
        label: translate('ordinaryIncome', language), // changed to monthly not cumulative
        data: dates.map((date) => ordinaryIncomeMonthlyPlanning[date] ?? 0),
        backgroundColor: '#bde386',
        borderColor: 'black',
        borderWidth: 1,
      },
    ],
  }

  const planningLineGraphData = {
    labels: dates,
    datasets: [
      {
        type: 'line' as const,
        label: translate('grossProfitMargin', language),
        data: dates
          ?.filter((date) => grossProfitMarginMonthlyPlanning[date])
          .map((date) => grossProfitMarginMonthlyPlanning[date]),
        backgroundColor: '#ff8e13',
        borderColor: '#ff8e13',
        borderWidth: 2,
      },
      {
        type: 'line' as const,
        label: translate('operatingProfitMargin', language),
        data: dates.map((date) => operatingProfitMarginMonthlyPlanning[date] ?? 0),
        backgroundColor: '#ec3e4a',
        borderColor: '#ec3e4a',
        borderWidth: 2,
      },
    ],
  }

  const resultsGraphData = {
    labels: dates, // This displays the 'dates' in y axis in the csv.
    datasets: [
      {
        type: 'bar' as const,
        label: translate('sales', language),
        data: dates.map((date) => projectSalesRevenueMonthlyResults[date] || 0),
        backgroundColor: '#6e748c',
        borderColor: 'black',
        borderWidth: 1,
      },
      {
        type: 'bar' as const,
        label: translate('grossProfit', language),
        data: dates.map((date) => grossProfitMonthlyResults[date]),
        backgroundColor: '#7696c6',
        borderColor: 'black',
        borderWidth: 1,
      },
      {
        type: 'bar' as const,
        label: translate('operatingIncome', language),
        data: dates.map((date) => operatingIncomeMonthlyResults[date]),
        backgroundColor: '#b8cbe2',
        borderColor: 'black',
        borderWidth: 1,
      },
      {
        type: 'bar' as const,
        label: translate('ordinaryIncome', language), // changed to monthly not cumulative
        data: dates.map((date) => ordinaryIncomeMonthlyResults[date] ?? 0),
        backgroundColor: '#bde386',
        borderColor: 'black',
        borderWidth: 1,
      },
    ],
  }

  const resultsLineGraphData = {
    labels: dates,
    datasets: [
      {
        type: 'line' as const,
        label: translate('grossProfitMargin', language),
        data: dates
          ?.filter((date) => grossProfitMarginMonthlyResults[date])
          .map((date) => grossProfitMarginMonthlyResults[date]),
        backgroundColor: '#ff8e13',
        borderColor: '#ff8e13',
        borderWidth: 2,
      },
      {
        type: 'line' as const,
        label: translate('operatingProfitMargin', language),
        data: dates.map((date) => operatingProfitMarginMonthlyResults[date] ?? 0),
        backgroundColor: '#ec3e4a',
        borderColor: '#ec3e4a',
        borderWidth: 2,
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
              <div
                className='dashboard-graph-change'
                style={{
                  backgroundColor: `${isPlanningGraph ? '#fec384c7' : '#CDE4FC'}`,
                }}
              >
                <label className='slider-switch'>
                  <input type='checkbox' checked={!isPlanningGraph} onChange={handleGraphToggle} />
                  <span className='slider'></span>
                </label>
                <p
                  style={{
                    padding: '0px',
                  }}
                >
                  {translate(`${!isPlanningGraph ? 'results' : 'planning'}`, language)}
                </p>
              </div>
              <div className='dashboard_graph_wrap'>
                <GraphDashboard
                  financialData={isPlanningGraph ? planningGraphData : resultsGraphData}
                  marginData={isPlanningGraph ? planningLineGraphData : resultsLineGraphData}
                  language={language}
                />
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
