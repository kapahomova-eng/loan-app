/* eslint-disable */
import {expect, Route, test} from '@playwright/test';
import {LoanPage} from "./pages/loan-page";
import {LoanResultPage} from "./pages/loanresult-page";
import { calculateMonthlyPayment } from './helpers/helpers';
import {LoanPageDto} from "./loanDto/loanPage-dto";

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
    const inputValue = await loanPage.amountInput.inputValue()
    await expect.soft(inputValue).toBe("500")
});

test('Get base loan with login', async ({page}) => {
    await page.route(routeToMock, async (route: Route) => {
        const request = route.request();
        if (request.method() === 'GET') {
            const percent = 12;
            const url = new URL(request.url());
            const amount = url.searchParams.get('amount');
            const period = url.searchParams.get('period');
            const monthlyPayment = calculateMonthlyPayment(
                Number(amount),
                Number(period),
                percent
            );
            const response: LoanPageDto = {
                paymentAmountMonthly: monthlyPayment
            };
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(response)
            });
        } else {
            await route.continue();
        }
    });
    await loanPage.calculateLoan('1000', '24');
    await loanPage.clickApplyButton();
    await loanPage.login();
    const loanResultPage = new LoanResultPage(page);
    await expect.soft(loanResultPage.finalMonthlyPayment)
        .toHaveText('47.07 €');
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

        const response: LoanPageDto = {
            paymentAmountMonthly: 101
        };

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response)
        });
    });

    await loanPage.calculateLoan('1900', '24');
    await loanPage.clickApplyButton();
    await loanPage.login();

    const loanResultPage = new LoanResultPage(page);

    await expect.soft(loanResultPage.finalMonthlyPayment)
        .toHaveText('101 €');
});

test('redirect flow', async () => {
    await loanPage.clickRedirectButton1();
    await expect(loanPage.applyButton).toBeInViewport();

    await loanPage.clickRedirectButton2();
    await expect(loanPage.applyButton).toBeInViewport();
});
test('500 response without body', async ({page}) => {
    await page.route(routeToMock, async (route) => {
        await route.fulfill({
            status: 500
        });
    });
    await loanPage.fillLoanData('1000', '24');
    await expect(loanPage.fieldError)
        .toHaveText('Oops, something went wrong');
});
test('200 response without body', async ({page}) => {
    await page.route(routeToMock, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json'
        });
    });

    await loanPage.calculateLoan('1000', '24');

    await expect(loanPage.monthlyAmountText)
        .toHaveText('undefined €');
});
test('200 response with wrong body', async ({page}) => {
    await page.route(routeToMock, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                monthlyPayment: 47.07
            })
        });
    });

    await loanPage.calculateLoan('1000', '24');

    await expect(loanPage.monthlyAmountText)
        .toHaveText('undefined €');
});