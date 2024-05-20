import React, { HtmlHTMLAttributes, useEffect, useState } from "react";
import { HeaderDashboard } from "../../components/header/header";
import Card from "../../components/Card/Card";
import GraphDashboard from "../../components/GraphDashboard/GraphDashboard";
import Pagination from "../../components/Pagination/Pagination";
import TableComponent from "../../components/Table/table";
import { GiHamburgerMenu } from 'react-icons/gi';
import { useDispatch } from "react-redux";
import { fetchAllCards } from "../../reducers/card/cardSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import { useAppSelector } from "../../actions/hooks";
import { RootState } from "../../app/store";
import CardEntity from "../../entity/cardEntity";
import { OtherPlanningEntity } from "../../entity/otherPlanningEntity";

const Dashboard = () => {
  const [showMenu, setShowMenu] = useState(false);
  const cardsList = useAppSelector((state: RootState) => state.cards.cardsList)
  const [totalSales, setTotalSales] = useState(null)
  const [totalOperatingProfit, setTotalOperatingProfit] = useState(null)
  const [totalGrossProfit, setTotalGrossProfit] = useState(0)
  const [totalNetProfitPeriod, setTotalNetProfitPeriod] = useState(0)
  const [totalGrossProfitMargin, setTotalGrossProfitMargin] = useState(0)
  const [totalOperatingProfitMargin, setTotalOperatingProfitMargin] = useState(0)
  const dispatch = useDispatch()
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    const getAllCards = async() => {
      try{
        dispatch(fetchAllCards() as unknown as UnknownAction)
      }catch(e: any) {

      }
    }

    getAllCards()
  }, [])

    useEffect(() =>{
      setTotalSales(getSum(cardsList.map((card) => Number(card.sales_revenue))))
      setTotalOperatingProfit(getSum(cardsList.map((card) => Number(card.operating_profit))))
      setTotalGrossProfit(getOtherPlanningSum(cardsList.map((card) => card.other_planning), "gross_profit"))
      setTotalNetProfitPeriod(getOtherPlanningSum(cardsList.map((card) => card.other_planning), "net_profit_for_the_period"))
      setTotalGrossProfitMargin(getOtherPlanningSum(cardsList.map((card) => card.other_planning), "gross_profit_margin"))
      setTotalOperatingProfitMargin(getOtherPlanningSum(cardsList.map((card) => card.other_planning), "operating_profit_margin"))
    },[cardsList])

    function getSum(data: number[]) {
      return data?.reduce((accumulator: number, currentValue: number): number => {
        return accumulator + currentValue;
      }, 0);
    }
    function getOtherPlanningSum(datas: OtherPlanningEntity[][], field: string) {
      
      let total = 0;
       datas.forEach((data: OtherPlanningEntity[]) => {
          total += data?.map((each) => each[field])
              .reduce((accumulator: number, currentValue: number): number => {
            return accumulator + currentValue;
          }, 0);
       });
       console.log("total", total)
      return total;
    }
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
                    <Card
                        backgroundColor="#fff"
                        shadow="2px 2px 4px rgba(0, 0, 0, 0.2)"
                        border="2px solid #ccc"
                        width="auto"
                        height="120px"
                    >
                        <div className="custom-card-content">
                          <p className="text1">売上高</p>
                          <p className="numTxt">{totalSales}&nbsp;<span className="totalTxt">円</span></p>
                          <p className="text2">トータル</p>
                        </div>
                    </Card>
                    <Card
                        backgroundColor="#fff"
                        shadow="2px 2px 4px rgba(0, 0, 0, 0.2)"
                        border="2px solid #ccc"
                        width="auto"
                        height="120px"
                    >
                        <div className="custom-card-content">
                          <p className="text1">営業利益</p>
                          <p className="numTxt">{totalOperatingProfit}&nbsp;<span className="totalTxt">円</span></p>
                          <p className="text2">トータル</p>
                        </div>
                    </Card>
                    <Card
                        backgroundColor="#fff"
                        shadow="2px 2px 4px rgba(0, 0, 0, 0.2)"
                        border="2px solid #ccc"
                        width="auto"
                        height="120px"
                    >
                        <div className="custom-card-content">
                          <p className="text1">売上総利益率</p>
                          <p className="numTxt">{totalGrossProfitMargin}&nbsp;<span className="totalTxt">円</span></p>
                          <p className="text2">トータル</p>
                        </div>
                    </Card>
                </div>
                &nbsp;&nbsp;&nbsp;
                <div className="right_card">
                  <Card
                        backgroundColor="#fff"
                        shadow="2px 2px 4px rgba(0, 0, 0, 0.2)"
                        border="2px solid #ccc"
                        width="auto"
                        height="120px"
                    >
                        <div className="custom-card-content">
                          <p className="text1">売上総利益</p>
                          <p className="numTxt">{totalGrossProfit}&nbsp;<span className="totalTxt">円</span></p>
                          <p className="text2">トータル</p>
                        </div>
                    </Card>
                  <Card
                        backgroundColor="#fff"
                        shadow="2px 2px 4px rgba(0, 0, 0, 0.2)"
                        border="2px solid #ccc"
                        width="auto"
                        height="120px"
                    >
                        <div className="custom-card-content">
                          <p className="text1">当期純利益</p>
                          <p className="numTxt">{totalNetProfitPeriod}&nbsp;<span className="totalTxt">円</span></p>
                          <p className="text2">トータル</p>
                        </div>
                    </Card>
                  <Card
                        backgroundColor="#fff"
                        shadow="2px 2px 4px rgba(0, 0, 0, 0.2)"
                        border="2px solid #ccc"
                        width="auto"
                        height="120px"
                    >
                        <div className="custom-card-content">
                          <p className="text1">営業利益率</p>
                          <p className="numTxt">{totalOperatingProfitMargin}&nbsp;<span className="totalTxt">円</span></p>
                          <p className="text2">トータル</p>
                        </div>
                    </Card>
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
        <div className="table_bg">
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
    </div>
  );
};

export default Dashboard;
