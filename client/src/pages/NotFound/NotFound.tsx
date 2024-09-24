import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";

interface ButtonData {
  label: string
  index: number
}

const NotFound = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }
  
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path);
    }
  }, [location.pathname]);
  
  return (
    <div className='notFound_wrapper'>
    <div className="notFound_header_cont">
      <div className="notFound_top_btn_cont">
        <div className="notFound_header-buttons">
          <Btn
              label="分析"
              onClick={() => handleTabClick("/dashboard")}
              className={activeTab === "analysis" ? "h-btn-active header-btn" : "header-btn"}
            />
            <Btn
              label="計画"
              onClick={() => handleTabClick("/planning-list")}
              className={activeTab === "plan" ? "h-btn-active header-btn" : "header-btn"}
            />
            <Btn
              label="実績"
              onClick={() => handleTabClick("/*")}
              className={activeTab === "/*" ? "h-btn-active header-btn" : "header-btn"}
            />
        </div>
      </div>
     </div>
     <div className="notFound_cont_wrapper">
             <Sidebar />
         <div className="notFound_wrapper_div">
                 <div className="notFound_top_content">
                     <div className="notFound_top_body_cont"></div>
                     <div className="notFound_mid_body_cont">
                         <div className="notFound_table_wrapper">
                          <div className="has-text-centered mt-10 not_found">
                              <h1 className="is-size-1 has-text-weight-bold has-text-primary">404</h1>
                              <p className="is-size-5 has-text-weight-medium">
                                {" "}
                                <span className="has-text-danger">Opps!</span> Page not found.
                              </p>
                              <p className="is-size-6 mb-2">
                                The page you’re looking for doesn’t exist.
                              </p>
                              <a href="index.html" className="button is-primary">
                                Go Home
                              </a>
                            </div>
                         </div>
                     </div>
                 </div>
         </div>
     </div>
 </div>
  );
};

export default NotFound;
