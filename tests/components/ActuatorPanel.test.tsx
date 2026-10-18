import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActuatorPanel } from '@/components/ui/ActuatorToggle';

describe('ActuatorPanel Hardware Control Component', () => {
  it('renders pump status, bot state options, and solar voltage', () => {
    render(
      <ActuatorPanel
        pumpStatus={false}
        botStatus="ACTIVE"
        solarVoltage={20.4}
      />
    );

    expect(screen.getByText('Submersible Pump')).toBeInTheDocument();
    expect(screen.getByText('OFF')).toBeInTheDocument();
    expect(screen.getAllByText('ACTIVE').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('20.4 V')).toBeInTheDocument();
    expect(screen.getByText('Energize Pump Relay')).toBeInTheDocument();
  });

  it('triggers onPumpToggle callback when pump button is clicked', () => {
    const handlePumpToggle = vi.fn();
    render(
      <ActuatorPanel
        pumpStatus={false}
        botStatus="ACTIVE"
        solarVoltage={20.4}
        onPumpToggle={handlePumpToggle}
      />
    );

    const button = screen.getByRole('button', { name: /Energize Pump Relay/i });
    fireEvent.click(button);

    expect(handlePumpToggle).toHaveBeenCalledWith(true);
  });

  it('triggers onBotStatusChange callback when state option is selected', () => {
    const handleStatusChange = vi.fn();
    render(
      <ActuatorPanel
        pumpStatus={false}
        botStatus="ACTIVE"
        solarVoltage={20.4}
        onBotStatusChange={handleStatusChange}
      />
    );

    const irrigatingBtn = screen.getByRole('button', { name: 'IRRIGATING' });
    fireEvent.click(irrigatingBtn);

    expect(handleStatusChange).toHaveBeenCalledWith('IRRIGATING');
  });
});
