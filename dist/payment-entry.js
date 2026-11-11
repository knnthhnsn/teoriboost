import {FIREBASE_CONFIG} from './firebase-config.js';
import {createPaymentAccount} from './payment-account.js';
import {createPaymentPage} from './payment.js';
const account=createPaymentAccount({config:FIREBASE_CONFIG});
createPaymentPage({account});
