import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAppDispatch } from '../../actions/hooks'
import { translate } from '../../utils/translationUtil'
import { handleError } from '../../utils/helperFunctionsUtil'
// COMPONENTS
import { DashboardCard } from '../../components/Card/DashboardCard'
import GraphDashboard from '../../components/GraphDashboard/GraphDashboard'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import TableDashboard from '../../components/TableDashboard/TableDashboard'
import Sidebar from '../../components/Sidebar/Sidebar'
import ThreeOptionSlider from '../../components/Slider/ThreeOptionSlider'
// REDUCERS
import { fetchCostOfSale } from '../../reducers/costOfSale/costOfSaleSlice'
import { fetchExpense } from '../../reducers/expenses/expensesSlice'
import { fetchEmployeeExpense } from '../../reducers/employeeExpense/employeeExpenseSlice'
import { fetchCostOfSaleResult } from '../../reducers/costOfSale/costOfSaleResultSlice'
import { fetchExpenseResult } from '../../reducers/expenses/expensesResultsSlice'
import { fetchProjectResult } from '../../reducers/project/projectResultSlice'
import { fetchProject } from '../../reducers/project/projectSlice'
import { fetchEmployeeExpenseResult } from '../../reducers/employeeExpense/employeeExpenseResultSlice'
// SELECTORS
import { planningSelector, planningGraphDataPreparedSelector } from '../../selectors/planning/planningSelector'
import { resultsSelector, resultsGraphDataPreparedSelector } from '../../selectors/results/resultsSelector'
import { organiseGraphData } from '../../utils/graphDataOrganiser'

const Dashboard = () => {
  const { language, setLanguage } = useLanguage()
  const [activeTab, setActiveTab] = useState('/dashboard')
  const [graphDataType, setGraphDataType] = useState('planning')
  const [isSwitchActive, setIsSwitchActive] = useState(false)
  const [isThousandYenChecked, setIsThousandYenChecked] = useState(false)
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [isToggled, setIsToggled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const optionArray = ['planning', 'results', 'both']
  const handleToggle = () => {
    setIsToggled((prevState) => !prevState)
  }
  const handleThousandYenToggle = () => {
    setIsThousandYenChecked((prevState) => !prevState)
  }
  const dispatch = useAppDispatch()
  // DATA FOR 'CARDS' AND 'TABLE'
  const planning = useSelector(planningSelector) // contains data/totals etc. from PLANNING: expenses, costOfSales, projects, employeeExpenses
  const results = useSelector(resultsSelector) // contains data/totals etc. from RESULTS: expenses, costOfSales, projects, employeeExpenses
  // DATA FOR 'GRAPH'
  const planningGraph = useSelector(planningGraphDataPreparedSelector)
  const resultsGraph = useSelector(resultsGraphDataPreparedSelector)
  // Organises the graph data for the charts. Color, Chart Type (Line/Bar) etc.
  const planningAndResultGraphData = organiseGraphData(planningGraph, resultsGraph, language)

 
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
        const fetchActions = [
          { action: () => dispatch(fetchExpense()) },
          { action: () => dispatch(fetchCostOfSale()) },
          { action: () => dispatch(fetchEmployeeExpense()) },
          { action: () => dispatch(fetchProject()) },
          { action: () => dispatch(fetchExpenseResult()) },
          { action: () => dispatch(fetchCostOfSaleResult()) },
          { action: () => dispatch(fetchEmployeeExpenseResult()) },
          { action: () => dispatch(fetchProjectResult()) },
        ]

        await Promise.all(fetchActions.map(({ action }) => action().catch((error) => handleError(action.name, error))))
      } catch (error) {
        console.error('Unexpected error:', error)
      }
    }

    fetchData()
  }, [dispatch])

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
                <TableDashboard isThousandYenChecked={isThousandYenChecked} results={results} planning={planning} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
