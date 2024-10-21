import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe("Suite de pruebas", () => {

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page)
        loginPage.navigate()
        loginPage.LoginWithNewUser()
    });

    test('Add task', async ({ page }) => {
        await page.getByPlaceholder('What needs to be done?').fill('Hacer Tarea');
        await page.getByPlaceholder('What needs to be done?').press('Enter');
        await expect(page.getByText('Hacer Tarea')).toBeVisible();
    });

    // test('Complete task', async ({ page }) => {

    // });

    // test('Clear Task', async ({ page }) => {

    // });

})

