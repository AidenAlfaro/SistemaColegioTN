const bcrypt = require('bcrypt');

async function hashPassword(plainPassword) {
    return await bcrypt.hash(plainPassword, 10);
}

hashPassword('Aiden123').then(hashed => {
    console.log('Hashed Password:', hashed);
});
