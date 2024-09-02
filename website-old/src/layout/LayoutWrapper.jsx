import React from 'react';

function LayoutWrapper({ children }) {
  return (
    <div className="mb-20 container px-2 sm:px-4 md:px-8 lg:px-16 flex justify-center flex-col align-middle mx-auto">
      <div className=" shadow-md px-1 sm:px-2 md:px:3 flex justify-center align-middle flex-col ">
        {children}
      </div>
    </div>
  );
}

export default LayoutWrapper;
