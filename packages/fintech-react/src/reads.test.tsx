import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  spendingFixtures,
  budgetFixtures,
  cardFixtures,
  rewardsFixtures,
  payeeFixtures,
  upcomingFixtures,
  portfolioFixtures,
  watchlistFixtures,
} from "@sina-design-system/fintech";

import {
  SpendingBreakdown,
  BudgetProgress,
  CardList,
  RewardsSummary,
  PayeeList,
  UpcomingPayments,
  PortfolioHoldings,
  Watchlist,
} from "./index.js";

type ReadComponent = ComponentType<{ payload: unknown }>;

// [name, component, valid payload, empty/minimal payload]
const cases: [string, ReadComponent, unknown, unknown][] = [
  ["SpendingBreakdown", SpendingBreakdown, spendingFixtures.validBreakdown, spendingFixtures.validEmpty],
  ["BudgetProgress", BudgetProgress, budgetFixtures.validBudgets, budgetFixtures.validEmpty],
  ["CardList", CardList, cardFixtures.validCards, cardFixtures.validEmpty],
  ["RewardsSummary", RewardsSummary, rewardsFixtures.validRewards, rewardsFixtures.validMinimal],
  ["PayeeList", PayeeList, payeeFixtures.validPayees, payeeFixtures.validEmpty],
  ["UpcomingPayments", UpcomingPayments, upcomingFixtures.validUpcoming, upcomingFixtures.validEmpty],
  ["PortfolioHoldings", PortfolioHoldings, portfolioFixtures.validHoldings, portfolioFixtures.validEmpty],
  ["Watchlist", Watchlist, watchlistFixtures.validWatchlist, watchlistFixtures.validEmpty],
];

describe("presentational reads — a11y", () => {
  it.each(cases)("%s renders its validated payload with no axe violations", async (_name, Comp, valid) => {
    const { container } = render(<Comp payload={valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it.each(cases)("%s renders its empty/minimal state with no axe violations", async (_name, Comp, _valid, empty) => {
    const { container } = render(<Comp payload={empty} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("presentational reads — content", () => {
  it("CardList shows the masked number and a status", () => {
    render(<CardList payload={cardFixtures.validCards} />);
    expect(screen.getByText("****4021")).toBeTruthy();
    expect(screen.getByText("Frozen")).toBeTruthy();
  });

  it("BudgetProgress flags an over-budget category", () => {
    render(<BudgetProgress payload={budgetFixtures.validBudgets} />);
    expect(screen.getByText("over")).toBeTruthy();
  });

  it("PortfolioHoldings shows signed day-change badges", () => {
    render(<PortfolioHoldings payload={portfolioFixtures.validHoldings} />);
    expect(screen.getByText("+1.8%")).toBeTruthy();
    expect(screen.getByText("−0.6%")).toBeTruthy();
  });
});
