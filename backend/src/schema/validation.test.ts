import { describe, it, expect } from 'vitest';
import { CreateApplicationSchema, UpdateApplicationSchema } from './validation.js';

describe('CreateApplicationSchema validation', () => {
  it('should validate a correct input', () => {
    const validData = {
      company_name: 'Google',
      job_title: 'Software Engineer Intern',
      job_type: 'Internship',
      status: 'Applied',
      applied_date: '2026-06-18',
      notes: 'Applied via portal',
    };
    const result = CreateApplicationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail if company name is shorter than 2 characters', () => {
    const invalidData = {
      company_name: 'G',
      job_title: 'Software Engineer Intern',
      job_type: 'Internship',
      applied_date: '2026-06-18',
    };
    const result = CreateApplicationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at least 2 characters');
    }
  });

  it('should fail if job title is empty', () => {
    const invalidData = {
      company_name: 'Google',
      job_title: '',
      job_type: 'Internship',
      applied_date: '2026-06-18',
    };
    const result = CreateApplicationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if job type is invalid', () => {
    const invalidData = {
      company_name: 'Google',
      job_title: 'Software Engineer',
      job_type: 'Contract', // Invalid enum value
      applied_date: '2026-06-18',
    };
    const result = CreateApplicationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail if applied_date is missing', () => {
    const invalidData = {
      company_name: 'Google',
      job_title: 'Software Engineer',
      job_type: 'Internship',
    };
    const result = CreateApplicationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('UpdateApplicationSchema validation', () => {
  it('should accept partial valid updates', () => {
    const validUpdate = {
      status: 'Interviewing',
    };
    const result = UpdateApplicationSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it('should reject invalid fields inside update', () => {
    const invalidUpdate = {
      company_name: 'A', // too short
    };
    const result = UpdateApplicationSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });
});
