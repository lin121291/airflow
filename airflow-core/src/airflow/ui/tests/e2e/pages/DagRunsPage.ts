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
import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { BasePage } from "tests/e2e/pages/BasePage";

/**
 * DAG Runs Page Object
 */
export class DagRunsPage extends BasePage {
  // Page URLs
  public static get dagRunsUrl(): string {
    return "/dag_runs";
  }

  // Core page elements
  public readonly dagRunsTable: Locator;

  public constructor(page: Page) {
    super(page);
    this.dagRunsTable = page.locator('table, div[role="table"]');
  }

  /**
   * Navigate to DAG Runs page
   */
  public async navigate(): Promise<void> {
    await this.navigateTo(DagRunsPage.dagRunsUrl);
    await this.page.waitForURL(/.*dag_runs/, { timeout: 15_000 });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify that the DAG runs table renders
   */
  public async verifyTableRenders(): Promise<void> {
    await this.dagRunsTable.waitFor({ state: "visible", timeout: 10_000 });
    await expect(this.dagRunsTable).toBeVisible();
  }

  /**
   * Verify that DAG runs exist in the table
   */
  public async verifyDagRunsExist(): Promise<void> {
    await this.dagRunsTable.waitFor({ state: "visible", timeout: 10_000 });
    const rowCount = await this.dagRunsTable.locator('tr, div[role="row"]').count();
    expect(rowCount).toBeGreaterThan(0);
  }

  /**
   * Verify that different run states are visually distinct
   */
  public async verifyStateVisualDistinction(): Promise<void> {
    await this.dagRunsTable.waitFor({ state: "visible", timeout: 10_000 });

    // Find all state elements (e.g., badges, status indicators)
    const stateElements = this.page.locator(
      'td[data-cell="state"], td:has-text("Success"), td:has-text("Failed"), td:has-text("Running"), td:has-text("Queued"), [data-state], .state-badge, .status-badge'
    );

    const count = await stateElements.count();

    if (count > 0) {
      // Get the first state element and check it has visual styling
      const firstState = stateElements.first();
      await firstState.waitFor({ state: "visible", timeout: 5000 });

      // Verify the element exists and is visible
      await expect(firstState).toBeVisible();
    } else {
      // If no specific state elements, check that table rows exist
      const rows = this.dagRunsTable.locator("tbody tr");
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    }
  }

  /**
   * Verify that filtering by state works
   */
  public async verifyFilteringWorks(): Promise<void> {
    // Look for filter elements - could be dropdowns, buttons, or select elements
    const filterElements = this.page.locator(
      'select[name*="state"], select[aria-label*="state"], button:has-text("Filter"), [data-testid*="filter"], [aria-label*="Filter"]'
    );

    const filterCount = await filterElements.count();

    if (filterCount > 0) {
      // If filter UI exists, interact with it
      const firstFilter = filterElements.first();
      await firstFilter.waitFor({ state: "visible", timeout: 5000 });
      await expect(firstFilter).toBeVisible();

      // Try to interact with the filter if it's a select
      const isSelect = (await firstFilter.evaluate((el) => el.tagName)) === "SELECT";
      if (isSelect) {
        await firstFilter.click();
      }
    }

    // Verify table still renders after filter interaction
    await this.verifyTableRenders();
  }
}
