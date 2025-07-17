import getDatabase, { generateId, getCurrentTimestamp } from '../lib/database.js';
import bcrypt from 'bcryptjs';

const db = getDatabase();

// User operations
export const User = {
  // Create a new user
  create: async (userData) => {
    const id = generateId();
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const stmt = db.prepare(`
      INSERT INTO users (
        id, email, password, first_name, middle_name, last_name,
        father_name, grandfather_name, mother_name, date_of_birth,
        place_of_birth, nationality, gender, marital_status,
        national_id, phone, address, city, state, postal_code,
        country, emergency_contact_name, emergency_contact_relationship,
        emergency_contact_phone, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        id,
        userData.email,
        hashedPassword,
        userData.firstName,
        userData.middleName || null,
        userData.lastName,
        userData.fatherName || null,
        userData.grandfatherName || null,
        userData.motherName || null,
        userData.dateOfBirth,
        userData.placeOfBirth,
        userData.nationality || 'Sudanese',
        userData.gender,
        userData.maritalStatus || null,
        userData.nationalId,
        userData.phone,
        userData.address,
        userData.city,
        userData.state,
        userData.postalCode || null,
        userData.country || 'Sudan',
        userData.emergencyContactName || null,
        userData.emergencyContactRelationship || null,
        userData.emergencyContactPhone || null,
        getCurrentTimestamp(),
        getCurrentTimestamp()
      );

      return User.findById(id);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        if (error.message.includes('email')) {
          throw new Error('Email already exists');
        }
        if (error.message.includes('national_id')) {
          throw new Error('National ID already exists');
        }
      }
      throw error;
    }
  },

  // Find user by ID
  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id);
    return user ? formatUser(user) : null;
  },

  // Find user by email
  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);
    return user ? formatUser(user) : null;
  },

  // Find user by national ID
  findByNationalId: (nationalId) => {
    const stmt = db.prepare('SELECT * FROM users WHERE national_id = ?');
    const user = stmt.get(nationalId);
    return user ? formatUser(user) : null;
  },

  // Update user
  update: (id, updateData) => {
    const allowedFields = [
      'first_name', 'middle_name', 'last_name', 'father_name',
      'grandfather_name', 'mother_name', 'phone', 'address',
      'city', 'state', 'postal_code', 'country',
      'emergency_contact_name', 'emergency_contact_relationship',
      'emergency_contact_phone'
    ];

    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      const dbField = camelToSnake(key);
      if (allowedFields.includes(dbField)) {
        updates.push(`${dbField} = ?`);
        values.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('updated_at = ?');
    values.push(getCurrentTimestamp());
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `);

    const result = stmt.run(...values);
    if (result.changes === 0) {
      throw new Error('User not found');
    }

    return User.findById(id);
  },

  // Delete user
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // Verify password
  verifyPassword: async (user, password) => {
    return await bcrypt.compare(password, user.password);
  },

  // Change password
  changePassword: async (id, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const stmt = db.prepare(`
      UPDATE users 
      SET password = ?, updated_at = ? 
      WHERE id = ?
    `);
    
    const result = stmt.run(hashedPassword, getCurrentTimestamp(), id);
    return result.changes > 0;
  },

  // List users with pagination
  list: (options = {}) => {
    const { page = 1, limit = 10, search = '' } = options;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM users';
    const params = [];

    if (search) {
      query += ' WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR national_id LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const users = stmt.all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const countParams = [];
    if (search) {
      countQuery += ' WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR national_id LIKE ?';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const countStmt = db.prepare(countQuery);
    const { total } = countStmt.get(...countParams);

    return {
      users: users.map(formatUser),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
};

// Helper function to format user data (convert snake_case to camelCase)
function formatUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    password: user.password, // Keep for password verification
    firstName: user.first_name,
    middleName: user.middle_name,
    lastName: user.last_name,
    fatherName: user.father_name,
    grandfatherName: user.grandfather_name,
    motherName: user.mother_name,
    dateOfBirth: user.date_of_birth,
    placeOfBirth: user.place_of_birth,
    nationality: user.nationality,
    gender: user.gender,
    maritalStatus: user.marital_status,
    nationalId: user.national_id,
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state,
    postalCode: user.postal_code,
    country: user.country,
    emergencyContactName: user.emergency_contact_name,
    emergencyContactRelationship: user.emergency_contact_relationship,
    emergencyContactPhone: user.emergency_contact_phone,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

// Helper function to convert camelCase to snake_case
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export default User; 