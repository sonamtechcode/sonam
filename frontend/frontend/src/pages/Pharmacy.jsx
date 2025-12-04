import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { PlusOutlined } from '@ant-design/icons'
import { AlertTriangle } from 'lucide-react'
import { Select, DatePicker, Form } from 'antd'
import PageLayout from '../components/PageLayout'
import PageTitleHeader from '../components/PageTitleHeader'
import CompactTable from '../components/CompactTable'
import FilterDrawer from '../components/FilterDrawer'
import { countActiveFilters } from '../utils/filterHelpers'
import { exportToCSV } from '../utils/exportHelpers'
import api from '../services/api'

const { RangePicker } = DatePicker

export default function Pharmacy() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [medicines, setMedicines] = useState([])
  const [search, setSearch] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filters, setFilters] = useState({
    stockLevel: null,
    expiryRange: null
  })

  useEffect(() => {
    if (selectedHospital) {
      fetchMedicines()
    }
  }, [selectedHospital])

  const fetchMedicines = () => {
    let queryParams = `hospital_id=${selectedHospital.id}`
    if (search) queryParams += `&search=${search}`
    if (filters.stockLevel) queryParams += `&stock_level=${filters.stockLevel}`
    if (filters.expiryRange) {
      queryParams += `&expiry_start=${filters.expiryRange[0].format('YYYY-MM-DD')}`
      queryParams += `&expiry_end=${filters.expiryRange[1].format('YYYY-MM-DD')}`
    }
    
    api.get(`/pharmacy/medicines?${queryParams}`)
      .then(res => setMedicines(res.data.data))
      .catch(err => console.error(err))
  }

  const handleApplyFilters = () => {
    setFilterDrawerOpen(false)
    fetchMedicines()
  }

  const handleResetFilters = () => {
    setFilters({
      stockLevel: null,
      expiryRange: null
    })
  }

  const handleExport = () => {
    const exportColumns = [
      { header: 'Medicine Name', accessor: 'name' },
      { header: 'Generic Name', accessor: 'generic_name' },
      { header: 'Batch No', accessor: 'batch_no' },
      { header: 'Quantity', accessor: 'quantity' },
      { header: 'Price', accessor: 'price' },
      { header: 'Expiry Date', accessor: 'expiry_date' }
    ]
    exportToCSV(medicines, 'pharmacy_medicines.csv', exportColumns)
  }

  const columns = [
    {
      header: 'Medicine Name',
      accessor: 'name',
      sortable: true,
      render: (value) => <span style={{ fontWeight: 500 }}>{value}</span>,
    },
    {
      header: 'Generic Name',
      accessor: 'generic_name',
      sortable: true,
    },
    {
      header: 'Batch No',
      accessor: 'batch_no',
      sortable: true,
      width: '120px',
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      sortable: true,
      width: '100px',
      render: (value, record) => (
        <span style={{ 
          color: value <= record.reorder_level ? '#ff4d4f' : '#262626',
          fontWeight: value <= record.reorder_level ? 600 : 400,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {value}
          {value <= record.reorder_level && <AlertTriangle style={{ width: '14px', height: '14px' }} />}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      sortable: true,
      width: '100px',
      render: (value) => <span style={{ color: '#52c41a', fontWeight: 600 }}>₹{value}</span>,
    },
    {
      header: 'Expiry',
      accessor: 'expiry_date',
      sortable: true,
      width: '120px',
      render: (value) => <span>{new Date(value).toLocaleDateString()}</span>,
    },
  ]

  return (
    <PageLayout
      header={
        <>
          <PageTitleHeader
            title="Pharmacy"
            subtitle={`Total Medicines: ${medicines.length}`}
            showSearch={true}
            searchPlaceholder="Search Medicine"
            searchValue={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            searchSize="default"
            showFilter={true}
            onFilterClick={() => setFilterDrawerOpen(true)}
            activeFilterCount={countActiveFilters(filters)}
            actions={[
              {
                label: 'Export',
                type: 'default',
                onClick: handleExport
              },
              {
                label: 'Add Medicine',
                type: 'primary',
                icon: <PlusOutlined />,
                onClick: () => navigate('/pharmacy/add')
              }
            ]}
          />

          <FilterDrawer
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            title="Filter Medicines"
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          >
            <Form layout="vertical">
              <Form.Item label="Stock Level">
                <Select
                  placeholder="Select stock level"
                  value={filters.stockLevel}
                  onChange={(value) => setFilters({ ...filters, stockLevel: value })}
                  allowClear
                  options={[
                    { label: 'Low Stock', value: 'low' },
                    { label: 'In Stock', value: 'in_stock' },
                    { label: 'Out of Stock', value: 'out' }
                  ]}
                />
              </Form.Item>

              <Form.Item label="Expiry Date Range">
                <RangePicker
                  value={filters.expiryRange}
                  onChange={(dates) => setFilters({ ...filters, expiryRange: dates })}
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Form>
          </FilterDrawer>
        </>
      }
    >
      <CompactTable
        columns={columns}
        data={medicines}
        showCheckbox={true}
        showPagination={true}
        pageSize={10}
      />
    </PageLayout>
  )
}
