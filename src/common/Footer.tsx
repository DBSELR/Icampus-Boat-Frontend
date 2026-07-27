import React from "react";

interface FooterProps {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;

  recordsPerPage: number;
  setRecordsPerPage: React.Dispatch<React.SetStateAction<number>>;

  totalRecords: number;
  totalPages: number;

  startIndex: number;
  endIndex: number;

  getPagination: () => (number | string)[];
}

const Footer = ({
  currentPage,
  setCurrentPage,
  recordsPerPage,
  setRecordsPerPage,
  totalRecords,
  totalPages,
  startIndex,
  endIndex,
  getPagination,
}: FooterProps) => {
  return (
    <div className="dbs-table-footer">
      <div className="dbs-footer-left">
        <span className="dbs-footer-label">Show</span>

        <div className="dbs-select-wrapper">
          <select
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <span className="dbs-footer-label">entries</span>
      </div>

      <div className="dbs-footer-info">
        Showing
        <strong>{totalRecords === 0 ? 0 : startIndex + 1}</strong>
        {" - "}
        <strong>{Math.min(endIndex, totalRecords)}</strong>
        of
        <strong>{totalRecords}</strong>
        entries
      </div>

      <div className="dbs-pagination">
        <button
          className="dbs-page-nav"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          ← Previous
        </button>

        {getPagination().map((page, index) =>
          page === "..." ? (
            <span key={index} className="dbs-page-dots">
              ...
            </span>
          ) : (
            <button
              key={index}
              className={`dbs-page-number ${
                currentPage === page ? "active" : ""
              }`}
              onClick={() => setCurrentPage(page as number)}
            >
              {page}
            </button>
          ),
        )}

        <button
          className="dbs-page-nav"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Footer;
