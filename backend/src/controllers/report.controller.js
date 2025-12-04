const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/reports';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
}).single('file');

exports.uploadMiddleware = upload;

exports.getByPatient = async (req, res) => {
  try {
    const [reports] = await db.query(
      `SELECT * FROM patient_reports WHERE patient_id = ? ORDER BY created_at DESC`,
      [req.params.patientId]
    );
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { patient_id, report_type, description } = req.body;
    const file_path = req.file.path;
    const file_name = req.file.originalname;

    const [result] = await db.query(
      `INSERT INTO patient_reports (patient_id, report_type, file_name, file_path, description) 
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, report_type, file_name, file_path, description]
    );

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const [reports] = await db.query('SELECT file_path FROM patient_reports WHERE id = ?', [req.params.id]);
    
    if (reports.length > 0 && fs.existsSync(reports[0].file_path)) {
      fs.unlinkSync(reports[0].file_path);
    }

    await db.query('DELETE FROM patient_reports WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
