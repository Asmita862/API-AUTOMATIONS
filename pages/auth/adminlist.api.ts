import { BaseAPI } from '../base/base.api';

const GET_ADMIN_LIST_QUERY = `
  query GetAdminList($input: GetAdminListDTO!) {
    getAdminList(input: $input) {
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
  phone?: string;
  profileImage?: string | null;
  profileImageUrl?: string | null;
  enabled2FA?: boolean | null;
}

export interface Pagination {
  total: number;
  hasNextPage: boolean;
}

export interface GetAdminListResponse {
  data?: {
    getAdminList: {
      message: string;
      adminList: Admin[];
      pagination: Pagination;
      admin?: Admin | null;
    };
  };
  errors?: Array<{
    message: string;
    extensions?: { code: string };
  }>;
}

export interface GetAdminListInput {
  searchText?: string;
  orderBy?: string;
  order?: string;
  limit: number;
  skip: number;
}

export class AdminListAPI extends BaseAPI {
  async getAdminList(input: GetAdminListInput): Promise<GetAdminListResponse> {
    if (!this.apiContext) {
      throw new Error('API context not initialized. Call init() with auth token first.');
    }

    const variables = {
      input: {
        searchText: input.searchText ?? '',
        orderBy: input.orderBy ?? 'desc',
        order: input.order ?? '',
        limit: input.limit,
        skip: input.skip,
      },
    };

    const response = await this.post(this.baseURL, {
      query: GET_ADMIN_LIST_QUERY,
      variables,
    });

    const result = await response.json();
    return result;
  }
}
