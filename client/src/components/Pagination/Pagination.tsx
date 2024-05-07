import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {

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
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))} // Ensure currentPage doesn't go below 1
                disabled={currentPage === 1} // Disable the button if currentPage is 1
              >
                同
              </button>
              <button
                id="nextButton"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} // Ensure currentPage doesn't exceed totalPages
                disabled={currentPage === totalPages} // Disable the button if currentPage is equal to totalPages
              >
                千円
              </button>
              <button
                id="lastButton"
                onClick={() => onPageChange(totalPages)} // Go to the last page
                disabled={currentPage === totalPages} // Disable the button if currentPage is already on the last page
              >
                百万円
              </button>
            </div>
          </div>
      </div>
  );
}

export default Pagination;
