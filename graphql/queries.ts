// graphql/queries.ts
export const LOGIN_MUTATION = `
  mutation ($input: LoginAdminDTO!) {
    login(input: $input) {
      admin {
        _id
        firstName
        lastName
        email
        phone
        role
        status
        enabled2FA
      }
      settings {
        _id
        description
        title
        slug
        order
        fieldType
        options {
          value
          label
        }
        value
        values
      }
      refreshToken
      accessToken
      expiresBy
      expiresAt
    }
  }
`;
