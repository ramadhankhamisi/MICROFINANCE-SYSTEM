// Loan Calculation Service with 20% fixed interest and daily repayment

export class LoanCalculationService {
  static INTEREST_RATE = 0.20;

  static getRepaymentDays(amount) {
    const tiers = [
      { min: 10000, max: 100000, days: 30 },
      { min: 100001, max: 500000, days: 35 },
      { min: 500001, max: 1000000, days: 40 },
      { min: 1000001, max: 5000000, days: 50 },
      { min: 5000001, max: 10000000, days: 60 },
    ];
    
    const tier = tiers.find(t => amount >= t.min && amount <= t.max);
    if (!tier) throw new Error(`Amount ${amount} outside supported range`);
    return tier.days;
  }

  static calculateTotalDue(principal) {
    return Math.round(principal * (1 + this.INTEREST_RATE) * 100) / 100;
  }

  static calculateInterest(principal) {
    return Math.round(principal * this.INTEREST_RATE * 100) / 100;
  }

  static calculateDailyPayment(principal, repaymentDays) {
    const totalDue = this.calculateTotalDue(principal);
    return Math.round((totalDue / repaymentDays) * 100) / 100;
  }

  static generateDailySchedule(loanData) {
    const { principal_amount, disbursal_date, repayment_days } = loanData;
    const totalDue = this.calculateTotalDue(principal_amount);
    const totalInterest = this.calculateInterest(principal_amount);
    const dailyPayment = this.calculateDailyPayment(principal_amount, repayment_days);
    
    const schedule = [];
    const startDate = new Date(disbursal_date);

    for (let day = 1; day <= repayment_days; day++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + day);
      
      const dayPrincipal = Math.round((principal_amount / repayment_days) * 100) / 100;
      const dayInterest = Math.round((totalInterest / repayment_days) * 100) / 100;

      schedule.push({
        day_number: day,
        principal_amount: dayPrincipal,
        interest_amount: dayInterest,
        total_amount: dailyPayment,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending',
      });
    }

    return schedule;
  }

  static getLoanTierInfo(amount) {
    const tiers = [
      { name: 'Tier 1', min: 10000, max: 100000, days: 30 },
      { name: 'Tier 2', min: 100001, max: 500000, days: 35 },
      { name: 'Tier 3', min: 500001, max: 1000000, days: 40 },
      { name: 'Tier 4', min: 1000001, max: 5000000, days: 50 },
      { name: 'Tier 5', min: 5000001, max: 10000000, days: 60 },
    ];

    const tier = tiers.find(t => amount >= t.min && amount <= t.max);
    if (!tier) return null;

    return {
      tierName: tier.name,
      repaymentDays: tier.days,
      dailyPayment: this.calculateDailyPayment(amount, tier.days),
      totalDue: this.calculateTotalDue(amount),
      interest: this.calculateInterest(amount),
    };
  }
}

export default LoanCalculationService;
