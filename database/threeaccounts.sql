-- Create Basic Client
INSERT INTO account (
    account_firstname,
    account_lastname,
    account_email,
    account_password,
    account_type
) VALUES (
    'Basic',
    'Client',
    'basic@340.edu',
    'I@mABas1cCl!3nt',
    'Client'
);

-- Create Happy Employee
INSERT INTO account (
    account_firstname,
    account_lastname,
    account_email,
    account_password,
    account_type
) VALUES (
    'Happy',
    'Employee',
    'happy@340.edu',
    'I@mAnEmpl0y33',
    'Client'
);

-- Create Manager User
INSERT INTO account (
    account_firstname,
    account_lastname,
    account_email,
    account_password,
    account_type
) VALUES (
    'Manager',
    'User',
    'manager@340.edu',
    'I@mAnAdm!n1strat0r',
    'Client'
);
