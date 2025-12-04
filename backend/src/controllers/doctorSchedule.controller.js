const db = require('../config/database');

// Get doctor schedules
exports.getDoctorSchedules = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const { doctorId, dayOfWeek } = req.query;

    let query = `
      SELECT ds.*, d.name as doctor_name, d.specialization, dep.name as department_name
      FROM doctor_schedules ds
      JOIN doctors d ON ds.doctor_id = d.id
      LEFT JOIN departments dep ON d.department_id = dep.id
      WHERE ds.hospital_id = ?
    `;
    const params = [hospitalId];

    if (doctorId) {
      query += ' AND ds.doctor_id = ?';
      params.push(doctorId);
    }

    if (dayOfWeek) {
      query += ' AND ds.day_of_week = ?';
      params.push(dayOfWeek);
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
    const { hospitalId } = req.user;
    const {
      doctor_id,
      day_of_week,
      start_time,
      end_time,
      max_appointments,
      is_available
    } = req.body;

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
        max_appointments, is_available
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [doctor_id, hospitalId, day_of_week, start_time, end_time, max_appointments, is_available]);

    res.status(201).json({
      message: 'Schedule added successfully',
      id: result.insertId
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
    const { hospitalId } = req.user;
    const updates = req.body;

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), hospitalId, id];

    await db.query(`
      UPDATE doctor_schedules 
      SET ${fields}
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
    const { hospitalId } = req.user;

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
    const { hospitalId } = req.user;

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
