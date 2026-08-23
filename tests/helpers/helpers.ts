export function calculateMonthlyPayment(
    amount: number,
    period: number,
    annualPercent: number
): number {
    const monthlyRate = annualPercent / 12 / 100;

    const payment =
        amount *
        (monthlyRate * Math.pow(1 + monthlyRate, period)) /
        (Math.pow(1 + monthlyRate, period) - 1);

    return Math.round(payment * 100) / 100;
}