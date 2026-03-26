import type { Account, Position, TransferHistoryRecord, TransferComment } from '../types';

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

export const mockTransferHistory: TransferHistoryRecord[] = [
  { refId: 'CC35485712', date: '2026-03-25', symbol: 'ZTS', qty: 1, fromAccount: '51875883-13', toAccount: '28340331-24', status: 'Active', isCancellable: true, hasComments: true, unreadCommentCount: 1 },
  { refId: 'CC35485711', date: '2026-03-25', symbol: 'ABC', qty: 10, fromAccount: '51875883-13', toAccount: '28340331-24', status: 'Pending approval', isCancellable: false, hasComments: true, unreadCommentCount: 2 },
  { refId: 'CC35485657', date: '2026-03-25', symbol: 'AMD', qty: 1, fromAccount: '51875883-13', toAccount: '52024850-16', status: 'Pending approval', isCancellable: false, hasComments: false, unreadCommentCount: 0 },
  { refId: 'CC35485658', date: '2026-03-25', symbol: 'ARGX', qty: 1, fromAccount: '51875883-13', toAccount: '52024850-16', status: 'Pending approval', isCancellable: false, hasComments: false, unreadCommentCount: 0 },
  { refId: 'CC35485597', date: '2026-03-24', symbol: '8T27035.90', qty: 1, fromAccount: '51875883-13', toAccount: '28340331-24', status: 'Active', isCancellable: true, hasComments: true, unreadCommentCount: 0 },
  { refId: 'CC35485291', date: '2026-03-18', symbol: '8T27035.90', qty: 1, fromAccount: '51875883-13', toAccount: '28340331-24', status: 'Active', isCancellable: true, hasComments: false, unreadCommentCount: 0 },
  { refId: 'CC35484874', date: '2026-03-13', symbol: 'AAPL', qty: 1, fromAccount: '51875883-13', toAccount: '28340331-24', status: 'Active', isCancellable: true, hasComments: true, unreadCommentCount: 0 },
  { refId: 'CC35484870', date: '2026-03-13', symbol: '8T27035.90', qty: 1, fromAccount: '51875883-13', toAccount: '28340331-24', status: 'Active', isCancellable: true, hasComments: false, unreadCommentCount: 0 },
  { refId: 'CC35484867', date: '2026-03-13', symbol: 'AAPL', qty: 1, fromAccount: '51875883-13', toAccount: '28340331-24', status: 'Active', isCancellable: true, hasComments: false, unreadCommentCount: 0 },
  { refId: 'CC35484500', date: '2026-02-28', symbol: 'MSFT', qty: 5, fromAccount: '52024850-16', toAccount: '53600583-08', status: 'Completed', isCancellable: false, hasComments: true, unreadCommentCount: 0 },
  { refId: 'CC35484200', date: '2026-02-15', symbol: 'GOOGL', qty: 3, fromAccount: '28340331-24', toAccount: '51875883-13', status: 'Cancelled', isCancellable: false, hasComments: true, unreadCommentCount: 1 },
  { refId: 'CC35483900', date: '2026-01-20', symbol: 'TSLA', qty: 2, fromAccount: '53600583-08', toAccount: '28340331-24', status: 'Failed', isCancellable: false, hasComments: false, unreadCommentCount: 0 },
];

export const mockCommentsByTransfer: Record<string, TransferComment[]> = {
  CC35485712: [
    {
      commentId: 'cmt-001',
      agentName: 'Questrade customer service',
      body: 'Hello',
      createdAt: '2026-03-25T18:03:14Z',
      isRead: false,
      actionRequired: null,
    },
  ],
  CC35485711: [
    {
      commentId: 'cmt-010',
      agentName: 'Questrade Operations',
      body: 'We are reviewing your transfer request for 10 units of ABC. Please allow 1-2 business days for processing.',
      createdAt: '2026-03-25T09:15:00Z',
      isRead: false,
      actionRequired: null,
    },
    {
      commentId: 'cmt-011',
      agentName: 'Transfer Team',
      body: 'We need a signed Letter of Direction to process this transfer. Please upload the document at your earliest convenience.',
      createdAt: '2026-03-25T14:30:00Z',
      isRead: false,
      actionRequired: {
        description: 'Upload a Letter of Direction',
        deepLink: 'questrade://upload-document?ref=CC35485711',
        isCompleted: false,
      },
    },
  ],
  CC35485597: [
    {
      commentId: 'cmt-020',
      agentName: 'Questrade Operations',
      body: 'Your transfer is being processed. We noticed this is a fixed-income security — additional settlement time may apply.',
      createdAt: '2026-03-24T11:00:00Z',
      isRead: true,
      actionRequired: null,
    },
    {
      commentId: 'cmt-021',
      agentName: 'Transfer Team',
      body: 'We require verification of the bond holding. Please confirm the CUSIP and face value by contacting support or uploading documentation.\n\nFor more details visit: https://www.questrade.com/support',
      createdAt: '2026-03-24T16:45:00Z',
      isRead: true,
      actionRequired: {
        description: 'Verify bond holding details',
        deepLink: null,
        isCompleted: true,
      },
    },
  ],
  CC35484874: [
    {
      commentId: 'cmt-030',
      agentName: 'Questrade Operations',
      body: 'Your AAPL transfer has been queued for processing. Expected completion within 3 business days.',
      createdAt: '2026-03-13T10:00:00Z',
      isRead: true,
      actionRequired: null,
    },
  ],
  CC35484500: [
    {
      commentId: 'cmt-040',
      agentName: 'Questrade Operations',
      body: 'Your MSFT transfer has been completed successfully. 5 units have been moved to account 53600583-08.',
      createdAt: '2026-02-28T15:00:00Z',
      isRead: true,
      actionRequired: null,
    },
  ],
  CC35484200: [
    {
      commentId: 'cmt-050',
      agentName: 'Transfer Team',
      body: 'This transfer was cancelled at your request. If you did not request cancellation, please contact us immediately at 1-888-783-7866.',
      createdAt: '2026-02-16T09:30:00Z',
      isRead: false,
      actionRequired: null,
    },
  ],
};
