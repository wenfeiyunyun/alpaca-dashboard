export interface Candidate {
  symbol: string;
  price: number;
  hv: number;
  score: number;
}

export interface StockAnalysis {
  symbol: string;
  price: number;
  hv: number;
  score: number;
  recommendation: string;
  options: {
    putOTM5: number;
    putOTM10: number;
    callOTM5: number;
    callOTM10: number;
  };
}