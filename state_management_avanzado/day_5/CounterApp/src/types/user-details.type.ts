import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'src/constants/common.constants';

export type UserDetailScreenRouteProp = RouteProp<RootStackParamList, 'UserDetail'>;
export type UserDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserDetail'>;

export type UserDetailProps = {
  route: UserDetailScreenRouteProp;
  navigation: UserDetailScreenNavigationProp;
};
