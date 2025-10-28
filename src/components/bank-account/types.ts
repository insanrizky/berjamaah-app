export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isDefault: boolean;
  createdAt: string;
}

export interface BankAccountFormData {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isDefault: boolean;
}
