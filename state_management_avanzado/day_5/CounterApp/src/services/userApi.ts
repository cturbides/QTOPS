import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from 'src/constants/api.constants';
import { User } from 'src/types/user.type';
import { saveData, getData } from './storage';
import { CACHE_DURATION, STORAGE_KEYS } from 'src/constants/common.constants';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await saveData(STORAGE_KEYS.USERS_CACHE, data);
          await saveData(STORAGE_KEYS.USERS_CACHE_TIMESTAMP, Date.now());
        } catch (error) {
          console.error('Failed to cache users:', error);
        }
      },
    }),
    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
    }),
  }),
});

export const isCacheValid = async (): Promise<boolean> => {
  const timestamp = await getData<number>(STORAGE_KEYS.USERS_CACHE_TIMESTAMP);

  if (!timestamp) {
    return false;
  }

  return Date.now() - timestamp < CACHE_DURATION;
};

export const getCachedUsers = async (): Promise<User[] | null> => {
  const isValid = await isCacheValid();

  if (!isValid) {
    return null;
  }

  return await getData<User[]>(STORAGE_KEYS.USERS_CACHE);
};

export const { useGetUsersQuery, useGetUserByIdQuery } = userApi;
