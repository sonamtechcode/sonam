import { useState } from 'react'
import { Button, Tag } from 'antd'
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import PageLayout from '../components/PageLayout'
import PageTitleHeader from '../components/PageTitleHeader'
import PageTabs from '../components/PageTabs'
import FilterBar from '../components/FilterBar'
import CompactTable from '../components/CompactTable'

export default function PoliciesExample() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [dateRange, setDateRange] = useState(null)

  const handleViewPolicy = (policyId) => {
    console.log('Viewing policy:', policyId)
    // You can navigate to a detail page or open a modal here
    alert(`Viewing policy details for: ${policyId}`)
  }

  // Mock data
  const policies = [
    {
      id: 1,
      patient_id: 'C1111114',
      policy_suffix: '000',
      status: 'Active',
      plan_name: 'Plan S',
      name: 'KINGSTON MEDICAL CLINIC PTE. LTD.',
      created_at: '2025-01-01',
      updated_at: '2025-12-31'
    },
    {
      id: 2,
      patient_id: 'C1111113',
      policy_suffix: '000',
      status: 'Active',
      plan_name: 'Plan S',
      name: 'CHENG XIANG CONSTRUCTION PTE. LTD.',
      created_at: '2025-01-01',
      updated_at: '2025-12-31'
    },
    {
      id: 3,
      patient_id: 'C1111112',
      policy_suffix: '000',
      status: 'Active',
      plan_name: 'Plan S',
      name: 'KRAFTW5RKZ PTE. LTD.',
      created_at: '2025-01-01',
      updated_at: '2025-12-31'
    },
    {
      id: 4,
      patient_id: 'C1111111',
      policy_suffix: '000',
      status: 'Active',
      plan_name: 'Plan S',
      name: 'GLOBAL SCHOOL OF TECHNOLOGY & MANAGEMENT PTE. LTD.',
      created_at: '2025-01-01',
      updated_at: '2025-12-31'
    },
    {
      id: 5,
      patient_id: '2025-A5101684-HHI-T115',
      policy_suffix: '000',
      status: 'Active',
      plan_name: 'OCBC H',
      name: 'L-SQUARE CONSTRUCTION PTE. LTD.',
      created_at: '2025-01-01',
      updated_at: '2025-12-31'
    },
  ]

  const tabs = [
    { key: 'all', label: 'All policies', count: 78 },
    { key: 'active', label: 'Active', count: 46 },
    { key: 'expired', label: 'Expired', count: 28 },
    { key: 'opted_out', label: 'Opted Out', count: 4 },
  ]

  const programOptions = [
    { label: 'All programs', value: null },
    { label: 'Program A', value: 'a' },
    { label: 'Program B', value: 'b' },
  ]

  const categoryOptions = [
    { label: 'All Categories', value: null },
    { label: 'Category 1', value: '1' },
    { label: 'Category 2', value: '2' },
  ]

  const columns = [
    {
      header: 'Action',
      accessor: 'action',
      sortable: false,
      width: '60px',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined style={{ fontSize: '14px', color: '#1cb2b8' }} />}
          onClick={() => handleViewPolicy(record.patient_id)}
          style={{ padding: 0 }}
        />
      ),
    },
    {
      header: 'Policy No',
      accessor: 'patient_id',
      sortable: true,
    },
    {
      header: 'Policy Suffix',
      accessor: 'policy_suffix',
      sortable: true,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (value) => (
        <Tag color="success" style={{ fontSize: '12px' }}>
          {value}
        </Tag>
      ),
    },
    {
      header: 'Plan Name',
      accessor: 'plan_name',
      sortable: true,
    },
    {
      header: 'Company Name',
      accessor: 'name',
      sortable: true,
    },
    {
      header: 'Risk Inception Date',
      accessor: 'created_at',
      sortable: true,
      render: (value) => {
        const date = new Date(value)
        return <span>{date.toLocaleDateString('en-CA')}</span>
      },
    },
    {
      header: 'Risk Expiry Date',
      accessor: 'updated_at',
      sortable: true,
      render: (value) => {
        const date = new Date(value)
        return <span>{date.toLocaleDateString('en-CA')}</span>
      },
    },
  ]

  return (
    <PageLayout
      header={
        <PageTitleHeader
          title="Policies"
          subtitle={`All Policies: ${policies.length}`}
          actions={[
            {
              label: 'Export',
              icon: <DownloadOutlined />,
              type: 'default',
              onClick: () => console.log('Export')
            },
            {
              label: 'Clear All Filters',
              type: 'default',
              onClick: () => {
                setSearch('')
                setSelectedProgram(null)
                setSelectedCategory(null)
                setDateRange(null)
              }
            },
            {
              label: 'Opt-Out / Cancellation (0)',
              type: 'primary',
              onClick: () => console.log('Opt-Out')
            }
          ]}
        >
          {/* Tabs */}
          <PageTabs
            tabs={tabs}
            activeKey={activeTab}
            onChange={setActiveTab}
          />

          {/* Filters */}
          <FilterBar
            searchValue={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            searchPlaceholder="Search..."
            filters={[
              {
                type: 'select',
                placeholder: 'All programs',
                value: selectedProgram,
                onChange: setSelectedProgram,
                options: programOptions
              },
              {
                type: 'dateRange',
                placeholder: ['Select policy date range', ''],
                value: dateRange,
                onChange: setDateRange
              },
              {
                type: 'select',
                placeholder: 'All Categories',
                value: selectedCategory,
                onChange: setSelectedCategory,
                options: categoryOptions
              }
            ]}
            showExpandFilters={true}
            onExpandFilters={() => console.log('Expand filters')}
          />
        </PageTitleHeader>
      }
    >
      <CompactTable
        columns={columns}
        data={policies}
        showCheckbox={true}
        showPagination={true}
        pageSize={10}
      />
    </PageLayout>
  )
}