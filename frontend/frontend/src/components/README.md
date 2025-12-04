# Reusable Page and Table Components

This directory contains reusable, component-based page layout, table, and filter components designed for consistent UI across the application.

## Layout Components

### 1. PageLayout
A layout wrapper that separates header from content, with the header outside the card.

**Usage:**
```jsx
import PageLayout from '../components/PageLayout'
import PageTitleHeader from '../components/PageTitleHeader'

<PageLayout
  header={
    <PageTitleHeader
      title="Policies"
      subtitle="All Policies: 78"
      actions={[...]}
    />
  }
>
  {/* Your content here */}
</PageLayout>
```

**Props:**
- `header` (Component): Header component to render outside card
- `children` (Component): Content to render inside card
- `showCard` (Boolean, default: true): Whether to wrap content in card
- `cardStyle` (Object): Additional styles for card
- `className` (String): Additional CSS classes

### 2. PageTitleHeader
A page header with title on left and action buttons on right.

**Usage:**
```jsx
<PageTitleHeader
  title="Policies"
  subtitle="All Policies: 78"
  actions={[
    {
      label: 'Export',
      icon: <DownloadOutlined />,
      type: 'default',
      onClick: () => console.log('Export')
    },
    {
      label: 'Add New',
      type: 'primary',
      onClick: () => navigate('/add')
    }
  ]}
>
  {/* Tabs, filters, etc. */}
</PageTitleHeader>
```

**Props:**
- `title` (String, required): Main page title
- `subtitle` (String): Subtitle or count text
- `actions` (Array): Action button configurations
  - `label` (String): Button text
  - `onClick` (Function): Click handler
  - `icon` (Component): Button icon
  - `type` (String): 'default' | 'primary'
  - `style` (Object): Additional styles
  - `disabled` (Boolean): Disabled state
- `children` (Component): Additional content (tabs, filters)
- `className` (String): Additional CSS classes

### 3. PageTabs
Tab navigation component with counts.

**Usage:**
```jsx
<PageTabs
  tabs={[
    { key: 'all', label: 'All policies', count: 78 },
    { key: 'active', label: 'Active', count: 46 },
    { key: 'expired', label: 'Expired', count: 28 }
  ]}
  activeKey={activeTab}
  onChange={setActiveTab}
/>
```

**Props:**
- `tabs` (Array, required): Tab configurations
  - `key` (String): Unique tab key
  - `label` (String): Tab label
  - `count` (Number): Optional count to display
- `onChange` (Function): Tab change handler
- `activeKey` (String): Currently active tab key
- `className` (String): Additional CSS classes

### 4. FilterDrawer
A side drawer component for displaying filter options.

**Usage:**
```jsx
import { useState } from 'react'
import { Select, DatePicker, Form } from 'antd'
import FilterDrawer from '../components/FilterDrawer'

const [filterOpen, setFilterOpen] = useState(false)
const [filters, setFilters] = useState({ status: null, date: null })

<FilterDrawer
  open={filterOpen}
  onClose={() => setFilterOpen(false)}
  title="Filter Patients"
  onApply={() => {
    setFilterOpen(false)
    // Apply filters logic
  }}
  onReset={() => setFilters({ status: null, date: null })}
>
  <Form layout="vertical">
    <Form.Item label="Status">
      <Select
        value={filters.status}
        onChange={(value) => setFilters({ ...filters, status: value })}
        options={[{ label: 'Active', value: 'active' }]}
      />
    </Form.Item>
    <Form.Item label="Date">
      <DatePicker
        value={filters.date}
        onChange={(date) => setFilters({ ...filters, date })}
      />
    </Form.Item>
  </Form>
</FilterDrawer>
```

**Props:**
- `open` (Boolean, required): Whether drawer is open
- `onClose` (Function, required): Close handler
- `title` (String, default: 'Filters'): Drawer title
- `children` (Component, required): Filter form content
- `onApply` (Function, required): Apply filters handler
- `onReset` (Function, required): Reset filters handler
- `width` (Number, default: 400): Drawer width in pixels

### 5. FilterBar
A horizontal filter bar with search, dropdowns, and date pickers (for inline filters).

**Usage:**
```jsx
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
      options: [{ label: 'Program A', value: 'a' }]
    },
    {
      type: 'dateRange',
      value: dateRange,
      onChange: setDateRange
    }
  ]}
  showExpandFilters={true}
  onExpandFilters={() => console.log('Expand')}
/>
```

