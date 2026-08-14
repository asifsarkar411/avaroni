const app = require('../../../server');

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req, res) {
  try {
    return app(req, res);
  } catch (e) {
    console.error("Pages API error:", e);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: e.message, stack: e.stack });
    }
  }
}
