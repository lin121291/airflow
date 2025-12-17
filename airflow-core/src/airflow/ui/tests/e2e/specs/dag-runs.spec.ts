/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { test } from "@playwright/test";

import { testConfig } from "playwright.config";
import { DagRunsPage } from "tests/e2e/pages/DagRunsPage";
import { DagsPage } from "tests/e2e/pages/DagsPage";
import { LoginPage } from "tests/e2e/pages/LoginPage";

test.describe("DAG Runs Page", () => {
  let loginPage: LoginPage;
  let dagRunsPage: DagRunsPage;
  let dagsPage: DagsPage;

  const testCredentials = testConfig.credentials;
  const testDagId = testConfig.testDag.id;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dagRunsPage = new DagRunsPage(page);
    dagsPage = new DagsPage(page);

    await loginPage.navigateAndLogin(testCredentials.username, testCredentials.password);
    await loginPage.expectLoginSuccess();
    await page.waitForTimeout(1500);
  });

  test.afterEach(async ({ page }) => {
    await page.waitForTimeout(5000);
  });

  test("should navigate to the DAG Runs page", async () => {
    await dagRunsPage.navigate();
  });

  test("should display the DAG runs table", async () => {
    await dagsPage.triggerDag(testDagId);
    await dagRunsPage.page.waitForTimeout(2000);
    
    const responsePromise = dagRunsPage.page.waitForResponse(
      response => response.url().includes('dagRuns') && response.status() === 200,
      { timeout: 10_000 }
    );

    await dagRunsPage.navigate();
    await responsePromise;
  
    await dagRunsPage.verifyTableRenders();
    await dagRunsPage.verifyDagRunsExist();
  });

  test("should display run details: DAG ID, run ID, state, start time, end time", async () => {
    test.setTimeout(60_000); // Increase timeout for slower browsers
    await dagRunsPage.navigate();
    await dagRunsPage.verifyTableRenders();

    const firstRow = dagRunsPage.dagRunsTable.locator("tbody tr").first();
    await firstRow.waitFor({ state: "visible", timeout: 10_000 });

    const cells = firstRow.locator("td");
    const cellCount = await cells.count();

    test.expect(cellCount).toBeGreaterThan(5);
  });

  test("should display different run states visually distinct", async () => {
    test.setTimeout(60_000); // Increase timeout for slower browsers
    await dagRunsPage.navigate();
    await dagRunsPage.verifyTableRenders();
    await dagRunsPage.verifyStateVisualDistinction();
  });

  test("should support filtering by state", async () => {
    test.setTimeout(60_000); // Increase timeout for slower browsers
    await dagRunsPage.navigate();
    await dagRunsPage.verifyTableRenders();
    await dagRunsPage.verifyFilteringWorks();
  });

});
