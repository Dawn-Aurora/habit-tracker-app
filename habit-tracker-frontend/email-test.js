// More explicit regex that disallows consecutive dots
const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9]|[a-zA-Z0-9])*(\.[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9]|[a-zA-Z0-9])*)*@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/;

const invalidEmails = [
  'plainaddress',
  '@domain.com',
  'email@',
  'email@domain',
  'email..email@domain.com',
  'email@domain@domain.com'
];

const validEmails = [
  'test@example.com',
  'user.name@domain.co.uk',
  'user_name@domain.com',
  'user-name@domain.com',
  'test123@domain.org',
  'a@b.co'
];

console.log('Testing invalid emails:');
invalidEmails.forEach(email => {
  const isValid = emailRegex.test(email);
  console.log(`${email}: ${isValid ? 'PASSES (should fail)' : 'FAILS (correct)'}`);
});

console.log('\nTesting valid emails:');
validEmails.forEach(email => {
  const isValid = emailRegex.test(email);
  console.log(`${email}: ${isValid ? 'PASSES (correct)' : 'FAILS (should pass)'}`);
});
