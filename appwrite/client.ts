import { Account, Client, Models } from 'react-native-appwrite'
import 'react-native-url-polyfill/auto'

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68b83baf0025a8047e32')
  .setPlatform('com.liongatetechnology.authapp')

export const account = new Account(client)
export type User = Models.User<Models.Preferences>
