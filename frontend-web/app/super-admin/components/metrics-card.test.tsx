/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { MetricsCard } from './metrics-card';

describe('MetricsCard', () => {
  // AAA Pattern: Arrange, Act, Assert

  describe('Basic Rendering', () => {
    it('should render title and value correctly', () => {
      // Arrange & Act
      render(
        <MetricsCard
          title="Test Metric"
          value="R$ 1.000,00"
          icon={DollarSign}
        />
      );

      // Assert
      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument();
    });

    it('should render numeric value', () => {
      // Arrange & Act
      render(
        <MetricsCard
          title="Total Users"
          value={1543}
          icon={TrendingUp}
        />
      );

      // Assert
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('1543')).toBeInTheDocument();
    });
  });

  describe('Optional Props', () => {
    it('should render description when provided', () => {
      // Arrange & Act
      render(
        <MetricsCard
          title="MRR"
          value="R$ 45.230,00"
          icon={DollarSign}
          description="Monthly Recurring Revenue"
        />
      );

      // Assert
      expect(screen.getByText('Monthly Recurring Revenue')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      // Arrange & Act
      render(
        <MetricsCard
          title="MRR"
          value="R$ 45.230,00"
          icon={DollarSign}
        />
      );

      // Assert
      const description = screen.queryByText('Monthly Recurring Revenue');
      expect(description).not.toBeInTheDocument();
    });
  });

  describe('Trend Display', () => {
    it('should render positive trend with green color', () => {
      // Arrange & Act
      const { container } = render(
        <MetricsCard
          title="MRR"
          value="R$ 45.230,00"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
      );

      // Assert
      expect(screen.getByText(/12.5%/)).toBeInTheDocument();
      expect(screen.getByText(/vs. mês anterior/)).toBeInTheDocument();

      const trendElement = container.querySelector('.text-green-600');
      expect(trendElement).toBeInTheDocument();
      expect(trendElement?.textContent).toContain('↑');
    });

    it('should render negative trend with red color', () => {
      // Arrange & Act
      const { container } = render(
        <MetricsCard
          title="Churn Rate"
          value="2.3%"
          icon={DollarSign}
          trend={{ value: 0.5, isPositive: false }}
        />
      );

      // Assert
      expect(screen.getByText(/0.5%/)).toBeInTheDocument();

      const trendElement = container.querySelector('.text-red-600');
      expect(trendElement).toBeInTheDocument();
      expect(trendElement?.textContent).toContain('↓');
    });

    it('should not render trend when not provided', () => {
      // Arrange & Act
      render(
        <MetricsCard
          title="GMV"
          value="R$ 1.250.000,00"
          icon={DollarSign}
        />
      );

      // Assert
      expect(screen.queryByText(/vs. mês anterior/)).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      // Arrange & Act
      const { container } = render(
        <MetricsCard
          title="Test"
          value="100"
          icon={DollarSign}
          className="border-orange-200"
        />
      );

      // Assert
      const card = container.firstChild;
      expect(card).toHaveClass('border-orange-200');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      // Arrange & Act
      render(
        <MetricsCard
          title="Total Revenue"
          value="R$ 100.000,00"
          icon={DollarSign}
        />
      );

      // Assert
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('R$ 100.000,00')).toBeInTheDocument();
    });
  });
});
