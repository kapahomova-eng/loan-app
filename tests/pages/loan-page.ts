import {Locator, Page} from "@playwright/test";
import {SERVICE_URL, TEST_PASSWORD, TEST_USERNAME} from "../../config/env-data";

export class LoanPage {
    readonly url = SERVICE_URL
    readonly username = TEST_USERNAME
    readonly password = TEST_PASSWORD
    readonly page: Page;
    readonly applyButton: Locator;
    readonly amountInput: Locator;
    readonly amountInputRange: Locator;
    readonly periodSelect: Locator;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly continueButton: Locator;
    readonly monthlyAmountText: Locator;
    readonly applyLoanButton1: Locator;
    readonly applyLoanButton2: Locator;
    readonly closeButton: Locator;
    readonly fieldError: Locator;


    constructor(page: Page) {
        this.page = page;
        this.applyButton = page.getByTestId('id-small-loan-calculator-field-apply')
        this.amountInput = page.getByTestId('id-small-loan-calculator-field-amount')
        this.amountInputRange = page.getByTestId('id-small-loan-calculator-field-amount-slider')
        this.periodSelect = page.getByTestId('ib-small-loan-calculator-field-period')
        this.usernameInput = page.getByTestId('login-popup-username-input');
        this.passwordInput = page.getByTestId('login-popup-password-input');
        this.monthlyAmountText = page.getByTestId("ib-small-loan-calculator-field-monthlyPayment");
        this.continueButton = page.getByTestId('login-popup-continue-button');
        this.applyLoanButton2 = page.getByTestId('id-image-element-button-image-2')
        this.applyLoanButton1 = page.getByTestId('id-image-element-button-image-1')
        this.closeButton = page.getByTestId('login-popup-close-button')
        this.fieldError = page.getByTestId('id-small-loan-calculator-field-error')
    }

    async openLoanPage() {
        await this.page.goto(this.url)
    }

    async setPeriodOption(positionInOptionList: string) {
        await this.periodSelect.selectOption(positionInOptionList);
    }

    async login() {
        await this.usernameInput.fill(this.username)
        await this.passwordInput.fill(this.password)
        await this.continueButton.click()
    }
    async clickRedirectButton1() {
        await this.applyLoanButton1.click();
    }

    async clickRedirectButton2() {
        await this.applyLoanButton2.click();
    }
    async closeLoginPopupByMouse() {
        const textBox = await this.closeButton.evaluate((el) => {
            const range = document.createRange()
            range.selectNodeContents(el)

            return range.getBoundingClientRect().toJSON()
        })

        await this.page.mouse.click(
            textBox.x + textBox.width / 2,
            textBox.y + textBox.height / 2
        )
    }
    async fillLoanAmount(amount: string) {
        await this.amountInput.fill(amount)
    }

    async fillLoanAmountRange(amount: string) {
        await this.amountInputRange.fill(amount)
    }

    async waitForMonthlyAmount() {
        await this.monthlyAmountText.waitFor({
            state: 'visible',
            timeout: 5000
        })
    }

    async clickApplyButton() {
        await this.applyButton.click()
    }

    async calculateLoan(amount: string, period: string) {
        await this.fillLoanAmount(amount)
        await this.setPeriodOption(period)
        await this.waitForMonthlyAmount()
    }

    async calculateLoanAndWaitForRequest(amount: string, period: string) {
        await this.fillLoanAmount(amount)
        await this.setPeriodOption(period)

        await this.page.waitForRequest(
            `**/api/loan-calc?amount=${amount}&period=${period}`
        )

        await this.waitForMonthlyAmount()
    }

    async scrollApplyButtonIntoView() {
        await this.applyLoanButton2.scrollIntoViewIfNeeded()
    }
    async fillLoanData(amount: string, period: string) {
        await this.amountInput.fill(amount)
        await this.periodSelect.selectOption(period)
    }
}