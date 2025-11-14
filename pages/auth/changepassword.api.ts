import { BaseAPI } from '../base/base.api';

const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($input: ChangePasswordDTO!) {
    changePassword(input: $input) {
      status
      message
    }
  }
`;

export interface ChangePasswordInput {
  oldPassword: string;
  password: string;
}

export interface ChangePasswordResponse {
  data?: {
    changePassword: {
      status: string;
      message: string;
    };
  };
  errors?: Array<{
    message: string;
    extensions?: {
      code: string;
    };
  }>;
}

export class ChangePasswordAPI extends BaseAPI {
  async changePassword(input: ChangePasswordInput): Promise<ChangePasswordResponse> {
    if (!this.apiContext) {
      await this.init();
    }

    const response = await this.post(this.baseURL, {
      query: CHANGE_PASSWORD_MUTATION,
      variables: { input },
    });

    const result = await response.json();
    return result;
  }
}
