// Switch to the 'user-db' database
db = db.getSiblingDB('user-db');

// Insert an admin user into the 'usermodels' collection
db.usermodels.insertOne({
    username: 'admin',
    email: 'admin@example.com',
    password: '$2b$10$HPO/mLOB8Ikk2iwYP/zJd.YR69yRA6T8Vxkioa7wmCvWdwxGMMrFy',
    isAdmin: true
});

print('Inserted admin user into usermodels collection in user-db.');
