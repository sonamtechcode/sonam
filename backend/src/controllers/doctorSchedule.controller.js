const db = require('../config/database');

// doctor_schedules.day_of_week has a CHECK constraint requiring capitalized values
// ('Monday'..'Sunday'), but the frontend (DoctorSchedule.jsx) sends lowercase
// ('monday'..'sunday'). Normalize here so inserts/filters don't fail the constraint.
const normalizeDay = (day) => {
  if (!day || typeof day !== 'string') return day;
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
};

// Get doctor schedules
exports.getDoctorSchedules = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const { doctorId, dayOfWeek } = req.query;

    // Doctors have no department_id FK in the real schema, so department_name is
    // derived via the specialization-name heuristic (best-effort, not a real relation).
    let query = `
      SELECT ds.*, (u.first_name || ' ' || u.last_name) as doctor_name, d.specialization,
             dep.name as department_name
      FROM doctor_schedules ds
      JOIN doctors d ON ds.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      LEFT JOIN departments dep ON dep.hospital_id = d.hospital_id AND dep.name = d.specialization
      WHERE ds.hospital_id = ?
    `;
    const params = [hospitalId];

    if (doctorId) {
      query += ' AND ds.doctor_id = ?';
      params.push(doctorId);
    }

    if (dayOfWeek) {
      query += ' AND ds.day_of_week = ?';
      params.push(normalizeDay(dayOfWeek));
    }

    query += ' ORDER BY ds.day_of_week, ds.start_time';

    const [schedules] = await db.query(query, params);
    res.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ message: 'Error fetching schedules', error: error.message });
  }
};

// Add doctor schedule
exports.addSchedule = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const {
      doctor_id,
      start_time,
      end_time,
      max_patients,
      is_active
    } = req.body;
    const day_of_week = normalizeDay(req.body.day_of_week);

    // Check for overlapping schedules
    const [existing] = await db.query(`
      SELECT id FROM doctor_schedules
      WHERE doctor_id = ? AND day_of_week = ? AND hospital_id = ?
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
    `, [doctor_id, day_of_week, hospitalId, start_time, start_time, end_time, end_time, start_time, end_time]);

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Schedule overlaps with existing schedule' });
    }

    const [result] = await db.query(`
      INSERT INTO doctor_schedules (
        doctor_id, hospital_id, day_of_week, start_time, end_time,
        max_patients_per_day, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id
    `, [doctor_id, hospitalId, day_of_week, start_time, end_time, max_patients, is_active !== false]);

    res.status(201).json({
      message: 'Schedule added successfully',
      id: result[0]?.id
    });
  } catch (error) {
    console.error('Add schedule error:', error);
    res.status(500).json({ message: 'Error adding schedule', error: error.message });
  }
};

// Update doctor schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user.hospital_id;

    // max_patients (frontend field name) maps to the max_patients_per_day column;
    // everything else the frontend sends (day_of_week, start_time, end_time, is_active)
    // already matches the real column names.
    const updates = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(updates, 'max_patients')) {
      updates.max_patients_per_day = updates.max_patients;
      delete updates.max_patients;
    }
    if (updates.day_of_week) {
      updates.day_of_week = normalizeDay(updates.day_of_week);
    }

    const columns = Object.keys(updates);
    if (columns.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const fields = columns.map(key => `${key} = ?`).join(', ');
    const values = [...columns.map(key => updates[key]), hospitalId, id];

    await db.query(`
      UPDATE doctor_schedules
      SET ${fields}, updated_at = NOW()
      WHERE hospital_id = ? AND id = ?
    `, values);

    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: 'Error updating schedule', error: error.message });
  }
};

// Delete doctor schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user.hospital_id;

    await db.query('DELETE FROM doctor_schedules WHERE id = ? AND hospital_id = ?', [id, hospitalId]);

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ message: 'Error deleting schedule', error: error.message });
  }
};

// Get weekly schedule for a doctor
exports.getWeeklySchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const hospitalId = req.user.hospital_id;

    const [schedules] = await db.query(`
      SELECT * FROM doctor_schedules
      WHERE doctor_id = ? AND hospital_id = ?
      ORDER BY day_of_week, start_time
    `, [doctorId, hospitalId]);

    // Format as weekly calendar
    const weeklySchedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };

    schedules.forEach(schedule => {
      weeklySchedule[schedule.day_of_week].push(schedule);
    });

    res.json(weeklySchedule);
  } catch (error) {
    console.error('Get weekly schedule error:', error);
    res.status(500).json({ message: 'Error fetching weekly schedule', error: error.message });
  }
};
