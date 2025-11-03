import { BaseAPI } from '../base/base.api';

const REMOVE_ADMIN_MUTATION = `
 mutation RemoveAdmin($removeAdminId: String!) {
  removeAdmin(id: $removeAdminId) {
    message
    adminList {
      _id
      createdAt
      updatedAt
      firstName
      lastName
      email
      role
      status
      phone
      profileImage
      profileImageUrl
      enabled2FA
    }
    pagination {
      total
      hasNextPage
    }
    admin {
      _id
      createdAt
      updatedAt
      firstName
      lastName
      email
      role
      status
      phone
      profileImage
      profileImageUrl
      enabled2FA
    }
  }
}
`;

export interface Admin {
  _id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  phone: string;
  profileImage?: string;
  profileImageUrl?: string;
  enabled2FA?: boolean;
}

export interface RemoveAdminResponse {
  data?: {
    removeAdmin: {
      message: string;
      adminList: Admin[];
      pagination: {
        total: number;
        hasNextPage: boolean;
      };
      admin: Admin;
    };
  };
  errors?: Array<{
    message: string;
    extensions?: {
      code: string;
    };
  }>;
}

export class RemoveAdminAPI extends BaseAPI {
  async removeAdmin(id: string): Promise<RemoveAdminResponse> {
    if (!this.apiContext) {
      throw new Error('API context not initialized. Call init() with auth token first.');
    }

    const response = await this.post(this.baseURL, {
      query: REMOVE_ADMIN_MUTATION,
      variables: {
        removeAdminId: id,
      },
    });

    const result = await response.json();
    return result;
  }
}
