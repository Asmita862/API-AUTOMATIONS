// userprofile.api.ts
import { BaseAPI } from '../base/base.api';

const GET_USER_PROFILE_QUERY = `
  query GetUserProfile {
    getUserProfile {
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
`;

export interface UserProfile {
  _id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  profileImage?: string | null;
  profileImageUrl?: string | null;
  enabled2FA?: boolean | null;
}

export interface GetUserProfileResponse {
  data?: {
    getUserProfile: UserProfile;
  };
  errors?: Array<{
    message: string;
    extensions?: { code: string };
  }>;
}

export class UserProfileAPI extends BaseAPI {
  async getUserProfile(): Promise<GetUserProfileResponse> {
    if (!this.apiContext) {
      throw new Error('API context not initialized. Call init() with auth token first.');
    }

    const response = await this.post(this.baseURL, {
      query: GET_USER_PROFILE_QUERY,
    });

    const result = await response.json();
    return result;
  }
}
