export default async function handler(req, res) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    envVercel: process.env.VERCEL,
    cwd: process.cwd(),
    dirname: __dirname,
    errors: []
  };

  try {
    const mongoose = require('mongoose');
    diagnostics.mongooseLoaded = true;
    diagnostics.readyState = mongoose.connection.readyState;
  } catch (e) {
    diagnostics.errors.push({ step: 'require mongoose', error: e.message, stack: e.stack });
  }

  try {
    const app = require('../../../server');
    diagnostics.serverLoaded = !!app;
  } catch (e) {
    diagnostics.errors.push({ step: 'require server.js', error: e.message, stack: e.stack });
  }

  res.status(200).json({ success: true, diagnostics });
}
