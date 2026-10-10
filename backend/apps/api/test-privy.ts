import { PrivyClient } from '@privy-io/node';
const privy = new PrivyClient({ appId: 'x', appSecret: 'x' }) as any;
console.log('usersService proto:', Object.getOwnPropertyNames(Object.getPrototypeOf(privy.usersService)));
console.log('privy.users:', privy.users ? Object.getOwnPropertyNames(Object.getPrototypeOf(privy.users)) : 'undefined');
