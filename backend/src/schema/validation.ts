import { z } from 'zod';

export const CreateApplicationSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  job_title: z.string().min(1, 'Job title is required'),
  job_type: z.enum(['Internship', 'FullTime', 'PartTime']),
  status: z.enum(['Applied', 'Interviewing', 'Offer', 'Rejected']).optional().default('Applied'),
  applied_date: z.string().min(1, 'Applied date is required'),
  notes: z.string().optional(),
});

export const UpdateApplicationSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters').optional(),
  job_title: z.string().min(1, 'Job title is required').optional(),
  job_type: z.enum(['Internship', 'FullTime', 'PartTime']).optional(),
  status: z.enum(['Applied', 'Interviewing', 'Offer', 'Rejected']).optional(),
  applied_date: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof UpdateApplicationSchema>;
