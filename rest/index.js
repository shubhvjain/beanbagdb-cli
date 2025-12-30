import express from 'express';
import { BeanBagDB_CouchDB } from './bbdb_couch.js';
import { loadConfigFile } from './config.js';

let bbdbs = {};

const get_bbdb_object = (db_details) => {
  if (!bbdbs[db_details.name]) {
    bbdbs[db_details.name] = new BeanBagDB_CouchDB(
      db_details.url,
      db_details.name,
      db_details.encryption_key
    );
  }
  return bbdbs[db_details.name];
};

export const createRestApi = async () => {
  const config = await loadConfigFile();
  const router = express.Router();
  router.use(express.json());

  // GET /help - API docs + DB list
  router.get('/help', (req, res) => {
    res.json({
      message: 'POST /:db_name/:action - DB key from config, action from API',
      databases: Object.keys(config.database),
      endpoints: BeanBagDB_CouchDB.rest_enabled,
      example: 'POST /db/mydb/search'
    });
  });

  // POST /:db_name/:action - Perfect URL structure!
  router.post('/:db_name/:action', async (req, res) => {
    const { db_name, action } = req.params;
    const params = req.body;
    const db_details = config.database[db_name];

    if (!db_details) {
      return res.status(400).json({
        success: false,
        error: `Database "${db_name}" not found`,
        available: Object.keys(config.database)
      });
    }

    if (!BeanBagDB_CouchDB.rest_enabled[action]) {
      return res.status(400).json({
        success: false,
        error: `Action '${action}' not valid`,
        api: BeanBagDB_CouchDB.rest_enabled
      });
    }

    try {
      const bbdb = get_bbdb_object(db_details);
      const result = await bbdb[action](params);
      res.json({ 
        success: true, 
        result, 
        db: db_name,
        action 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  return router;
};

export default createRestApi;
