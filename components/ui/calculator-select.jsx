import React from "react";

function CalculatorSelect({ value, onValueChange, children }) {
  return (
    <select
      // dropdown styling
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      value={value}
      // calls function when user selects new assignment type
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  );
}

// placeholder wrapper to open dropdown
function CalculatorSelectTrigger({ children }) {
  return <>{children}</>;
}

// placeholder wrapper to display all dropdown options
function CalculatorSelectContent({ children }) {
  return <>{children}</>;
}

// Select a single dropdown option
function CalculatorSelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}

// default option that is displayed when nothing is selected yet
function CalculatorSelectValue({ placeholder }) {
  return <option value="">{placeholder}</option>;
}

export {
  CalculatorSelect,
  CalculatorSelectTrigger,
  CalculatorSelectContent,
  CalculatorSelectItem,
  CalculatorSelectValue,
};
