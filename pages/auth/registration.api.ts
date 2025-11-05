import { BaseAPI } from '../base/base.api';

const REGISTER_MUTATION = `
  mutation ($input: CreateAdminDTO!) {
    register(input: $input) {
      _id
      firstName
      lastName
      email
      status
      role
      phone
    }
  }
`;

export interface RegisterAdmin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  role: string;
  phone: string;
}

export interface RegisterResponse {
  data?: {
    register: RegisterAdmin;
  };
  errors?: Array<{
    message: string;
    extensions?: {
      code: string;
    };
  }>;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
}

export class RegistrationAPI extends BaseAPI {
  async register(input: RegisterInput): Promise<RegisterResponse> {
    if (!this.apiContext) {
      throw new Error('API context not initialized. Call init() with auth token first.');
    }

    const response = await this.post(this.baseURL, {
      query: REGISTER_MUTATION,
      variables: {
        input,
      },
    });

    const result = await response.json();
    return result;
  }
}
