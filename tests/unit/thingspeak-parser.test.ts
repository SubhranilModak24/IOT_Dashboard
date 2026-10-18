import { describe, it, expect } from 'vitest';

// ThingSpeak payload parsing functions as implemented in /api/sync-thingspeak/route.ts
function parseNumber(val: string | null | undefined): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : Number(num.toFixed(2));
}

function parseBoolean(val: string | null | undefined): boolean {
  if (!val) return false;
  const cleaned = val.trim().toLowerCase();
  return cleaned === '1' || cleaned === 'true' || cleaned === 'on' || cleaned === 'active' || cleaned === 'yes';
}

function parseBotStatus(val: string | null | undefined): string {
  if (!val || val.trim() === '') return 'ACTIVE';
  return val.trim().toUpperCase();
}

describe('ThingSpeak Payload Ingestion Parsers', () => {
  describe('parseNumber', () => {
    it('parses valid numeric strings with 2-decimal rounding', () => {
      expect(parseNumber('54.267')).toBe(54.27);
      expect(parseNumber('28.5')).toBe(28.5);
      expect(parseNumber('0')).toBe(0);
      expect(parseNumber('-5.2')).toBe(-5.2);
    });

    it('returns null for non-numeric, empty, or undefined values', () => {
      expect(parseNumber(null)).toBeNull();
      expect(parseNumber(undefined)).toBeNull();
      expect(parseNumber('')).toBeNull();
      expect(parseNumber('invalid_string')).toBeNull();
    });
  });

  describe('parseBoolean (Pump Relay Status)', () => {
    it('returns true for truthy string indicators', () => {
      expect(parseBoolean('1')).toBe(true);
      expect(parseBoolean('true')).toBe(true);
      expect(parseBoolean('TRUE')).toBe(true);
      expect(parseBoolean('on')).toBe(true);
      expect(parseBoolean('ON')).toBe(true);
      expect(parseBoolean('active')).toBe(true);
      expect(parseBoolean('yes')).toBe(true);
    });

    it('returns false for falsy or missing values', () => {
      expect(parseBoolean('0')).toBe(false);
      expect(parseBoolean('false')).toBe(false);
      expect(parseBoolean('off')).toBe(false);
      expect(parseBoolean('OFF')).toBe(false);
      expect(parseBoolean(null)).toBe(false);
      expect(parseBoolean(undefined)).toBe(false);
      expect(parseBoolean('')).toBe(false);
    });
  });

  describe('parseBotStatus (State Machine Protocol)', () => {
    it('normalizes bot state to uppercase and trims whitespace', () => {
      expect(parseBotStatus('active')).toBe('ACTIVE');
      expect(parseBotStatus(' irrigating ')).toBe('IRRIGATING');
      expect(parseBotStatus('patrolling')).toBe('PATROLLING');
      expect(parseBotStatus('standby')).toBe('STANDBY');
      expect(parseBotStatus('ERROR')).toBe('ERROR');
    });

    it('defaults to ACTIVE when missing or empty', () => {
      expect(parseBotStatus(null)).toBe('ACTIVE');
      expect(parseBotStatus(undefined)).toBe('ACTIVE');
      expect(parseBotStatus('')).toBe('ACTIVE');
      expect(parseBotStatus('   ')).toBe('ACTIVE');
    });
  });

  describe('Full ThingSpeak Feed Mapping Verification', () => {
    it('maps ThingSpeak 8-field payload to TelemetryLog format accurately', () => {
      const feed = {
        created_at: '2026-10-15T14:30:00Z',
        entry_id: 1042,
        field1: '52.3',  // Soil moisture
        field2: '26.8',  // Ambient temp
        field3: '65.1',  // Humidity
        field4: '84.0',  // Water level
        field5: '97.5',  // Battery
        field6: '20.4',  // Solar voltage
        field7: '1',     // Pump status (relay on)
        field8: 'irrigating', // Bot status
      };

      const mapped = {
        user_id: 'user_test_uuid',
        entry_id: Number(feed.entry_id),
        soil_moisture: parseNumber(feed.field1),
        ambient_temp: parseNumber(feed.field2),
        humidity: parseNumber(feed.field3),
        water_level: parseNumber(feed.field4),
        battery_level: parseNumber(feed.field5),
        solar_voltage: parseNumber(feed.field6),
        pump_status: parseBoolean(feed.field7),
        bot_status: parseBotStatus(feed.field8),
        recorded_at: feed.created_at,
      };

      expect(mapped.entry_id).toBe(1042);
      expect(mapped.soil_moisture).toBe(52.3);
      expect(mapped.ambient_temp).toBe(26.8);
      expect(mapped.humidity).toBe(65.1);
      expect(mapped.water_level).toBe(84.0);
      expect(mapped.battery_level).toBe(97.5);
      expect(mapped.solar_voltage).toBe(20.4);
      expect(mapped.pump_status).toBe(true);
      expect(mapped.bot_status).toBe('IRRIGATING');
      expect(mapped.recorded_at).toBe('2026-10-15T14:30:00Z');
    });
  });
});
