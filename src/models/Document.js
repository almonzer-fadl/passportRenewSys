import getDatabase, { generateId, getCurrentTimestamp } from '../lib/database.js';

const db = getDatabase();

// Document operations
export const Document = {
  // Create a new document
  create: (documentData) => {
    const id = generateId();
    
    const stmt = db.prepare(`
      INSERT INTO documents (
        id, application_id, filename, original_name, mimetype, size,
        document_type, file_path, uploaded_at, ai_validated,
        ai_validation_score, ai_validation_notes, validation_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        id,
        documentData.applicationId,
        documentData.filename,
        documentData.originalName,
        documentData.mimetype,
        documentData.size,
        documentData.documentType,
        documentData.filePath,
        getCurrentTimestamp(),
        false, // ai_validated
        null, // ai_validation_score
        null, // ai_validation_notes
        'pending' // validation_status
      );

      return Document.findById(id);
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  },

  // Find document by ID
  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM documents WHERE id = ?');
    return stmt.get(id);
  },

  // Find documents by application ID
  findByApplicationId: (applicationId) => {
    const stmt = db.prepare('SELECT * FROM documents WHERE application_id = ? ORDER BY uploaded_at DESC');
    return stmt.all(applicationId);
  },

  // Find documents by type
  findByType: (applicationId, documentType) => {
    const stmt = db.prepare('SELECT * FROM documents WHERE application_id = ? AND document_type = ?');
    return stmt.all(applicationId, documentType);
  },

  // Update document validation status
  updateValidation: (id, isValid, validationScore = null, notes = null) => {
    const stmt = db.prepare(`
      UPDATE documents 
      SET ai_validated = ?, validation_status = ?, ai_validation_score = ?, ai_validation_notes = ?
      WHERE id = ?
    `);
    
    const status = isValid ? 'approved' : 'rejected';
    stmt.run(isValid, status, validationScore, notes, id);
    
    return Document.findById(id);
  },

  // Delete document
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM documents WHERE id = ?');
    return stmt.run(id);
  },

  // Get all documents for a user
  findByUser: (userId) => {
    const stmt = db.prepare(`
      SELECT d.*, a.application_number 
      FROM documents d
      JOIN applications a ON d.application_id = a.id
      WHERE a.user_id = ?
      ORDER BY d.uploaded_at DESC
    `);
    return stmt.all(userId);
  },

  // Count documents by application
  countByApplication: (applicationId) => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM documents WHERE application_id = ?');
    return stmt.get(applicationId).count;
  }
};

export default Document; 