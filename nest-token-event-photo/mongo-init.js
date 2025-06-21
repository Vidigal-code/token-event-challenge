const db = db.getSiblingDB('nextlab');
db.createCollection('images');
db.images.createIndex({ qrCodeId: 1 }, { unique: false });
print('Database "nextlab" and index on "images.qrCodeId" created successfully.');