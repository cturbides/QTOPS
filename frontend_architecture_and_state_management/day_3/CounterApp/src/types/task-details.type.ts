import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'src/constants/common.constants';

export type TaskDetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;
export type TaskDetailNavigationProp = StackNavigationProp<RootStackParamList, 'TaskDetail'>;

export interface TaskDetailProps {
  route: TaskDetailRouteProp;
  navigation: TaskDetailNavigationProp;
}
