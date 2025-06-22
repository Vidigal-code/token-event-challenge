const db = db.getSiblingDB('nextlab');

db.createCollection('images');
db.images.createIndex({ qrCodeId: 1 }, { unique: false });
print('Collection "images" and index on "qrCodeId" created.');

db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
print('Collection "users" and unique index on "email" created successfully.');