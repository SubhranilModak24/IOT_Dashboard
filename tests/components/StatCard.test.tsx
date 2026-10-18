import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/ui/StatCard';
import { Thermometer, Droplets } from 'lucide-react';

describe('StatCard UI Component', () => {
  it('renders title, value, and unit correctly', () => {
    render(
      <StatCard
        title="Ambient Temperature"
        value={28.4}
        unit="°C"
        icon={Thermometer}
        subtitle="SHT31 Thermistor"
        statusColor="amber"
      />
    );

    expect(screen.getByText('Ambient Temperature')).toBeInTheDocument();
    expect(screen.getByText('28.4')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();
    expect(screen.getByText('SHT31 Thermistor')).toBeInTheDocument();
  });

  it('renders field tag when provided', () => {
    render(
      <StatCard
        title="Soil Moisture"
        value={55.2}
        unit="%"
        icon={Droplets}
        fieldTag="Field 1"
      />
    );

    expect(screen.getByText('Field 1')).toBeInTheDocument();
  });

  it('displays trend text and handles trend types', () => {
    render(
      <StatCard
        title="Soil Moisture"
        value={42.0}
        unit="%"
        icon={Droplets}
        trend="-3.2% / 1hr"
        trendType="negative"
      />
    );

    expect(screen.getByText('-3.2% / 1hr')).toBeInTheDocument();
  });
});
