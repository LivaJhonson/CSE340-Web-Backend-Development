-- Update Happy Employee to Employee account type
UPDATE account
SET account_type = 'Employee'
WHERE account_email = 'happy@340.edu';

-- Update Manager User to Admin account type
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'manager@340.edu';