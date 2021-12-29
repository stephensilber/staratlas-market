import React, { createContext, useState } from "react";

export const MarketFeedContext = createContext();

// This context provider is passed to any component requiring the context
export const MarketFeedProvider = ({ children }) => {

  return (
    <MarketFeedContext.Provider
      value={{
        highlightedForCloseCount
      }}
    >
      {children}
    </MarketFeedContext.Provider>
  );
};
