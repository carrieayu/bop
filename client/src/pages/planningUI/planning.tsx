import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from '@reduxjs/toolkit';
import { fetchAllClientData } from '../../reducers/table/tableSlice';
import Sidebar from '../../components/SideBar/Sidebar';
import Btn from '../../components/Button/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import TablePlanning from '../../components/Table/tablePlanning'; // Import TablePlanning component
import { TableComponentProps } from '../../components/Table/table.component';
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil';
import EditTablePlanning from '../../components/Table/editTablePlanning';

const header = ['計画'];
const smallDate = ['2022/24月', '2022/25月', '2022/26月'];
const dates = ['04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月', '1月', '2月', '3月'];

const Planning = () => {
  const [tableList, setTableList] = useState<any>([]);
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const totalPages = Math.ceil(tableList?.length / rowsPerPage);
  const select = [5, 10, 100];
  const [paginatedData, setPaginatedData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('/planning');
  const [isSwitchActive, setIsSwitchActive] = useState(false); // State for switch
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); // State for switch in translation


  const [isEditing, setIsEditing] = useState(false)
  const [initialLanguage, setInitialLanguage] = useState(language);

  const handleClick = () => {
    setIsEditing((prevState) => {
      const newEditingState = !prevState;
      if (newEditingState) {
        setLanguage(initialLanguage);
      }
  
      return newEditingState;
    });
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    navigate(tab);
  };

  const fetchData = async () => {
    try {
      const res = await dispatch(fetchAllClientData() as unknown as UnknownAction);
      setTableList(res.payload);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const startIndex = currentPage * rowsPerPage;
    setPaginatedData(tableList?.slice(startIndex, startIndex + rowsPerPage));
  }, [currentPage, rowsPerPage, tableList]);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/planning' || path === '/*') {
      setActiveTab(path);
    }
  }, [location.pathname]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (numRows: number) => {
    setRowsPerPage(numRows);
    setCurrentPage(0);
  };

  const handleSwitchToggle = () => {
    setIsSwitchActive(prevState => !prevState);
  };

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en');
  }, [language]);

  const handleTranslationSwitchToggle = () => {
    if (!isEditing) {
      const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
      setInitialLanguage(language); 
      setLanguage(newLanguage);
    }
  };

  return (
    <div className='wrapper'>
      <div className='header_cont'>
        <div className='header-buttons'>
          <Btn
            label={translate('analysis', language)}
            onClick={() => handleTabClick('/dashboard')}
            className={activeTab === '/dashboard' ? 'h-btn-active header-btn' : 'header-btn'}
          />
          <Btn
            label={translate('profitAndlossPlanning', language)}
            onClick={() => handleTabClick('/planning')}
            className={activeTab === '/planning' ? 'h-btn-active header-btn' : 'header-btn'}
          />
          <Btn
            label={translate('results', language)}
            onClick={() => handleTabClick('/*')}
            className={activeTab === '/*' ? 'h-btn-active header-btn' : 'header-btn'}
          />
        </div>
        <div className='language-toggle'>
          <p className='pl-label'>English</p>
          <label className='switch'>
            <input type='checkbox' checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle} disabled={isEditing}/>
            <span className='slider'></span>
          </label>
        </div>
      </div>
      <div className='content_wrapper'>
        <div className='sidebar'>
          <Sidebar />
        </div>
        <div className='projectlist_wrapper planning_wrapper'>
          <div className='proj_top_content plan_top_cont'>
            <div className='dashboard_content planning'>
              <div className='bottom_cont planning_btm'>
                <div className='pagination_cont planning_header'>
                  <div className='left-content'>
                    <p>{translate('profitAndlossPlanning', language)}</p>
                  </div>
                  <div className='right-content'>
                    <div className='paginate'>
                    <button className='mode_switch' onClick={handleClick}>{isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}</button>
                      <p className='pl-label'>{translate('displayByProject', language)}</p>
                      <label className='switch'>
                        <input type='checkbox' checked={isSwitchActive} onChange={handleSwitchToggle} />
                        <span className='slider'></span>
                      </label>
                      <p className='pl-label'>{translate('thousandYen', language)}</p>
                      <label className='switch'>
                        <input type='checkbox' />
                        <span className='slider'></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className='planning_tbl_cont'>
                  <div className={`table_content_planning ${isSwitchActive ? 'hidden' : ''}`}>
                    {/* Render the TablePlanning component here */}
                    {isEditing ? <EditTablePlanning /> : <TablePlanning />}
                  </div>
                  <div className={`table_content_props ${isSwitchActive ? '' : 'hidden'}`}>
                    <TableComponentProps data={paginatedData} header={header} dates={dates} smallDate={smallDate} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Planning;
