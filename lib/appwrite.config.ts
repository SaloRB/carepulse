import * as sdk from 'node-appwrite'

const client = new sdk.Client()

client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
  .setProject('66c8bde6002db8220077')
  .setKey('d999f93ba42563e42edeae23a9690685e8d0a4beb8d256d73c4d8a74fc5b3aa37b8880dbab0cbd720904d0476ba8d91419a5d1feb8155f423915346267cf8948e9a922047426574dc82ec042914f42d64dcd846bd9145ca3808802b4d9b5c1bc5395085a2ca8794cce2611925c78ef7d8a4122f41e2c3150433e60bd6e7374a5')

export const databases = new sdk.Databases(client)
export const storage = new sdk.Storage(client)
export const messaging = new sdk.Messaging(client)
export const users = new sdk.Users(client)