import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tag, Popconfirm, Tooltip } from 'antd';
import { ShopOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout';
import PageTitleHeader from '../components/PageTitleHeader';
import CompactTable from '../components/CompactTable';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Clinics() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClinics();
  }, [search]);

  const fetchClinics = async () => {
    try {
      const queryParams = search ? `search=${search}` : '';
      const response = await api.get(`/hospitals?${queryParams}`);
      setClinics(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch clinics');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/hospitals/${id}`);
      toast.success('Clinic deleted successfully');
      fetchClinics();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete clinic');
    }
  };

  const columns = [
    {
      header: 'Action',
      accessor: 'actions',
      sortable: false,
      width: '100px',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Tooltip title="View">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined style={{ fontSize: '16px', color: '#52c41a' }} />}
              onClick={() => navigate(`/clinics/view/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: '16px', color: '#1890ff' }} />}
              onClick={() => navigate(`/clinics/edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Clinic"
            description="Are you sure you want to delete this clinic?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
    {
      header: 'Registration No',
      accessor: 'registration_no',
      sortable: true,
      width: '140px',
      render: (value) => <span style={{ fontWeight: 500, fontSize: '13px' }}>{value || 'N/A'}</span>
    },
    {
      header: 'Clinic Name',
      accessor: 'name',
      sortable: true,
      render: (value) => <span style={{ fontWeight: 600, fontSize: '13px' }}>{value}</span>
    },
    {
      header: 'Phone',
      accessor: 'phone',
      sortable: true,
      width: '130px',
      render: (value) => <span style={{ fontSize: '13px' }}>{value || 'N/A'}</span>
    },
    {
      header: 'Status',
      accessor: 'is_active',
      sortable: true,
      width: '100px',
      render: (is_active) => (
        <Tag color={is_active ? 'success' : 'error'} style={{ fontSize: '11px' }}>
          {is_active ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      )
    },
    {
      header: 'Date',
      accessor: 'created_at',
      sortable: true,
      width: '120px',
      render: (value) => {
        const date = new Date(value);
        return <span style={{ fontSize: '13px' }}>{date.toLocaleDateString('en-GB')}</span>;
      }
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
      width: '180px',
      render: (value) => <span style={{ fontSize: '12px', color: '#666' }}>{value || 'N/A'}</span>
    },
    {
      header: 'Location',
      accessor: 'city',
      sortable: true,
      width: '150px',
      render: (_, record) => (
        <span style={{ fontSize: '12px' }}>
          {record.city && record.state ? `${record.city}, ${record.state}` : 'N/A'}
        </span>
      )
    },
    {
      header: 'Address',
      accessor: 'address',
      sortable: true,
      width: '200px',
      render: (value) => (
        <span style={{ fontSize: '12px', color: '#666' }} title={value}>
          {value ? (value.length > 40 ? value.substring(0, 40) + '...' : value) : 'N/A'}
        </span>
      )
    }
  ];

  return (
    <PageLayout
      header={
        <PageTitleHeader
          title="Clinics / Hospitals"
          subtitle={`Total Clinics: ${clinics.length}`}
          icon={<ShopOutlined />}
          showSearch={true}
          searchPlaceholder="Search Clinic"
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchSize="default"
          actions={[
            {
              label: 'Add Clinic',
              type: 'primary',
              onClick: () => navigate('/clinics/add')
            }
          ]}
        />
      }
    >
      <CompactTable
        columns={columns}
        data={clinics}
        showCheckbox={true}
        showPagination={true}
        pageSize={10}
      />
    </PageLayout>
  );
}
