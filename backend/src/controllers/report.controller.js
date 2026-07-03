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

// NOTE: the real table is `report` (not `patient_reports`), and it has no file_name /
// file_path / description columns — it models a clinical report (findings/recommendations)
// with a single `file_url` field, not a generic file-upload record. The uploaded file's
// disk path is stored in file_url (closest available column) and its original name is
// folded into `findings` so it isn't silently lost; there's nowhere else to put it in the
// real schema.
exports.getByPatient = async (req, res) => {
  try {
    const [reports] = await db.query(
      `SELECT *, file_url as file_path FROM report WHERE patient_id = ? ORDER BY created_at DESC`,
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

    const hospitalId = req.user.hospital_id;
    const { patient_id, report_type, description } = req.body;
    const file_path = req.file.path;
    const file_name = req.file.originalname;
    const findings = description ? `${description} (file: ${file_name})` : `file: ${file_name}`;

    const [result] = await db.query(
      `INSERT INTO report (hospital_id, patient_id, report_type, file_url, findings, report_date, status)
       VALUES (?, ?, ?, ?, ?, CURRENT_DATE, 'draft') RETURNING id`,
      [hospitalId, patient_id, report_type, file_path, findings]
    );

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully',
      id: result[0]?.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const [reports] = await db.query('SELECT file_url FROM report WHERE id = ?', [req.params.id]);

    if (reports.length > 0 && reports[0].file_url && fs.existsSync(reports[0].file_url)) {
      fs.unlinkSync(reports[0].file_url);
    }

    await db.query('DELETE FROM report WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
