const db = require('../config/database');

// NOTE: real `ambulances` columns are ambulance_number (not vehicle_number), and
// driver_name/driver_phone are plain text fields directly on the table — there is no
// driver_id FK to users (the frontend never sends one either). `equipment` has no
// column and can't be persisted. Status/vehicle_type also have CHECK constraints that
// don't match the values the frontend sends, so they're normalized here:
//   ambulances.status:    'available' | 'on_duty' | 'maintenance' | 'offline'
//     (frontend sends 'available' | 'in_use' | 'maintenance' | 'out_of_service')
//   ambulances.vehicle_type: 'basic' | 'advanced' | 'icu' (lowercase; frontend sends
//     'Basic' | 'Advanced' | 'ICU' | 'Neonatal' — 'Neonatal' has no matching category
//     in the real schema and is left unmapped, see final report)
//   ambulance_trips.status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
//     (frontend's initial create used to send 'assigned', which isn't a valid status)

const STATUS_TO_DB = { available: 'available', in_use: 'on_duty', maintenance: 'maintenance', out_of_service: 'offline' };
const STATUS_FROM_DB = { available: 'available', on_duty: 'in_use', maintenance: 'maintenance', offline: 'out_of_service' };

const normalizeAmbulanceStatus = (status) => STATUS_TO_DB[status] || status;
const denormalizeAmbulanceStatus = (row) => {
  if (row && row.status && STATUS_FROM_DB[row.status]) {
    row.status = STATUS_FROM_DB[row.status];
  }
  return row;
};

// Get all ambulances
exports.getAllAmbulances = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const { status } = req.query;

    let query = `
      SELECT *, ambulance_number as vehicle_number
      FROM ambulances
      WHERE hospital_id = ?
    `;
    const params = [hospitalId];

    if (status) {
      query += ' AND status = ?';
      params.push(normalizeAmbulanceStatus(status));
    }

    query += ' ORDER BY ambulance_number';

    const [ambulances] = await db.query(query, params);
    res.json(ambulances.map(denormalizeAmbulanceStatus));
  } catch (error) {
    console.error('Get ambulances error:', error);
    res.status(500).json({ message: 'Error fetching ambulances', error: error.message });
  }
};

