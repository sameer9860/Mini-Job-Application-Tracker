import { gql } from '@apollo/client';

export const APPLICATION_FIELDS = gql`
  fragment ApplicationFields on Application {
    id
    company_name
    job_title
    job_type
    status
    applied_date
    notes
    created_at
    updated_at
  }
`;

export const GET_APPLICATIONS = gql`
  ${APPLICATION_FIELDS}
  query GetApplications($status: Status, $search: String) {
    applications(status: $status, search: $search) {
      ...ApplicationFields
    }
  }
`;

export const GET_APPLICATION = gql`
  ${APPLICATION_FIELDS}
  query GetApplication($id: ID!) {
    application(id: $id) {
      ...ApplicationFields
    }
  }
`;

export const CREATE_APPLICATION = gql`
  ${APPLICATION_FIELDS}
  mutation CreateApplication($input: CreateApplicationInput!) {
    createApplication(input: $input) {
      ...ApplicationFields
    }
  }
`;

export const UPDATE_APPLICATION = gql`
  ${APPLICATION_FIELDS}
  mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {
    updateApplication(id: $id, input: $input) {
      ...ApplicationFields
    }
  }
`;

export const DELETE_APPLICATION = gql`
  mutation DeleteApplication($id: ID!) {
    deleteApplication(id: $id)
  }
`;
