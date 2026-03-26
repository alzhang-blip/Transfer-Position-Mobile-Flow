import type { Account, Position } from '../types';

export const mockAccounts: Account[] = [
  {
    accountId: '28340331',
    accountType: 'Individual Margin',
    displayName: 'Individual Margin - 28340331',
    eligibility: 'eligible',
    isSelfDirected: true,
  },
  {
    accountId: '52024850',
    accountType: 'Individual RRSP',
    displayName: 'Individual RRSP - 52024850',
    eligibility: 'eligible',
    isSelfDirected: true,
  },
  {
    accountId: '53600583',
    accountType: 'Individual TFSA',
    displayName: 'Individual TFSA - 53600583',
    eligibility: 'eligible',
    isSelfDirected: true,
  },
  {
    accountId: '51875883',
    accountType: 'Individual TFSA',
    displayName: 'Individual TFSA - 51875883',
    eligibility: 'eligible',
    isSelfDirected: true,
  },
  {
    accountId: '53600581',
    accountType: 'Individual FHSA',
    displayName: 'Individual FHSA - 53600581',
    eligibility: 'eligible',
    isSelfDirected: true,
  },
  {
    accountId: '40100333',
    accountType: 'Individual Cash',
    displayName: 'Individual Cash - 40100333',
    eligibility: 'pending_approval',
    isSelfDirected: true,
  },
  {
    accountId: 'QXDE8O',
    accountType: 'Individual FX & CFD',
    displayName: 'Individual FX & CFD - QXDE8O',
    eligibility: 'fx',
    isSelfDirected: true,
  },
  {
    accountId: '29600707',
    accountType: 'Individual Margin',
    displayName: 'Individual Margin - 29600707',
    eligibility: 'not_eligible',
    isSelfDirected: true,
  },
  {
    accountId: '29700285',
    accountType: 'Individual Margin',
    displayName: 'Individual Margin - 29700285',
    eligibility: 'not_eligible',
    isSelfDirected: true,
  },
  {
    accountId: '29700277',
    accountType: 'Individual Margin',
    displayName: 'Individual Margin - 29700277',
    eligibility: 'not_eligible',
    isSelfDirected: true,
  },
  {
    accountId: '53600481',
    accountType: 'Individual RESP',
    displayName: 'Individual RESP - 53600481',
    eligibility: 'not_eligible',
    isSelfDirected: true,
  },
];

const marginPositions: Position[] = [
  {
    symbol: 'AMZN',
    companyName: 'Amazon Com Inc',
    availableUnits: 0.5,
    isFractional: true,
    isTransferable: false,
    isMutualFund: false,
  },
  {
    symbol: 'CASH.TO',
    companyName: 'Global X Investments Canada Inc. High Interest Savings ETF',
    availableUnits: 1942,
    isFractional: false,
    isTransferable: true,
    isMutualFund: false,
  },
  {
    symbol: 'HOD.TO',
    companyName: 'Global X Investments Canada Inc. BetaPro Crude Oil Inverse Leveraged Daily Bear ETF',
    availableUnits: 8000,
    isFractional: false,
    isTransferable: true,
    isMutualFund: false,
  },
];

const rrspPositions: Position[] = [
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc',
    availableUnits: 25,
    isFractional: false,
    isTransferable: true,
    isMutualFund: false,
  },
  {
    symbol: 'MSFT',
    companyName: 'Microsoft Corp',
    availableUnits: 10.5,
    isFractional: true,
    isTransferable: true,
    isMutualFund: false,
  },
  {
    symbol: 'RBF1005',
    companyName: 'RBC Canadian Equity Fund Series A',
    availableUnits: 150,
    isFractional: false,
    isTransferable: true,
    isMutualFund: true,
  },
  {
    symbol: 'TDB900',
    companyName: 'TD Canadian Index Fund - e Series',
    availableUnits: 200,
    isFractional: false,
    isTransferable: true,
    isMutualFund: true,
  },
  {
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc Class A',
    availableUnits: 5,
    isFractional: false,
    isTransferable: true,
    isMutualFund: false,
  },
];

