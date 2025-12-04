import { Form, Input, InputNumber, Select, DatePicker, TimePicker, Radio, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

// Vitals Form
export function VitalsForm({ form }) {
  return (
    <Form form={form} layout="vertical">
      <Form.Item name="bp_systolic" label="BP Systolic" rules={[{ required: true }]}>
        <InputNumber min={0} max={300} style={{ width: '100%' }} placeholder="120" />
      </Form.Item>
      <Form.Item name="bp_diastolic" label="BP Diastolic" rules={[{ required: true }]}>
        <InputNumber min={0} max={200} style={{ width: '100%' }} placeholder="80" />
      </Form.Item>
      <Form.Item name="pulse" label="Pulse (bpm)">
        <InputNumber min={0} max={200} style={{ width: '100%' }} placeholder="72" />
      </Form.Item>
      <Form.Item name="temperature" label="Temperature (°F)">
        <InputNumber min={90} max={110} step={0.1} style={{ width: '100%' }} placeholder="98.6" />
      </Form.Item>
      <Form.Item name="respiration" label="Respiration (/min)">
        <InputNumber min={0} max={60} style={{ width: '100%' }} placeholder="16" />
      </Form.Item>
      <Form.Item name="spo2" label="SpO2 (%)">
        <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="98" />
      </Form.Item>
      <Form.Item name="rbs" label="RBS (mg/dL)">
        <InputNumber min={0} max={500} style={{ width: '100%' }} placeholder="110" />
      </Form.Item>
      <Form.Item name="notes" label="Notes">
        <TextArea rows={3} placeholder="Any additional notes..." />
      </Form.Item>
    </Form>
  );
}

// Visit Form
export function VisitForm({ form }) {
  return (
    <Form form={form} layout="vertical">
      <Form.Item name="doctor_id" label="Doctor" rules={[{ required: true }]}>
        <Select placeholder="Select doctor">
          {/* Populate from doctors list */}
        </Select>
      </Form.Item>
      <Form.Item name="visit_date" label="Visit Date" rules={[{ required: true }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="visit_time" label="Visit Time" rules={[{ required: true }]}>
        <TimePicker style={{ width: '100%' }} format="HH:mm" />
      </Form.Item>
      <Form.Item name="visit_type" label="Visit Type" rules={[{ required: true }]}>
        <Radio.Group>
          <Radio value="new">New Visit</Radio>
          <Radio value="followup">Follow-up</Radio>
          <Radio value="emergency">Emergency</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item name="reason_for_visit" label="Reason for Visit">
        <TextArea rows={2} placeholder="Chief complaint..." />
      </Form.Item>
      <Form.Item name="complaints" label="Complaints">
        <TextArea rows={3} placeholder="Patient complaints..." />
      </Form.Item>
      <Form.Item name="examination_notes" label="Examination Notes">
        <TextArea rows={3} placeholder="Physical examination findings..." />
      </Form.Item>
      <Form.Item name="diagnosis" label="Diagnosis">
        <TextArea rows={2} placeholder="Diagnosis..." />
      </Form.Item>
      <Form.Item name="consultation_notes" label="Consultation Notes">
        <TextArea rows={3} placeholder="Consultation notes..." />
      </Form.Item>
      <Form.Item name="treatment_plan" label="Treatment Plan">
        <TextArea rows={3} placeholder="Treatment plan..." />
      </Form.Item>
      <Form.Item name="follow_up_required" label="Follow-up Required?" valuePropName="checked">
        <Radio.Group>
          <Radio value={1}>Yes</Radio>
          <Radio value={0}>No</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item name="follow_up_date" label="Follow-up Date">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  );
}

// Prescription Form
export function PrescriptionForm({ form }) {
  return (
    <Form form={form} layout="vertical">
      <Form.Item name="doctor_id" label="Doctor" rules={[{ required: true }]}>
        <Select placeholder="Select doctor">
          {/* Populate from doctors list */}
        </Select>
      </Form.Item>
      <Form.Item name="prescription_date" label="Prescription Date" rules={[{ required: true }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item 
        name="medicines" 
        label="Medicines (JSON format)" 
        rules={[{ required: true }]}
        extra="Format: [{name: 'Medicine Name', dosage: '500mg', frequency: 'Twice daily', duration: '7 days', notes: 'After food'}]"
      >
        <TextArea 
          rows={6} 
          placeholder='[{"name": "Paracetamol", "dosage": "500mg", "frequency": "Twice daily", "duration": "5 days", "notes": "After food"}]'
        />
      </Form.Item>
      <Form.Item name="instructions" label="General Instructions">
        <TextArea rows={3} placeholder="General instructions for the patient..." />
      </Form.Item>
      <Form.Item name="visit_id" label="Link to Visit (Optional)">
        <InputNumber style={{ width: '100%' }} placeholder="Visit ID" />
      </Form.Item>
    </Form>
  );
}

// Procedure Form
export function ProcedureForm({ form }) {
  return (
    <Form form={form} layout="vertical">
      <Form.Item name="procedure_name" label="Procedure Name" rules={[{ required: true }]}>
        <Input placeholder="e.g., Root Canal, Minor Surgery" />
      </Form.Item>
      <Form.Item name="procedure_date" label="Procedure Date" rules={[{ required: true }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="doctor_id" label="Doctor">
        <Select placeholder="Select doctor">
          {/* Populate from doctors list */}
        </Select>
      </Form.Item>
      <Form.Item name="cost" label="Cost (₹)">
        <InputNumber min={0} style={{ width: '100%' }} placeholder="5000" />
      </Form.Item>
      <Form.Item name="notes" label="Procedure Notes">
        <TextArea rows={4} placeholder="Procedure details, observations..." />
      </Form.Item>
      <Form.Item name="follow_up_required" label="Follow-up Required?">
        <Radio.Group>
          <Radio value={1}>Yes</Radio>
          <Radio value={0}>No</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item name="follow_up_date" label="Follow-up Date">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="status" label="Status">
        <Select placeholder="Select status">
          <Option value="scheduled">Scheduled</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      </Form.Item>
    </Form>
  );
}

// Follow-up Form
export function FollowupForm({ form }) {
  return (
    <Form form={form} layout="vertical">
      <Form.Item name="followup_date" label="Follow-up Date" rules={[{ required: true }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="followup_time" label="Follow-up Time">
        <TimePicker style={{ width: '100%' }} format="HH:mm" />
      </Form.Item>
      <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
        <TextArea rows={3} placeholder="Reason for follow-up..." />
      </Form.Item>
      <Form.Item name="notes" label="Additional Notes">
        <TextArea rows={2} placeholder="Any additional notes..." />
      </Form.Item>
    </Form>
  );
}

// Document Form
export function DocumentForm({ form }) {
  return (
    <Form form={form} layout="vertical">
      <Form.Item name="document_type" label="Document Type" rules={[{ required: true }]}>
        <Select placeholder="Select document type">
          <Option value="id_proof">ID Proof</Option>
          <Option value="prescription">Prescription</Option>
          <Option value="report">Medical Report</Option>
          <Option value="xray">X-Ray</Option>
          <Option value="scan">Scan/MRI/CT</Option>
          <Option value="consent">Consent Form</Option>
          <Option value="photo">Photo</Option>
          <Option value="other">Other</Option>
        </Select>
      </Form.Item>
      <Form.Item name="document_name" label="Document Name" rules={[{ required: true }]}>
        <Input placeholder="e.g., Aadhaar Card, Blood Report" />
      </Form.Item>
      <Form.Item name="file_url" label="File URL" rules={[{ required: true }]}>
        <Input placeholder="Upload file and paste URL here" />
      </Form.Item>
      <Form.Item name="file_size" label="File Size (bytes)">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="notes" label="Notes">
        <TextArea rows={2} placeholder="Any notes about this document..." />
      </Form.Item>
      <Form.Item label="Upload File">
        <Upload>
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Form.Item>
    </Form>
  );
}

// Consent Form
export function ConsentForm({ form }) {
  return (
    <Form form={form} layout="vertical">
      <Form.Item name="consent_type" label="Consent Type" rules={[{ required: true }]}>
        <Select placeholder="Select consent type">
          <Option value="treatment">Treatment Consent</Option>
          <Option value="procedure">Procedure Consent</Option>
          <Option value="data_sharing">Data Sharing</Option>
          <Option value="photography">Photography/Video</Option>
          <Option value="other">Other</Option>
        </Select>
      </Form.Item>
      <Form.Item name="consent_title" label="Consent Title" rules={[{ required: true }]}>
        <Input placeholder="e.g., Consent for Root Canal Treatment" />
      </Form.Item>
      <Form.Item name="consent_text" label="Consent Text" rules={[{ required: true }]}>
        <TextArea rows={6} placeholder="Full consent form text..." />
      </Form.Item>
      <Form.Item name="agreed" label="Patient Agreed?" valuePropName="checked">
        <Radio.Group>
          <Radio value={1}>Yes</Radio>
          <Radio value={0}>No</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item name="consent_date" label="Consent Date">
        <DatePicker style={{ width: '100%' }} showTime />
      </Form.Item>
      <Form.Item name="witness_name" label="Witness Name">
        <Input placeholder="Witness name" />
      </Form.Item>
      <Form.Item name="signature_image" label="Signature Image URL">
        <Input placeholder="Upload signature and paste URL" />
      </Form.Item>
    </Form>
  );
}
