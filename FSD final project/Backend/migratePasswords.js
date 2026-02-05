const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('./model/user');

async function migrate() {
  await mongoose.connect('mongodb+srv://PMS:PMS2026@pms.7ioxyan.mongodb.net/project?retryWrites=true&w=majority');
  
  const User = mongoose.model('User');
  const users = await User.find({});
  
  let updated = 0;
  
  for (let user of users) {
    // Check if password is NOT hashed (bcrypt hashes start with $2)
    if (!user.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();
      updated++;
      console.log(`✅ Updated: ${user.email}`);
    }
  }
  
  console.log(`\n🎉 Migration complete. Updated ${updated} users.`);
  mongoose.disconnect();
}

migrate().catch(console.error);