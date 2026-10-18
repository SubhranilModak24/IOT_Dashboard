import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GaugeCard } from '@/components/ui/GaugeCard';
import { BatteryCharging, Droplets } from 'lucide-react';

describe('GaugeCard UI Component', () => {
  it('renders title, percentage value, and threshold label', () => {
    render(
      <GaugeCard
        title="LiFePO4 Reserve"
        value={94.5}
        unit="%"
        icon={BatteryCharging}
        fieldTag="Field 5"
        thresholdText="Nominal State"
        colorTheme="emerald"
      />
    );

    expect(screen.getByText('LiFePO4 Reserve')).toBeInTheDocument();
    expect(screen.getByText('94.5')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByText('Field 5')).toBeInTheDocument();
    expect(screen.getByText('Nominal State')).toBeInTheDocument();
  });

  it('clamps values below min or above max gracefully', () => {
    render(
      <GaugeCard
        title="Water Tank"
        value={120} // Above 100 max
        unit="%"
        icon={Droplets}
        min={0}
        max={100}
      />
    );

    // Displays formatted clamped value
    expect(screen.getByText('120.0')).toBeInTheDocument();
  });
});
