import {createHandler} from './_runtime.mjs';
// Signature verification requires the exact bytes; reject a body parsed by middleware.
export const config = {api:{bodyParser:false}};
export default createHandler('webhook');
