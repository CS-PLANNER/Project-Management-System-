const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://PMS:PMS2026@pms.7ioxyan.mongodb.net/project?retryWrites=true&w=majority')
  .then(() => {
    console.log('✅ Database Connected Successfully to project_management!')
  })
  .catch((err) => console.log('❌ Connection error:', err))