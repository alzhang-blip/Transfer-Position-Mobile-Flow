interface MoveMoneyHubProps {
  onTransferInvestments: () => void;
  onTransferInvestmentsHistory: () => void;
  onClose: () => void;
  showToast: (text: string, variant?: 'info' | 'error' | 'success') => void;
}

function HubCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-design-border bg-white px-4 py-4 shadow-card active:bg-[#F0F2F5] transition-colors"
    >
      <h3 className="type-heading-md text-design-ink">{title}</h3>
      <p className="type-body-md text-design-muted mt-1.5 leading-relaxed">{description}</p>
    </button>
  );
}

export function MoveMoneyHub({
  onTransferInvestments,
  onTransferInvestmentsHistory,
  onClose,
  showToast,
}: MoveMoneyHubProps) {
  const placeholder = () => {
    showToast('This prototype only includes Transfer investments.', 'info');
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-design-canvas">
      <header className="relative flex-shrink-0 flex items-center justify-center px-3.5 pt-3 pb-3.5 border-b border-design-border bg-design-canvas">
        <h1 className="type-display-sm text-design-ink text-center">Move money</h1>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 h-9 w-9 rounded-full bg-design-close flex items-center justify-center text-design-muted hover:bg-design-close-hover hover:text-design-ink transition-colors"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-3.5 py-5">
        <div className="space-y-3">
          <HubCard
            title="Deposit"
            description="Add money to your Questrade account."
            onClick={placeholder}
          />
          <HubCard
            title="Transfer funds"
            description="Move CAD or USD between your Questrade accounts."
            onClick={placeholder}
          />
          <HubCard
            title="Transfer investments"
            description="Move stocks, options, or other positions between your Questrade accounts."
            onClick={onTransferInvestments}
          />
          <HubCard
            title="Withdrawal"
            description="Take money out of your Questrade account."
            onClick={placeholder}
          />
        </div>

        <h2 className="type-heading-md text-design-ink mt-8 mb-3 font-semibold">Move money history</h2>
        <div className="space-y-3">
          <HubCard
            title="Deposit history"
            description="Review your deposit transactions."
            onClick={placeholder}
          />
          <HubCard
            title="Transfer funds history"
            description="Review your transfer funds transactions."
            onClick={placeholder}
          />
          <HubCard
            title="Transfer investments history"
            description="Review your transfer investment requests."
            onClick={onTransferInvestmentsHistory}
          />
        </div>
      </div>
    </div>
  );
}
