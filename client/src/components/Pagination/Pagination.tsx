import React, { useEffect, useState } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const [activeButton, setActiveButton] = useState<string>('prevButton');

  const handleButtonClick = (page: number, buttonId: string) => {
    onPageChange(page);
    setActiveButton(buttonId);
  };

  // Ensure the prevButton is active by default on initial render
  useEffect(() => {
    setActiveButton('prevButton');
  }, []);
  return (
      <div className="content">
       <div className="paginate">
          <p className="txt1">0円行动作表示</p>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>

            <div className="total-page">
              <span>{currentPage} out of {totalPages}</span>
            </div>

            <div className="pagination">
              <button
                id="prevButton"
                onClick={() => handleButtonClick(Math.max(currentPage - 1, 1), 'prevButton')} // Ensure currentPage doesn't go below 1
                disabled={currentPage === 1} // Disable the button if currentPage is 1
                className={activeButton === 'prevButton' ? 'activeButton' : ''}
              >
                同
              </button>
              <button
                id="nextButton"
                onClick={() => handleButtonClick(Math.min(currentPage + 1, totalPages), 'nextButton')} // Ensure currentPage doesn't exceed totalPages
                disabled={currentPage === totalPages} // Disable the button if currentPage is equal to totalPages
                className={activeButton === 'nextButton' ? 'activeButton' : ''}
              >
                千円
              </button>
              <button
                id="lastButton"
                onClick={() => handleButtonClick(totalPages, 'lastButton')} // Go to the last page
                disabled={currentPage === totalPages} // Disable the button if currentPage is already on the last page
                className={activeButton === 'lastButton' ? 'activeButton' : ''}
              >
                百万円
              </button>
            </div>
          </div>
      </div>
  );
}

export default Pagination;
