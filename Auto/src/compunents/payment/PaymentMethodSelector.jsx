import { cn } from '@/lib/utils';
import { CreditCard, Landmark, Wallet, Smartphone, Apple, BadgeCheck, DollarSign, Gift, Banknote } from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: Landmark, desc: 'Direct bank-to-bank transfer' },
  { id: 'Credit Card (Visa/Mastercard)', label: 'Credit Card', icon: CreditCard, desc: 'Visa / Mastercard' },
  { id: 'PayPal', label: 'PayPal', icon: Wallet, desc: 'Pay via PayPal balance' },
  { id: 'Google Pay', label: 'Google Pay', icon: Smartphone, desc: 'Google Pay wallet' },
  { id: 'Apple Pay', label: 'Apple Pay', icon: Apple, desc: 'Apple Pay secure payment' },
  { id: 'Cash App', label: 'Cash App', icon: Banknote, desc: 'Pay via Cash App' },
  { id: 'Venmo', label: 'Venmo', icon: DollarSign, desc: 'Pay via Venmo' },
  { id: 'Gift Card', label: 'Gift Card', icon: Gift, desc: 'Redeem a gift card' },
  { id: 'Debit Card (Visa/Mastercard)', label: 'Debit Card', icon: BadgeCheck, desc: 'Visa / Mastercard debit' },
];

export default function PaymentMethodSelector({ selected, onSelect }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PAYMENT_METHODS.map(method => {
          const Icon = method.icon;
          const isSelected = selected === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              )}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold leading-tight", isSelected ? "text-primary" : "text-foreground")}>
                  {method.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">{method.desc}</p>
              </div>
              {isSelected && (
                <div className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
        <span className="text-base">ℹ️</span>
        <span>Payment will be arranged offline after your order is confirmed. No payment is processed online.</span>
      </div>
    </div>
  );
}