// Add ambulance
exports.addAmbulance = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const {
      vehicle_number,
      vehicle_type,
      driver_name,
      driver_phone,
      status
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO ambulances (
        hospital_id, ambulance_number, vehicle_type, driver_name, driver_phone, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW()) RETURNING id
    `, [
      hospitalId, vehicle_number, vehicle_type ? vehicle_type.toLowerCase() : vehicle_type,
      driver_name, driver_phone, normalizeAmbulanceStatus(status) || 'available'
    ]);

    res.status(201).json({
      message: 'Ambulance added successfully',
      id: result[0]?.id
    });
  } catch (error) {
    console.error('Add ambulance error:', error);
    res.status(500).json({ message: 'Error adding ambulance', error: error.message });
  }
};

// Update ambulance
exports.updateAmbulance = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user.hospital_id;
    const updates = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updates, 'vehicle_number')) {
      updates.ambulance_number = updates.vehicle_number;
      delete updates.vehicle_number;
    }
    if (updates.vehicle_type) {
      updates.vehicle_type = updates.vehicle_type.toLowerCase();
    }
    if (updates.status) {
      updates.status = normalizeAmbulanceStatus(updates.status);
    }
    delete updates.equipment; // no column to persist this to

    const columns = Object.keys(updates);
    if (columns.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const fields = columns.map(key => `${key} = ?`).join(', ');
    const values = [...columns.map(key => updates[key]), hospitalId, id];

    await db.query(`
      UPDATE ambulances
      SET ${fields}, updated_at = NOW()
      WHERE hospital_id = ? AND id = ?
    `, values);

    res.json({ message: 'Ambulance updated successfully' });
  } catch (error) {
    console.error('Update ambulance error:', error);
    res.status(500).json({ message: 'Error updating ambulance', error: error.message });
  }
};

// Delete ambulance
exports.deleteAmbulance = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user.hospital_id;

    await db.query('DELETE FROM ambulances WHERE id = ? AND hospital_id = ?', [id, hospitalId]);

    res.json({ message: 'Ambulance deleted successfully' });
  } catch (error) {
    console.error('Delete ambulance error:', error);
    res.status(500).json({ message: 'Error deleting ambulance', error: error.message });
  }
};

// Get ambulance trips
exports.getAmbulanceTrips = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const { ambulanceId, status } = req.query;

    let query = `
      SELECT at.*, a.ambulance_number as vehicle_number,
             (p.first_name || ' ' || p.last_name) as patient_name
      FROM ambulance_trips at
      JOIN ambulances a ON at.ambulance_id = a.id
      LEFT JOIN patients p ON at.patient_id = p.id
      WHERE at.hospital_id = ?
    `;
    const params = [hospitalId];

    if (ambulanceId) {
      query += ' AND at.ambulance_id = ?';
      params.push(ambulanceId);
    }

    if (status) {
      query += ' AND at.status = ?';
      params.push(status);
    }

    query += ' ORDER BY at.created_at DESC';

    const [trips] = await db.query(query, params);
    res.json(trips);
  } catch (error) {
    console.error('Get ambulance trips error:', error);
    res.status(500).json({ message: 'Error fetching ambulance trips', error: error.message });
  }
};

// Create ambulance trip
exports.createTrip = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const {
      ambulance_id,
      patient_id,
      pickup_location,
      dropoff_location,
      trip_type,
      emergency_level,
      notes
    } = req.body;

    // Check ambulance availability
    const [ambulance] = await db.query(
      'SELECT status FROM ambulances WHERE id = ? AND hospital_id = ?',
      [ambulance_id, hospitalId]
    );

    if (!ambulance.length || ambulance[0].status !== 'available') {
      return res.status(400).json({ message: 'Ambulance not available' });
    }

    // trip_type/emergency_level have no columns on ambulance_trips; fold them into
    // notes so the information isn't silently discarded.
    const tripMeta = [trip_type ? `Trip type: ${trip_type}` : null, emergency_level ? `Emergency level: ${emergency_level}` : null]
      .filter(Boolean).join('. ');
    const combinedNotes = [tripMeta, notes].filter(Boolean).join(' | ');

    const [result] = await db.query(`
      INSERT INTO ambulance_trips (
        ambulance_id, hospital_id, patient_id, pickup_location,
        dropoff_location, notes, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'scheduled', NOW()) RETURNING id
    `, [
      ambulance_id, hospitalId, patient_id, pickup_location,
      dropoff_location, combinedNotes || null
    ]);

    // Update ambulance status
    await db.query(
      'UPDATE ambulances SET status = ? WHERE id = ?',
      ['on_duty', ambulance_id]
    );

    res.status(201).json({
      message: 'Ambulance trip created successfully',
      id: result[0]?.id
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ message: 'Error creating ambulance trip', error: error.message });
  }
};

// Update trip status
exports.updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user.hospital_id;
    const { status } = req.body;

    const [trip] = await db.query(
      'SELECT ambulance_id FROM ambulance_trips WHERE id = ? AND hospital_id = ?',
      [id, hospitalId]
    );

    if (!trip.length) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    await db.query(
      'UPDATE ambulance_trips SET status = ?, dropoff_time = ? WHERE id = ?',
      [status, status === 'completed' ? new Date() : null, id]
    );

    // If trip completed, make ambulance available
    if (status === 'completed') {
      await db.query(
        'UPDATE ambulances SET status = ? WHERE id = ?',
        ['available', trip[0].ambulance_id]
      );
    }

    res.json({ message: 'Trip status updated successfully' });
  } catch (error) {
    console.error('Update trip status error:', error);
    res.status(500).json({ message: 'Error updating trip status', error: error.message });
  }
};
