import React from 'react';

interface Props {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({ current, total, onChange }) => {
  if (total <= 1) return null;
  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 disabled:opacity-50"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        Previous
      </button>
      <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
        Page {current} of {total}
      </span>
      <button
        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 disabled:opacity-50"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
