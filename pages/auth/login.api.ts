import { BaseAPI } from '../base/base.api';

const LOGIN_MUTATION = `
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

export interface Admin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status?: string;
  enabled2FA?: boolean;
}

export interface Setting {
  _id: string;
  description?: string;
  title: string;
  slug: string;
  order?: number;
  fieldType: string;
  options?: Array<{
    value: string;
    label: string;
  }>;
  value?: string;
  values?: string[];
}

export interface LoginResponse {
  data?: {
    login: {
      admin: Admin;
      settings?: Setting[];
      accessToken: string;
      refreshToken: string;
      expiresBy?: number;
      expiresAt?: string;
    };
  };
  errors?: Array<{
    message: string;
    extensions?: {
      code: string;
    };
  }>;
}

export class LoginAPI extends BaseAPI {
  async login(email: string, password: string, browser: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'): Promise<LoginResponse> {
    if (!this.apiContext) {
      await this.init();
    }

    const response = await this.post(this.baseURL, {
      query: LOGIN_MUTATION,
      variables: {
        input: {
          email,
          password,
          browser,
        },
      },
    });

    const result = await response.json();
    
    // Store auth token if login successful
    if (result.data?.login?.accessToken) {
      this.setAuthToken(result.data.login.accessToken);
    }

    return result;
  }
}
