import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { PlusOutlined } from '@ant-design/icons'
import { Select, DatePicker, Form } from 'antd'
import PageLayout from '../components/PageLayout'
import PageTitleHeader from '../components/PageTitleHeader'
import CompactTable from '../components/CompactTable'
import FilterDrawer from '../components/FilterDrawer'
import { countActiveFilters } from '../utils/filterHelpers'
import { exportToCSV } from '../utils/exportHelpers'
import api from '../services/api'

const { RangePicker } = DatePicker

export default function Inventory() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: null,
    warrantyRange: null
  })

  useEffect(() => {
    if (selectedHospital) {
      fetchItems()
    }
  }, [selectedHospital])

  const fetchItems = () => {
    let queryParams = `hospital_id=${selectedHospital.id}`
    if (search) queryParams += `&search=${search}`
    if (filters.category) queryParams += `&category=${filters.category}`
    if (filters.warrantyRange) {
      queryParams += `&warranty_start=${filters.warrantyRange[0].format('YYYY-MM-DD')}`
      queryParams += `&warranty_end=${filters.warrantyRange[1].format('YYYY-MM-DD')}`
    }
    
    api.get(`/inventory?${queryParams}`)
      .then(res => setItems(res.data.data))
      .catch(err => console.error(err))
  }

  const handleApplyFilters = () => {
    setFilterDrawerOpen(false)
    fetchItems()
  }

  const handleResetFilters = () => {
    setFilters({
      category: null,
      warrantyRange: null
    })
  }

  const handleExport = () => {
    const exportColumns = [
      { header: 'Item Name', accessor: 'item_name' },
      { header: 'Category', accessor: 'category' },
      { header: 'Quantity', accessor: 'quantity' },
      { header: 'Unit', accessor: 'unit' },
      { header: 'Purchase Date', accessor: 'purchase_date' },
      { header: 'Warranty Expiry', accessor: 'warranty_expiry' }
    ]
    exportToCSV(items, 'inventory.csv', exportColumns)
  }

  const columns = [
    {
      header: 'Item Name',
      accessor: 'item_name',
      sortable: true,
      render: (value) => <span style={{ fontWeight: 500 }}>{value}</span>,
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
      width: '150px',
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      sortable: true,
      width: '100px',
    },
    {
      header: 'Unit',
      accessor: 'unit',
      sortable: true,
      width: '100px',
    },
    {
      header: 'Purchase Date',
      accessor: 'purchase_date',
      sortable: true,
      width: '130px',
      render: (value) => <span>{value ? new Date(value).toLocaleDateString() : '-'}</span>,
    },
    {
      header: 'Warranty Expiry',
      accessor: 'warranty_expiry',
      sortable: true,
      width: '130px',
      render: (value) => <span>{value ? new Date(value).toLocaleDateString() : '-'}</span>,
    },
  ]

  return (
    <PageLayout
      header={
        <>
          <PageTitleHeader
            title="Inventory & Assets"
            subtitle={`Total Items: ${items.length}`}
            showSearch={true}
            searchPlaceholder="Search Item"
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
                label: 'Add Item',
                type: 'primary',
                icon: <PlusOutlined />,
                onClick: () => navigate('/inventory/add')
              }
            ]}
          />

          <FilterDrawer
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            title="Filter Items"
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          >
            <Form layout="vertical">
              <Form.Item label="Category">
                <Select
                  placeholder="Select category"
                  value={filters.category}
                  onChange={(value) => setFilters({ ...filters, category: value })}
                  allowClear
                  options={[
                    { label: 'Medical Equipment', value: 'medical_equipment' },
                    { label: 'Furniture', value: 'furniture' },
                    { label: 'Electronics', value: 'electronics' },
                    { label: 'Supplies', value: 'supplies' }
                  ]}
                />
              </Form.Item>

              <Form.Item label="Warranty Expiry Range">
                <RangePicker
                  value={filters.warrantyRange}
                  onChange={(dates) => setFilters({ ...filters, warrantyRange: dates })}
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
        data={items}
        showCheckbox={true}
        showPagination={true}
        pageSize={10}
      />
    </PageLayout>
  )
}