**Props:**
- `searchValue` (String): Current search value
- `onSearchChange` (Function): Search change handler
- `searchPlaceholder` (String): Search placeholder
- `filters` (Array): Filter configurations
  - `type` (String): 'select' | 'dateRange'
  - `placeholder` (String | Array): Placeholder text
  - `value` (Any): Current value
  - `onChange` (Function): Change handler
  - `options` (Array): Options for select (type='select')
  - `style` (Object): Additional styles
- `showExpandFilters` (Boolean): Show expand button
- `onExpandFilters` (Function): Expand click handler
- `className` (String): Additional CSS classes

## Table Components

### 1. CompactTable
A feature-rich table component with sorting, row selection, and pagination.

**Features:**
- ✅ Row selection with checkboxes
- ✅ Column sorting (ascending/descending)
- ✅ Pagination with page navigation
- ✅ Hover effects on rows
- ✅ Responsive design with horizontal scroll
- ✅ Custom cell rendering
- ✅ Empty state handling

**Usage:**
```jsx
import CompactTable from '../components/CompactTable'

const columns = [
  {
    header: 'Action',
    accessor: 'action',
    sortable: false,
    width: '60px',
    render: (value, row) => (
      <Button icon={<EyeOutlined />} />
    ),
  },
  {
    header: 'Name',
    accessor: 'name',
    sortable: true,
    render: (value) => <span>{value}</span>,
  },
  {
    header: 'Status',
    accessor: 'status',
    sortable: true,
    render: (value) => <Tag color="success">{value}</Tag>,
  },
]

<CompactTable
  columns={columns}
  data={data}
  showCheckbox={true}
  showPagination={true}
  pageSize={10}
  onRowSelect={(selectedRows) => console.log(selectedRows)}
/>
```

**Props:**
- `columns` (Array, required): Column definitions
  - `header` (String): Column header text
  - `accessor` (String): Key to access data in row object
  - `sortable` (Boolean): Enable sorting for this column
  - `width` (String): Column width (e.g., '60px', '200px')
  - `render` (Function): Custom render function (value, row) => ReactNode
- `data` (Array, required): Array of data objects
- `showCheckbox` (Boolean, default: true): Show checkbox column
- `showPagination` (Boolean, default: true): Show pagination
- `pageSize` (Number, default: 10): Rows per page
- `onRowSelect` (Function): Callback when rows are selected
- `className` (String): Additional CSS classes

### 2. CompactSearch
A compact search input component with icon and clear functionality.

**Usage:**
```jsx
import CompactSearch from '../components/CompactSearch'

const [search, setSearch] = useState('')

<CompactSearch
  placeholder="Search patients..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  size="small"
/>
```

**Props:**
- `placeholder` (String, default: 'Search...'): Placeholder text
- `value` (String): Current search value
- `onChange` (Function): Change handler
- `size` (String, default: 'small'): Size - 'small' (200px), 'default' (250px), 'large' (300px)
- `style` (Object): Additional inline styles
- `className` (String): Additional CSS classes

### 3. TablePageHeader
A complete page header component combining title, icon, search, and action button.

**Usage:**
```jsx
import TablePageHeader from '../components/TablePageHeader'
import { UserOutlined } from '@ant-design/icons'

<TablePageHeader
  title="Patients"
  icon={UserOutlined}
  onAdd={() => navigate('/patients/add')}
  addButtonText="Add"
  searchPlaceholder="Search Patient"
  searchValue={search}
  onSearchChange={(e) => setSearch(e.target.value)}
  searchSize="small"
/>
```

**Props:**
- `title` (String, required): Page title
- `icon` (Component): Icon component (from @ant-design/icons)
- `onAdd` (Function): Add button click handler
- `addButtonText` (String, default: 'Add'): Add button text
- `showAddButton` (Boolean, default: true): Show add button
- `showSearch` (Boolean, default: true): Show search input
- `searchPlaceholder` (String): Search placeholder
- `searchValue` (String): Current search value
- `onSearchChange` (Function): Search change handler
- `searchSize` (String, default: 'small'): Search input size
- `extra` (Component): Additional components to render
- `className` (String): Additional CSS classes

## Design System

