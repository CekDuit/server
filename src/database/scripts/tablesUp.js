const { logger } = require('../../utils/logger');
const { createTableUSers: createTableUSersQuery, createTableWallet: createTableWalletQuery } = require('../queries');

const createTable = `
    ${createTableWalletQuery};
    ${createTableUSersQuery};
`

(() => {    
   require('../../config/db.config').query(createTable, (err, _) => {
        if (err) {
            logger.error(err.message);
            return;
        }
        logger.info('Table users created!');
        process.exit(0);
    });
})();
