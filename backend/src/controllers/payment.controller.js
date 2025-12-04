const db = require('../config/database');

exports.getByPatient = async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT * FROM patient_payments WHERE patient_id = ? ORDER BY payment_date DESC`,
      [req.params.patientId]
    );
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { patient_id, amount, description, payment_method, status } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO patient_payments (patient_id, amount, description, payment_method, status, payment_date) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [patient_id, amount, description, payment_method, status || 'Pending']
    );

    res.status(201).json({
      success: true,
      message: 'Payment record created successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { amount, description, payment_method, status } = req.body;
    
    await db.query(
      `UPDATE patient_payments SET amount = ?, description = ?, payment_method = ?, status = ? 
       WHERE id = ?`,
      [amount, description, payment_method, status, req.params.id]
    );

    res.json({ success: true, message: 'Payment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await db.query('DELETE FROM patient_payments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