### Colors
- Primary: `#1cb2b8` (Teal/Cyan)
- Table Header Background: `linear-gradient(to bottom, #e8f4f5 0%, #dceef0 100%)`
- Selected Row: `#e6f7ff`
- Hover Row: `#fafafa`
- Border: `#f0f0f0`, `#d0e5e7`
- Text: `#262626` (primary), `#595959` (secondary), `#8c8c8c` (tertiary)

### Typography
- Header Font Size: 13px
- Body Font Size: 13px
- Small Text: 12px
- Font Weight: 500 (medium), 600 (semi-bold)

### Spacing
- Table Cell Padding: 10px 12px
- Header Padding: 10px 12px
- Border Radius: 6px (inputs), 8px (containers), 4px (buttons)

## Complete Page Examples

### Example 1: Simple Page with Table
```jsx
import { useState } from 'react'
import { Button, Tag } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import PageLayout from '../components/PageLayout'
import PageTitleHeader from '../components/PageTitleHeader'
import CompactTable from '../components/CompactTable'
import CompactSearch from '../components/CompactSearch'

export default function SimplePage() {
  const [search, setSearch] = useState('')
  const [data, setData] = useState([])

  return (
    <PageLayout
      header={
        <PageTitleHeader
          title="Patients"
          subtitle={`All Patients: ${data.length}`}
          actions={[
            {
              label: 'Export',
              onClick: () => console.log('Export')
            },
            {
              label: 'Add',
              type: 'primary',
              onClick: () => console.log('Add')
            }
          ]}
        >
          <div style={{ marginTop: '12px' }}>
            <CompactSearch
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </PageTitleHeader>
      }
    >
      <CompactTable
        columns={columns}
        data={data}
      />
    </PageLayout>
  )
}
```

### Example 2: Page with Filter Drawer
```jsx
import { useState, useEffect } from 'react'
import { Select, DatePicker, Form } from 'antd'
import PageLayout from '../components/PageLayout'
import PageTitleHeader from '../components/PageTitleHeader'
import CompactTable from '../components/CompactTable'
import FilterDrawer from '../components/FilterDrawer'

export default function MyPage() {
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: null,
    dateRange: null
  })

  return (
    <PageLayout
      header={
        <>
          <PageTitleHeader
            title="My Page"
            subtitle="Total: 100"
            showSearch={true}
            searchValue={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            showFilter={true}
            onFilterClick={() => setFilterOpen(true)}
            actions={[
              { label: 'Export', onClick: () => {} },
              { label: 'Add', type: 'primary', onClick: () => {} }
            ]}
          />

          <FilterDrawer
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            title="Filters"
            onApply={() => {
              setFilterOpen(false)
              // Apply filters
            }}
            onReset={() => setFilters({ status: null, dateRange: null })}
          >
            <Form layout="vertical">
              <Form.Item label="Status">
                <Select
                  value={filters.status}
                  onChange={(v) => setFilters({ ...filters, status: v })}
                />
              </Form.Item>
            </Form>
          </FilterDrawer>
        </>
      }
    >
      <CompactTable columns={columns} data={data} />
    </PageLayout>
  )
}
```

### Example 3: Advanced Page with Tabs and Filters
See `frontend/src/pages/PoliciesExample.jsx` for a complete example matching the Policies page design with:
- Title and subtitle outside card
- Multiple action buttons on the right
- Tabs with counts
- Filter bar with search, dropdowns, and date range
- Expand filters button
- Table with all features

## Migration Guide

### From CustomTable to CompactTable

**Before:**
```jsx
<CustomTable
  className="custom-compact-table"
  columns={columns}
  data={patients}
/>
```

**After:**
```jsx
<CompactTable
  columns={columns}
  data={patients}
  showCheckbox={true}
  showPagination={true}
  pageSize={10}
/>
```

### From PageHeader to TablePageHeader

**Before:**
```jsx
<PageHeader
  title="Patients"
  icon={UserOutlined}
  onAdd={() => navigate('/add')}
  searchValue={search}
  onSearchChange={(e) => setSearch(e.target.value)}
  className="small-search"
/>
```

**After:**
```jsx
<TablePageHeader
  title="Patients"
  icon={UserOutlined}
  onAdd={() => navigate('/add')}
  searchValue={search}
  onSearchChange={(e) => setSearch(e.target.value)}
  searchSize="small"
/>
```