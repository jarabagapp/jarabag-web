import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { BankAccount } from '@/types'

const mockBankAccounts: BankAccount[] = [
  { id: 'ba-1', bankName: 'GTBank', accountNumber: '0123456789', accountName: 'Adeola Johnson', isDefault: true },
  { id: 'ba-2', bankName: 'Access Bank', accountNumber: '0987654321', accountName: 'Adeola Johnson', isDefault: false },
]

export const useWalletStore = defineStore('wallet', () => {
  const bankAccounts = ref<BankAccount[]>(mockBankAccounts)

  function addBankAccount(account: Omit<BankAccount, 'id'>) {
    if (account.isDefault) {
      bankAccounts.value.forEach(a => a.isDefault = false)
    }
    const newAccount: BankAccount = {
      ...account,
      id: `ba-${Date.now()}`
    }
    bankAccounts.value.push(newAccount)
  }

  function removeBankAccount(id: string) {
    bankAccounts.value = bankAccounts.value.filter(a => a.id !== id)
  }

  return {
    bankAccounts,
    addBankAccount,
    removeBankAccount,
  }
})
