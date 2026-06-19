export const typeDefs = `#graphql
  enum Status {
    Applied
    Interviewing
    Offer
    Rejected
  }

  enum JobType {
    Internship
    FullTime
    PartTime
  }

  type Application {
    id: ID!
    company_name: String!
    job_title: String!
    job_type: JobType!
    status: Status!
    applied_date: String!
    notes: String
    created_at: String!
    updated_at: String!
  }

  input CreateApplicationInput {
    company_name: String!
    job_title: String!
    job_type: JobType!
    status: Status
    applied_date: String!
    notes: String
  }

  input UpdateApplicationInput {
    company_name: String
    job_title: String
    job_type: JobType
    status: Status
    applied_date: String
    notes: String
  }

  type PaginatedApplications {
    items: [Application!]!
    total: Int!
  }

  type ApplicationStats {
    total: Int!
    applied: Int!
    interviewing: Int!
    offer: Int!
    rejected: Int!
  }

  type Query {
    applications(status: Status, search: String, limit: Int, offset: Int): PaginatedApplications!
    applicationStats(search: String): ApplicationStats!
    application(id: ID!): Application
  }

  type Mutation {
    createApplication(input: CreateApplicationInput!): Application!
    updateApplication(id: ID!, input: UpdateApplicationInput!): Application!
    deleteApplication(id: ID!): Boolean!
  }
`;
