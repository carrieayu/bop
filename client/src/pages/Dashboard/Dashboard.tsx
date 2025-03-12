import React, { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAppDispatch, useAppSelector } from '../../actions/hooks'
import { translate } from '../../utils/translationUtil'
import { createGraphData } from '../../utils/helperFunctionsUtil'
import GraphDashboard from '../../components/GraphDashboard/GraphDashboard'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import TableDashboard from '../../components/TableDashboard/TableDashboard'
import Sidebar from '../../components/Sidebar/Sidebar'
import { DashboardCard } from '../../components/Card/DashboardCard'
// Reducers
import { fetchGraphData, selectGraphValues } from '../../reducers/graph/graphSlice'
import { fetchCostOfSale } from '../../reducers/costOfSale/costOfSaleSlice'
import { getCostOfSaleTotals } from '../../reducers/costOfSale/costOfSaleSlice'
import { fetchExpense } from '../../reducers/expenses/expensesSlice'
import { getExpenseTotals } from '../../reducers/expenses/expensesSlice'
import { fetchEmployeeExpense, getEmployeeExpenseTotals } from '../../reducers/employeeExpense/employeeExpenseSlice'
import { fetchCostOfSaleResult, getCostOfSaleResultsTotals } from '../../reducers/costOfSale/costOfSaleResultSlice'
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
import ThreeOptionSlider from '../../components/Slider/ThreeOptionSlider'

// ***** TEST *******
import { planningSelector } from '../../selectors/planning/planningSelector'
import { resultsSelector} from '../../selectors/results/resultsSelector'
import { useSelector } from 'react-redux'
import { prepareGraphData } from '../../utils/graphDataPreparation'

