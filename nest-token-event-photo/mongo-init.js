db = db.getSiblingDB('nextlab');
db.images.createIndex({ qrCodeId: 1 });