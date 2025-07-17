import getDatabase, { generateId, getCurrentTimestamp } from './database.js';

const db = getDatabase();

// Create audit log entry
export async function createAuditLog({
  userId,
  action,
  resourceType = null,
  resourceId = null,
  ipAddress = null,
  userAgent = null,
  details = null
}) {
  try {
    const id = generateId();
    
    const stmt = db.prepare(`
      INSERT INTO audit_logs (
        id, user_id, action, resource_type, resource_id,
        ip_address, user_agent, details, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId || null,
      action,
      resourceType,
      resourceId,
      ipAddress,
      userAgent,
      details ? JSON.stringify(details) : null,
      getCurrentTimestamp()
    );

    return { success: true, id };
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return { success: false, error: error.message };
  }
}

// Get audit logs with pagination and filtering
export function getAuditLogs(options = {}) {
  const { 
    page = 1, 
    limit = 50, 
    userId = null, 
    action = null, 
    resourceType = null,
    startDate = null,
    endDate = null 
  } = options;
  
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT a.*, u.first_name, u.last_name, u.email
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
  `;
  
  const conditions = [];
  const params = [];
  
  if (userId) {
    conditions.push('a.user_id = ?');
    params.push(userId);
  }
  
  if (action) {
    conditions.push('a.action = ?');
    params.push(action);
  }
  
  if (resourceType) {
    conditions.push('a.resource_type = ?');
    params.push(resourceType);
  }
  
  if (startDate) {
    conditions.push('a.timestamp >= ?');
    params.push(startDate);
  }
  
  if (endDate) {
    conditions.push('a.timestamp <= ?');
    params.push(endDate);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY a.timestamp DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const stmt = db.prepare(query);
  const logs = stmt.all(...params);
  
  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM audit_logs a';
  const countParams = [];
  
  if (conditions.length > 0) {
    countQuery += ' WHERE ' + conditions.join(' AND ');
    // Add the same filter parameters for count query
    if (userId) countParams.push(userId);
    if (action) countParams.push(action);
    if (resourceType) countParams.push(resourceType);
    if (startDate) countParams.push(startDate);
    if (endDate) countParams.push(endDate);
  }
  
  const countStmt = db.prepare(countQuery);
  const { total } = countStmt.get(...countParams);
  
  return {
    logs: logs.map(formatAuditLog),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

// Helper function to format audit log data
function formatAuditLog(log) {
  return {
    id: log.id,
    userId: log.user_id,
    action: log.action,
    resourceType: log.resource_type,
    resourceId: log.resource_id,
    ipAddress: log.ip_address,
    userAgent: log.user_agent,
    details: log.details ? JSON.parse(log.details) : null,
    timestamp: log.timestamp,
    user: log.first_name ? {
      firstName: log.first_name,
      lastName: log.last_name,
      email: log.email
    } : null
  };
} 