const Dashboard = () => {
  const dispatch = useAppDispatch()
  // ************ TEST TEST ************
  
  // DATA FOR CARDS AND TABLE
  const planning = useSelector(planningSelector) // contains data/totals etc. from PLANNING: expenses, costOfSales, projects, employeeExpenses
  const results = useSelector(resultsSelector) // contains data/totals etc. from RESULTS: expenses, costOfSales, projects, employeeExpenses

  console.log('planning', planning, 'results', results)

  // ************* GRAPH TEST *********

    const graphPlanningData = {
      salesRevenueMonthly: planning.projects.salesRevenueMonthly,
      nonOperatingIncomeMonthly: planning.projects.nonOperatingIncomeMonthly,
      nonOperatingExpenseMonthly: planning.projects.nonOperatingExpenseMonthly,
      expensesMonthlyTotalsByDate: planning.expenses.monthlyTotalsByDate,
      costOfSaleMonthlyTotalsByDate: planning.costOfSales.monthlyTotalsByDate,
      employeeExpensesMonthlyTotalsByDate: planning.employeeExpenses.monthlyTotalsByDate,
    }
  
 const graphResultsData = {
    salesRevenueMonthly: results.projects.salesRevenueMonthly,
    nonOperatingIncomeMonthly: results.projects.nonOperatingIncomeMonthly,
    nonOperatingExpenseMonthly: results.projects.nonOperatingExpenseMonthly,
    expensesMonthlyTotalsByDate: results.expenses.monthlyTotalsByDate,
    costOfSaleMonthlyTotalsByDate: results.costOfSales.monthlyTotalsByDate,
    employeeExpensesMonthlyTotalsByDate: results.employeeExpenses.monthlyTotalsByDate,
  }

  const calculatedDataResults = prepareGraphData(graphResultsData, 'results')
  const resultsMonthlyTEST = { ...calculatedDataResults }

    console.log('graphPlanningData', graphPlanningData)
    const calculatedDataPlanning = prepareGraphData(graphPlanningData, 'planning')
    const planningMonthlyTEST = { ...calculatedDataPlanning } 
    console.log('calculatedDataPlanning',calculatedDataPlanning, 'planningMonthlyTEST', planningMonthlyTEST)

  // ************ END TEST TEST ************

  // DATA FOR GRAPH
  // const { resultsMonthly } = useAppSelector(selectGraphValues)
  // console.log('planningMonthly', planningMonthly)
  const {
    projectSalesRevenueMonthlyPlanning,
    operatingIncomeMonthlyPlanning,
    operatingProfitMarginMonthlyPlanning,
    ordinaryIncomeMonthlyPlanning,
    grossProfitMarginMonthlyPlanning,
    grossProfitMonthlyPlanning,
    dates,
  } = planningMonthlyTEST

  const optionArray = ['planning', 'results', 'both']
  const {
    projectSalesRevenueMonthlyResults,
    operatingIncomeMonthlyResults,
    operatingProfitMarginMonthlyResults,
    ordinaryIncomeMonthlyResults,
    grossProfitMarginMonthlyResults,
    grossProfitMonthlyResults,
    datesResults,
  } = resultsMonthlyTEST

  const [tableList, setTableList] = useState<any>([])
  const [activeTab, setActiveTab] = useState('/dashboard')
  const [isSwitchActive, setIsSwitchActive] = useState(false)
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const navigate = useNavigate()
  const location = useLocation()
  const [isThousandYenChecked, setIsThousandYenChecked] = useState(false)
  const handleThousandYenToggle = () => {
    setIsThousandYenChecked((prevState) => !prevState)
  }

  const [isToggled, setIsToggled] = useState(false)

  const handleToggle = () => {
    setIsToggled((prevState) => !prevState)
  }

  const [graphDataType, setGraphDataType] = useState('planning')

  const handleGraphChange = (e) => {
    const value = parseInt(e.target.value, 10)
    const options = ['planning', 'results', 'both']
    setGraphDataType(options[value])
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data] = await Promise.all([
          // PLANNING
          dispatch(fetchExpense())
            .catch(handleError('Expenses Planning data'))
            .then(() => dispatch(getExpenseTotals())),
          dispatch(fetchCostOfSale())
            .catch(handleError('Cost Of Sales Planning data'))
            .then(() => dispatch(getCostOfSaleTotals())),
          dispatch(fetchEmployeeExpense())
            .catch(handleError('Employee Expenses Planning data'))
            .then(() => dispatch(getEmployeeExpenseTotals())),
          dispatch(fetchProject())
            .catch(handleError('Projects Planning data'))
            .then(() => dispatch(getProjectTotals()))
            .then(() => dispatch(getMonthlyValues())),
          // RESULTS
          dispatch(fetchExpenseResult())
            .catch(handleError('Expenses Result data'))
            .then(() => dispatch(getExpenseResultsTotals())),
          dispatch(fetchCostOfSaleResult())
            .catch(handleError('Cost Of Sales Result data'))
            .then(() => dispatch(getCostOfSaleResultsTotals())),
          dispatch(fetchEmployeeExpenseResult())
            .catch(handleError('Employee Expenses Result data'))
            .then(() => dispatch(getEmployeeExpenseResultTotals())),
          dispatch(fetchProjectResult())
            .catch(handleError('Projects Result data'))
            .then(() => dispatch(getProjectResultTotals()))
            .then(() => dispatch(getMonthlyResultValues())),
          // TOTALS / GRAPH
          // dispatch(fetchTotals()).catch(handleError('Totals data')),
          dispatch(fetchGraphData()).catch(handleError('new graph data')),
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

  // Financials (Planning)
  const planningGraphData = createGraphData(
    [
      { label: 'sales', data: projectSalesRevenueMonthlyPlanning, bgColor: '#6e748c', type: 'bar' },
      { label: 'grossProfit', data: grossProfitMonthlyPlanning, bgColor: '#7696c6', type: 'bar' },
      { label: 'operatingIncome', data: operatingIncomeMonthlyPlanning, bgColor: '#b8cbe2', type: 'bar' },
      { label: 'ordinaryIncome', data: ordinaryIncomeMonthlyPlanning, bgColor: '#bde386', type: 'bar' },
    ],
    dates,
    language,
  )

  // Margins (Planning)
  const planningLineGraphData = createGraphData(
    [
      { label: 'grossProfitMargin', data: grossProfitMarginMonthlyPlanning, bgColor: '#ff8e13', type: 'line' },
      { label: 'operatingProfitMargin', data: operatingProfitMarginMonthlyPlanning, bgColor: '#ec3e4a', type: 'line' },
    ],
    dates,
    language,
  )

  // Financials (Results)
  const resultsGraphData = createGraphData(
    [
      { label: 'sales', data: projectSalesRevenueMonthlyResults, bgColor: '#6e748c', type: 'bar' },
      { label: 'grossProfit', data: grossProfitMonthlyResults, bgColor: '#7696c6', type: 'bar' },
      { label: 'operatingIncome', data: operatingIncomeMonthlyResults, bgColor: '#b8cbe2', type: 'bar' },
      { label: 'ordinaryIncome', data: ordinaryIncomeMonthlyResults, bgColor: '#bde386', type: 'bar' },
    ],
    datesResults,
    language,
  )

  // Margins (Results)
  const resultsLineGraphData = createGraphData(
    [
      { label: 'grossProfitMargin', data: grossProfitMarginMonthlyResults, bgColor: '#ff8e13', type: 'line' },
      { label: 'operatingProfitMargin', data: operatingProfitMarginMonthlyResults, bgColor: '#ec3e4a', type: 'line' },
    ],
    dates,
    language,
  )

  const planningAndResultGraphData = {
    planningData: {
      financial: planningGraphData,
      margin: planningLineGraphData,
    },
    resultsData: {
      financial: resultsGraphData,
      margin: resultsLineGraphData,
    },
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
                  planningValue={planning.projects.salesRevenueTotal}
                  resultValue={results.projects.salesRevenueTotal}
                  translateKey='sales'
                  language={language}
                />
                <DashboardCard
                  title={translate(language === 'en' ? 'operatingIncomeShort' : 'operatingIncome', language)}
                  planningValue={planning.calculations.operatingIncomeYearlyTotal}
                  resultValue={results.calculations.operatingIncomeYearlyTotal}
                  translateKey='operatingIncome'
                  language={language}
                />
                <DashboardCard
                  title={translate('grossProfitMargin', language)}
                  planningValue={planning.calculations.grossProfitMargin.toFixed(2)}
                  resultValue={results.calculations.grossProfitMargin.toFixed(2)}
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
                  resultValue={results.calculations.grossProfit}
                  translateKey='grossProfit'
                  language={language}
                />
                <DashboardCard
                  title={translate(
                    language === 'en' ? 'cumulativeOrdinaryIncomeShort' : 'cumulativeOrdinaryIncome',
                    language,
                  )}
                  planningValue={planning.calculations.ordinaryIncome}
                  resultValue={results.calculations.ordinaryIncome}
                  translateKey='cumulativeOrdinaryIncome'
                  language={language}
                />
                <DashboardCard
                  title={translate(
                    language === 'en' ? 'operatingProfitMarginShort' : 'operatingProfitMargin',
                    language,
                  )}
                  planningValue={planning.calculations.operatingProfitMargin.toFixed(2)}
                  resultValue={results.calculations.operatingProfitMargin.toFixed(2)}
                  translateKey='operatingProfitMargin'
                  language={language}
                  percentage={true}
                />
              </div>
            </div>
            &nbsp;&nbsp;&nbsp;
            <div className='dashboard_graph_cont'>
              <div className={`dashboard-graph-change background-color-${graphDataType}`}>
                <ThreeOptionSlider
                  min={0}
                  max={2}
                  step={1}
                  optionArray={optionArray}
                  option={graphDataType}
                  onChange={handleGraphChange}
                />
              </div>
              <div className={`dashboard_graph_wrap ${graphDataType === 'financials' ? 'financials' : 'margins'}`}>
                <GraphDashboard
                  language={language}
                  planningAndResultGraphData={planningAndResultGraphData}
                  graphDataType={graphDataType}
                  isToggled={isToggled}
                  handleToggle={handleToggle}
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
                <TableDashboard
                  isThousandYenChecked={isThousandYenChecked}
                  results={results}
                  planning={planning}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
