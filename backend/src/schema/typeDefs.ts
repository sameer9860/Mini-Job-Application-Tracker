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

  type Query {
    applications(status: Status, search: String): [Application!]!
    application(id: ID!): Application
  }

  type Mutation {
    createApplication(input: CreateApplicationInput!): Application!
    updateApplication(id: ID!, input: UpdateApplicationInput!): Application!
    deleteApplication(id: ID!): Boolean!
  }
`;
