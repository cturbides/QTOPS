import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from 'src/constants/common.constants';

export type TaskDetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

export interface TaskDetailProps {
  route: TaskDetailRouteProp;
}
