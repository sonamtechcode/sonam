const db = require('../config/database');

// NOTE: the real schema's table is `payment` (not `patient_payments`), and it has no
// `description` column (mapped to `notes`). hospital_id is NOT NULL, so it's pulled
// from the authenticated user.

exports.getByPatient = async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT * FROM payment WHERE patient_id = ? ORDER BY payment_date DESC`,
      [req.params.patientId]
    );
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const { patient_id, billing_id, amount, description, payment_method, status } = req.body;

    const [result] = await db.query(
      `INSERT INTO payment (hospital_id, patient_id, billing_id, amount, notes, payment_method, status, payment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW()) RETURNING id`,
      [hospitalId, patient_id, billing_id || null, amount, description, payment_method, status || 'pending']
    );

    res.status(201).json({
      success: true,
      message: 'Payment record created successfully',
      id: result[0]?.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const { amount, description, payment_method, status } = req.body;

    await db.query(
      `UPDATE payment SET amount = ?, notes = ?, payment_method = ?, status = ?, updated_at = NOW()
       WHERE id = ? AND hospital_id = ?`,
      [amount, description, payment_method, status, req.params.id, hospitalId]
    );

    res.json({ success: true, message: 'Payment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    await db.query('DELETE FROM payment WHERE id = ? AND hospital_id = ?', [req.params.id, hospitalId]);
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
