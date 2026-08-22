/* eslint-disable */
import {expect, Route, test} from '@playwright/test';
import {LoanPage} from "./pages/loan-page";
import {LoanResultPage} from "./pages/loanresult-page";

let loanPage: LoanPage
const routeToMock = '**/api/loan-calc?amount=*&period=*'

test.beforeEach(async ({page}) => {
    loanPage = new LoanPage(page);
    await loanPage.openLoanPage()
    await page.screenshot({ path: 'before-each.png', fullPage: true });
})

test('Base elements are visible', async ({page}) => {

    await expect.soft(loanPage.amountInput).toBeVisible()
    await page.screenshot({ path: 'page.png', fullPage: true });
    await expect.soft(loanPage.periodSelect).toBeVisible()
    await expect.soft(loanPage.applyButton).toBeVisible()
});

test('Get base loan with login', async ({page}) => {
    await page.route(routeToMock, async (route: Route) => {
        const request = route.request();
        if (route.request().method() === 'GET') {
            const percent = 12
            const url = new URL(request.url());
            const amount = url.searchParams.get('amount');
            const period = url.searchParams.get('period');
            const monthlyPayment = calculateMonthlyPayment(Number(amount), Number(period), percent);
            console.log(monthlyPayment);
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    "paymentAmountMonthly": monthlyPayment
                })
            })
        } else {
            await route.continue()
        }
    })
    await loanPage.amountInput.fill('1000')
    await loanPage.setPeriodOption('24')
    await loanPage.monthlyAmountText.waitFor({state: 'visible', timeout: 5000});
    await loanPage.applyButton.click()
    await loanPage.login()
    const loanResultPage = new LoanResultPage(page)
    const loanMonthlyPaymentText = await loanResultPage.finalMonthlyPayment.textContent()
    expect.soft(loanMonthlyPaymentText).toBe('47.07 €')
});

test('open and verify bad request', async ({ page }) => {

    await page.route(routeToMock, async (route) => {
        await route.fulfill({
            status: 400
        });
    });
    await page.waitForResponse(routeToMock)
    const errorText = await loanPage.fieldError.textContent()
    expect(errorText).toBe('Oops, something went wrong');
});

test('Scroll range amount', async ({page}) => {
    await page.route(routeToMock, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                "paymentAmountMonthly": 101
            })
        });
    });
    await loanPage.amountInputRange.fill('1900')
    await loanPage.setPeriodOption('24')
    await loanPage.monthlyAmountText.waitFor({state: 'visible', timeout: 5000});
    await loanPage.applyButton.click()
    await loanPage.login()
    const loanResultPage = new LoanResultPage(page)
    const loanMonthlyPaymentText = await loanResultPage.finalMonthlyPayment.textContent()
    expect.soft(loanMonthlyPaymentText).toBe('101 €')
});

test('redirect flow', async () => {
    await loanPage.clickRedirectButton1();
    await expect(loanPage.applyButton).toBeInViewport();

    await loanPage.clickRedirectButton2();
    await expect(loanPage.applyButton).toBeInViewport();
});

function calculateMonthlyPayment(amount: number, period: number, annualPercent: number): number {
    const monthlyRate = annualPercent / 12 / 100;
    const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, period)) / (Math.pow(1 + monthlyRate, period) - 1);
    return Math.round(payment * 100) / 100; // округление до 2 знаков после запятой
}