import {Locator, Page} from "@playwright/test";

export class LoanResultPage {
    readonly page: Page;
    readonly finalAmount: Locator;
    readonly finalPeriod: Locator;
    readonly finalMonthlyPayment: Locator;
    readonly fullName: Locator;
    readonly communicationLanguage: Locator;
    readonly continueButton1: Locator;
    readonly okButton: Locator;
    readonly successMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.finalAmount = page.getByTestId("final-page-amount");
        this.finalPeriod = page.getByTestId("final-page-period");
        this.finalMonthlyPayment = page.getByTestId("final-page-monthly-payment");
        this.fullName = page.getByTestId("final-page-full-name");
        this.communicationLanguage = page.getByTestId("final-page-communication-language");
        this.continueButton1 = page.getByTestId('final-page-continue-button');
        this.okButton = page.getByTestId('final-page-success-ok-button');
        this.successMessage = page.getByText('Success!');
}
    async getMonthlyPayment() {
        return await this.finalMonthlyPayment.textContent()
    }
}