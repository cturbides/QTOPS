import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from 'src/constants/api.constants';
import { Task } from 'src/types/task.type';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      query: () => '/todos',
    }),
    getTaskById: builder.query<Task, number>({
      query: (id) => `/todos/${id}`,
    }),
  }),
});

export const { useGetTasksQuery, useGetTaskByIdQuery } = tasksApi;
