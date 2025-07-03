
import { useContext } from 'react';
import { MarketListContext, MarketListContextType } from '../contexts/MarketListContext';

export const useMarketList = (): MarketListContextType => {
  const context = useContext(MarketListContext);
  if (context === undefined) {
    throw new Error('useMarketList must be used within a MarketListProvider');
  }
  return context;
};
