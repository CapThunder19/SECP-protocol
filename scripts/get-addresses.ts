import fs from 'fs';

const deployed = JSON.parse(fs.readFileSync('deployed-addresses.json', 'utf8'));

console.log('\n📋 Deployed Contract Addresses:\n');
console.log('Risky Token:', deployed.contracts.riskyToken);
console.log('Safe Token:', deployed.contracts.safeToken);
console.log('Yield Token:', deployed.contracts.yieldToken);
console.log('Vault:', deployed.contracts.vault);
console.log('Borrow:', deployed.contracts.borrow);

// Note: RWA token address needs to be added to deployed-addresses.json
console.log('\n⚠️  RWA token address is missing from deployed-addresses.json');
console.log('Run the deployment script again to get the complete addresses.');
