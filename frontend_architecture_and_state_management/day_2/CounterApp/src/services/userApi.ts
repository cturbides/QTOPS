import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from 'src/constants/api.constants';
import { User } from 'src/types/user.type';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
    }),
    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
    }),
  }),
});

export const { useGetUsersQuery, useGetUserByIdQuery } = userApi;
