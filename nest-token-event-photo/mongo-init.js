const db = db.getSiblingDB('nextlab');

if (!db.getCollectionNames().includes('images')) {
    db.createCollection('images');
    print('Collection "images" created.');
}
db.images.createIndex({ qrCodeId: 1 }, { unique: false });
print('Index on "qrCodeId" created in "images".');

if (!db.getCollectionNames().includes('users')) {
    db.createCollection('users');
    print('Collection "users" created.');
}
db.users.createIndex({ email: 1 }, { unique: true });
print('Unique index on "email" created in "users".');

const existingUser = db.users.findOne({ _id: ObjectId('685833e7ed3bf6bb7d1fb416') });

if (!existingUser) {
    db.users.insertOne({
        _id: ObjectId('685833e7ed3bf6bb7d1fb416'),
        name: 'Test User',
        email: 'test@example.com',
        password: '$2b$10$p6/mTyBGzZpN3jUa9ZUCveofNkhVkhbk2F0fv2iUMtZuYhwWZ6QdW', 
        role: 'admin',
        createdAt: ISODate('2025-06-22T16:48:39.323Z'),
        updatedAt: ISODate('2025-06-22T16:48:39.323Z'),
        __v: 0
    });
    print('Admin user inserted successfully.');
} else {
    print('Admin user already exists. Skipping insertion.');
}