const fractionalOnlyPositions: Position[] = [
  {
    symbol: 'BRK.A',
    companyName: 'Berkshire Hathaway Inc Class A',
    availableUnits: 0.3,
    isFractional: true,
    isTransferable: false,
    isMutualFund: false,
  },
  {
    symbol: 'NVR',
    companyName: 'NVR Inc',
    availableUnits: 0.7,
    isFractional: true,
    isTransferable: false,
    isMutualFund: false,
  },
  {
    symbol: 'BKNG',
    companyName: 'Booking Holdings Inc',
    availableUnits: 0.1,
    isFractional: true,
    isTransferable: false,
    isMutualFund: false,
  },
];

const generateLargePositionList = (): Position[] => {
  const tickers = [
    ['AAPL', 'Apple Inc'],
    ['ABBV', 'Abbvie Inc'],
    ['ABNB', 'Airbnb Inc'],
    ['ABT', 'Abbott Laboratories'],
    ['ACN', 'Accenture PLC'],
    ['ADBE', 'Adobe Inc'],
    ['ADI', 'Analog Devices Inc'],
    ['ADM', 'Archer-Daniels-Midland Co'],
    ['ADP', 'Automatic Data Processing'],
    ['ADSK', 'Autodesk Inc'],
    ['AEP', 'American Electric Power'],
    ['AFL', 'Aflac Inc'],
    ['AIG', 'American Intl Group Inc'],
    ['ALGN', 'Align Technology Inc'],
    ['ALL', 'Allstate Corp'],
    ['AMAT', 'Applied Materials Inc'],
    ['AMD', 'Advanced Micro Devices Inc'],
    ['AMGN', 'Amgen Inc'],
    ['AMP', 'Ameriprise Financial Inc'],
    ['AMT', 'American Tower Corp'],
    ['AMZN', 'Amazon Com Inc'],
    ['ANET', 'Arista Networks Inc'],
    ['APD', 'Air Products & Chemicals'],
    ['APH', 'Amphenol Corp'],
    ['APTV', 'Aptiv PLC'],
    ['AVGO', 'Broadcom Inc'],
    ['AXP', 'American Express Co'],
    ['BA', 'Boeing Co'],
    ['BAC', 'Bank of America Corp'],
    ['BDX', 'Becton Dickinson & Co'],
    ['BIIB', 'Biogen Inc'],
    ['BK', 'Bank of New York Mellon'],
    ['BKNG', 'Booking Holdings Inc'],
    ['BLK', 'BlackRock Inc'],
    ['BMY', 'Bristol-Myers Squibb Co'],
    ['BSX', 'Boston Scientific Corp'],
    ['C', 'Citigroup Inc'],
    ['CAT', 'Caterpillar Inc'],
    ['CB', 'Chubb Ltd'],
    ['CCI', 'Crown Castle Intl Corp'],
  ];

  const fractionalSymbols = new Set(['AAPL', 'AMZN', 'AVGO']);
  return tickers.map(([symbol, name]) => {
    const isFrac = fractionalSymbols.has(symbol);
    return {
      symbol,
      companyName: name,
      availableUnits: isFrac ? parseFloat((0.5 + Math.random() * 2).toFixed(6)) : Math.floor(Math.random() * 50) + 1,
      isFractional: isFrac,
      isTransferable: !isFrac,
      isMutualFund: false,
    };
  });
};

export const mockPositionsByAccount: Record<string, Position[]> = {
  '28340331': marginPositions,
  '52024850': rrspPositions,
  '53600583': generateLargePositionList().slice(0, 8),
  '51875883': generateLargePositionList(),
  '53600581': generateLargePositionList().slice(0, 5),
  '40100333': [],
  QXDE8O: fractionalOnlyPositions,
  '29600707': [],
  '29700285': [],
  '29700277': [],
  '53600481': [],
};
