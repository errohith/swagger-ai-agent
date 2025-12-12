import { createEmptyRunReport } from '../../../../src/domain/models/RunReport';

describe('RunReport domain model', () => {
  describe('createEmptyRunReport', () => {
    it('should create empty report with given runId', () => {
      const report = createEmptyRunReport('run-123');

      expect(report.runId).toBe('run-123');
      expect(report.total).toBe(0);
      expect(report.passed).toBe(0);
      expect(report.failed).toBe(0);
      expect(report.errored).toBe(0);
      expect(report.tests).toEqual([]);
    });

    it('should create report with empty tests array', () => {
      const report = createEmptyRunReport('run-456');

      expect(Array.isArray(report.tests)).toBe(true);
      expect(report.tests.length).toBe(0);
    });

    it('should create unique reports for different runIds', () => {
      const report1 = createEmptyRunReport('run-1');
      const report2 = createEmptyRunReport('run-2');

      expect(report1.runId).not.toBe(report2.runId);
      expect(report1.runId).toBe('run-1');
      expect(report2.runId).toBe('run-2');
    });
  });
});
