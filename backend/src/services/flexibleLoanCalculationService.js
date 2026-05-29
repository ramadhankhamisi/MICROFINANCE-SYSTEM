/**
 * Flexible Loan Calculation Service
 * Lets loan officers choose the customer's repayment period and calculates totals.
 */

export class FlexibleLoanCalculationService {
  static INTEREST_RATE = 0.20;
  static MIN_AMOUNT = 10000;
  static MAX_AMOUNT = 10000000;
  static MIN_REPAYMENT_DAYS = 1;
  static MAX_REPAYMENT_DAYS = 365;

  static validateLoanAmount(amount) {
    return amount >= this.MIN_AMOUNT && amount <= this.MAX_AMOUNT;
  }

  static validateRepaymentDays(amount, repaymentDays) {
    if (!this.validateLoanAmount(Number(amount))) {
      return {
        isValid: false,
        allowedRange: { min: this.MIN_REPAYMENT_DAYS, max: this.MAX_REPAYMENT_DAYS },
        message: `Loan amount must be between ${this.MIN_AMOUNT.toLocaleString()} and ${this.MAX_AMOUNT.toLocaleString()} TSH`,
      };
    }

    const days = Number(repaymentDays);
    const isValid = Number.isInteger(days)
      && days >= this.MIN_REPAYMENT_DAYS
      && days <= this.MAX_REPAYMENT_DAYS;

    return {
      isValid,
      allowedRange: { min: this.MIN_REPAYMENT_DAYS, max: this.MAX_REPAYMENT_DAYS },
      message: isValid
        ? `${days} repayment day${days === 1 ? '' : 's'} selected by loan officer`
        : `Repayment days must be between ${this.MIN_REPAYMENT_DAYS} and ${this.MAX_REPAYMENT_DAYS}`,
    };
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
    const {
      principal_amount,
      disbursal_date,
      repayment_days,
    } = loanData;

    const totalDue = this.calculateTotalDue(principal_amount);
    const totalInterest = this.calculateInterest(principal_amount);
    const dailyPrincipal = Math.round((principal_amount / repayment_days) * 100) / 100;
    const dailyInterest = Math.round((totalInterest / repayment_days) * 100) / 100;
    const schedule = [];
    const startDate = new Date(disbursal_date);

    for (let day = 1; day <= repayment_days; day++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + day);

      let dayPrincipal = dailyPrincipal;
      let dayInterest = dailyInterest;

      if (day === repayment_days) {
        const totalPaid = schedule.reduce(
          (sum, item) => sum + item.principal_amount + item.interest_amount,
          0
        );
        dayPrincipal = Math.round((principal_amount - (totalPaid - (day - 1) * dailyInterest)) * 100) / 100;
        dayInterest = Math.round((totalDue - totalPaid - dayPrincipal) * 100) / 100;
      }

      schedule.push({
        day_number: day,
        principal_amount: dayPrincipal,
        interest_amount: dayInterest,
        total_amount: Math.round((dayPrincipal + dayInterest) * 100) / 100,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending',
      });
    }

    return schedule;
  }

  static getLoanCalculationPreview(principal, repaymentDays) {
    const validation = this.validateRepaymentDays(principal, repaymentDays);
    const totalDue = this.calculateTotalDue(principal);
    const interest = this.calculateInterest(principal);
    const dailyPayment = validation.isValid
      ? this.calculateDailyPayment(principal, repaymentDays)
      : 0;

    return {
      loanAmount: principal,
      interestRate: `${this.INTEREST_RATE * 100}%`,
      interest,
      totalDue,
      repaymentDays,
      dailyPayment,
      validation,
      summary: {
        principal,
        interest,
        totalDue,
        daysToRepay: repaymentDays,
        dailyAmount: dailyPayment,
        isValid: validation.isValid,
        message: validation.message,
      },
    };
  }

  static verifyCalculation(loanData) {
    const {
      principal_amount,
      repayment_days,
      daily_payment,
      total_amount_due,
    } = loanData;

    const expectedTotal = this.calculateTotalDue(principal_amount);
    const expectedDaily = this.calculateDailyPayment(principal_amount, repayment_days);

    return {
      principal: principal_amount,
      expectedTotal,
      actualTotal: total_amount_due,
      match: Math.abs(expectedTotal - total_amount_due) < 0.01,
      expectedDaily,
      actualDaily: daily_payment,
      dailyMatch: Math.abs(expectedDaily - daily_payment) < 0.01,
    };
  }
}

export default FlexibleLoanCalculationService;
