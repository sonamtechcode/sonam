const db = require('../config/database');

// Get all ambulances
exports.getAllAmbulances = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const { status } = req.query;

    let query = `
      SELECT a.*, d.name as driver_name, d.phone as driver_phone
      FROM ambulances a
      LEFT JOIN (
        SELECT id, name, phone FROM users WHERE role = 'driver'
      ) d ON a.driver_id = d.id
      WHERE a.hospital_id = ?
    `;
    const params = [hospitalId];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.vehicle_number';

    const [ambulances] = await db.query(query, params);
    res.json(ambulances);
  } catch (error) {
    console.error('Get ambulances error:', error);
    res.status(500).json({ message: 'Error fetching ambulances', error: error.message });
  }
};

// Add ambulance
exports.addAmbulance = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const {
      vehicle_number,
      vehicle_type,
      driver_id,
      driver_name,
      driver_phone,
      status,
      equipment
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO ambulances (
        hospital_id, vehicle_number, vehicle_type, driver_id,
        driver_name, driver_phone, status, equipment, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      hospitalId, vehicle_number, vehicle_type, driver_id,
      driver_name, driver_phone, status || 'available', equipment
    ]);

    res.status(201).json({
      message: 'Ambulance added successfully',
      id: result.insertId
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
    const { hospitalId } = req.user;
    const updates = req.body;

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), hospitalId, id];

    await db.query(`
      UPDATE ambulances 
      SET ${fields}
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
    const { hospitalId } = req.user;

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
    const { hospitalId } = req.user;
    const { ambulanceId, status } = req.query;

    let query = `
      SELECT at.*, a.vehicle_number, p.name as patient_name
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
    const { hospitalId } = req.user;
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

    const [result] = await db.query(`
      INSERT INTO ambulance_trips (
        ambulance_id, hospital_id, patient_id, pickup_location,
        dropoff_location, trip_type, emergency_level, notes,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'assigned', NOW())
    `, [
      ambulance_id, hospitalId, patient_id, pickup_location,
      dropoff_location, trip_type, emergency_level, notes
    ]);

    // Update ambulance status
    await db.query(
      'UPDATE ambulances SET status = ? WHERE id = ?',
      ['in_use', ambulance_id]
    );

    res.status(201).json({
      message: 'Ambulance trip created successfully',
      id: result.insertId
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
    const { hospitalId } = req.user;
    const { status } = req.body;

    const [trip] = await db.query(
      'SELECT ambulance_id FROM ambulance_trips WHERE id = ? AND hospital_id = ?',
      [id, hospitalId]
    );

    if (!trip.length) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    await db.query(
      'UPDATE ambulance_trips SET status = ?, completed_at = ? WHERE id = ?',
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
