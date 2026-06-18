export type Status = 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
export type JobType = 'Internship' | 'FullTime' | 'PartTime';

export interface Application {
  id: string;
  company_name: string;
  job_title: string;
  job_type: JobType;
  status: Status;
  applied_date: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationInput {
  company_name: string;
  job_title: string;
  job_type: JobType;
  status?: Status;
  applied_date: string;
  notes?: string;
}

export interface UpdateApplicationInput {
  company_name?: string;
  job_title?: string;
  job_type?: JobType;
  status?: Status;
  applied_date?: string;
  notes?: string;
}
