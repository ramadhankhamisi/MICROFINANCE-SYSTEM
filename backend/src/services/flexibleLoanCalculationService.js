/**
 * Flexible Loan Calculation Service
 * Allows loan officers to manually select repayment days
 * System validates range and auto-calculates totals
 */

export class FlexibleLoanCalculationService {
  static INTEREST_RATE = 0.20; // Fixed 20%

  /**
   * Define repayment ranges based on loan amount
   * These are recommendations, not enforced limits
   */
  static getRepaymentRange(amount) {
    const ranges = [
      { min: 10000, max: 100000, recommendedMin: 15, recommendedMax: 30, name: 'Entry Level' },
      { min: 100001, max: 500000, recommendedMin: 20, recommendedMax: 35, name: 'Growing Business' },
      { min: 500001, max: 1000000, recommendedMin: 30, recommendedMax: 45, name: 'Medium Business' },
      { min: 1000001, max: 5000000, recommendedMin: 40, recommendedMax: 60, name: 'Large Business' },
      { min: 5000001, max: 10000000, recommendedMin: 45, recommendedMax: 75, name: 'Enterprise' },
    ];

    const range = ranges.find(r => amount >= r.min && amount <= r.max);
    
    if (!range) {
      throw new Error(`Loan amount ${amount} outside supported range (10k-10M)`);
    }

    return {
      tierName: range.name,
      amountRange: { min: range.min, max: range.max },
      recommendedRange: { min: range.recommendedMin, max: range.recommendedMax },
    };
  }

  /**
   * Validate repayment days based on loan amount
   */
  static validateRepaymentDays(amount, repaymentDays) {
    const range = this.getRepaymentRange(amount);
    const { recommendedMin, recommendedMax } = range.recommendedRange;

    // Allow flexibility: min 50% of recommended, max 150% of recommended
    const absoluteMin = Math.floor(recommendedMin * 0.5);
    const absoluteMax = Math.ceil(recommendedMax * 1.5);

    return {
      isValid: repaymentDays >= absoluteMin && repaymentDays <= absoluteMax,
      recommendedRange: { min: recommendedMin, max: recommendedMax },
      allowedRange: { min: absoluteMin, max: absoluteMax },
      message: repaymentDays < absoluteMin 
        ? `Minimum ${absoluteMin} days required for this loan amount`
        : repaymentDays > absoluteMax
        ? `Maximum ${absoluteMax} days allowed for this loan amount`
        : `Valid selection (Recommended: ${recommendedMin}-${recommendedMax} days)`,
    };
  }

  /**
   * Calculate total amount due (Principal * 1.20)
   */
  static calculateTotalDue(principal) {
    return Math.round(principal * (1 + this.INTEREST_RATE) * 100) / 100;
  }

  /**
   * Calculate interest amount (20% of principal)
   */
  static calculateInterest(principal) {
    return Math.round(principal * this.INTEREST_RATE * 100) / 100;
  }

  /**
   * Calculate daily repayment amount
   */
  static calculateDailyPayment(principal, repaymentDays) {
    const totalDue = this.calculateTotalDue(principal);
    return Math.round((totalDue / repaymentDays) * 100) / 100;
  }

  /**
   * Generate daily repayment schedule
   */
  static generateDailySchedule(loanData) {
    const {
      principal_amount,
      disbursal_date,
      repayment_days,
    } = loanData;

    const totalDue = this.calculateTotalDue(principal_amount);
    const totalInterest = this.calculateInterest(principal_amount);
    const dailyPayment = this.calculateDailyPayment(principal_amount, repayment_days);

    const dailyPrincipal = Math.round((principal_amount / repayment_days) * 100) / 100;
    const dailyInterest = Math.round((totalInterest / repayment_days) * 100) / 100;

    const schedule = [];
    const startDate = new Date(disbursal_date);

    for (let day = 1; day <= repayment_days; day++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + day);

      // For last day, adjust to ensure exact totals
      let dayPrincipal = dailyPrincipal;
      let dayInterest = dailyInterest;

      if (day === repayment_days) {
        let totalPaid = 0;
        for (let i = 0; i < day - 1; i++) {
          totalPaid += schedule[i].principal_amount + schedule[i].interest_amount;
        }
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

  /**
   * Get complete loan calculation preview
   */
  static getLoanCalculationPreview(principal, repaymentDays) {
    const range = this.getRepaymentRange(principal);
    const validation = this.validateRepaymentDays(principal, repaymentDays);
    const totalDue = this.calculateTotalDue(principal);
    const interest = this.calculateInterest(principal);
    const dailyPayment = this.calculateDailyPayment(principal, repaymentDays);

    return {
      loanAmount: principal,
      interestRate: `${this.INTEREST_RATE * 100}%`,
      interest: interest,
      totalDue: totalDue,
      repaymentDays: repaymentDays,
      dailyPayment: dailyPayment,
      tierName: range.tierName,
      recommendedRange: range.recommendedRange,
      validation: validation,
      summary: {
        principal: principal,
        interest: interest,
        totalDue: totalDue,
        daysToRepay: repaymentDays,
        dailyAmount: dailyPayment,
        isValid: validation.isValid,
        message: validation.message,
      },
    };
  }

  /**
   * Verify calculation accuracy
   */
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
      expectedTotal: expectedTotal,
      actualTotal: total_amount_due,
      match: Math.abs(expectedTotal - total_amount_due) < 0.01,
      expectedDaily: expectedDaily,
      actualDaily: daily_payment,
      dailyMatch: Math.abs(expectedDaily - daily_payment) < 0.01,
    };
  }
}

export default FlexibleLoanCalculationService;
