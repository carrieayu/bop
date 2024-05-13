import React, { useState } from "react";
import { HeaderDashboard } from "../../components/header/header";
import Card from "../../components/Card/Card";
import GraphDashboard from "../../components/GraphDashboard/GraphDashboard";
import Pagination from "../../components/Pagination/Pagination";
import TableComponent from "../../components/Table/table";
import { GiHamburgerMenu } from 'react-icons/gi';

const Dashboard = () => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const cards = Array(6).fill(0).map((_, index) => (
    <Card
      key={index}
      backgroundColor="#fff"
      shadow="2px 2px 4px rgba(0, 0, 0, 0.2)"
      border="2px solid #ccc"
      width="auto"
      height="120px"
    >
      <div className="custom-card-content">
        <p className="text1">売上高</p>
        <p className="numTxt">1,343,596,407&nbsp;<span className="totalTxt">円</span></p>
        <p className="text2">トータル</p>
      </div>
    </Card>
  ));

    //State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(100 / 10);

    //Function to handle page change
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };
  return (
    <div className="wrapper">
      <div className="header_cont">
        <HeaderDashboard value="value" />
        {showMenu && (
          <div className="menu">
            <HeaderDashboard value="value" />
          </div>
        )}
        <div className="hamburger" onClick={toggleMenu}>
          <span className="burger_icon"><GiHamburgerMenu /></span>
        </div>
      </div>
      <div className="body_cont">
        <div className="card_cont">
          <div className="left_card">
            {cards.slice(0,3)}
          </div>
          &nbsp;&nbsp;&nbsp;
          <div className="right_card">
            {cards.slice(3,6)}
          </div>
        </div>
        &nbsp;&nbsp;&nbsp;
        <div className="graph_cont">
          <div className="graph_wrap">
            <GraphDashboard />
          </div>
        </div>
      </div>
      <div className="bottom_cont">
        <div className="pagination_cont">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
        <div className="table_cont">
          <TableComponent />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
