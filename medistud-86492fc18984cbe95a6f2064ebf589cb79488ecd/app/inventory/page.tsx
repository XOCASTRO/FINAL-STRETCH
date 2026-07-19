'use client'

import { useState } from 'react'
import { Plus, AlertTriangle, Edit2, Trash2 } from 'lucide-react'
import { Sidebar } from '../components/sidebar'
import { ProtectedRoute } from '../components/protected-route'
import { useData } from '../lib/data-context'

function InventoryContent() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useData()
  const [itemType, setItemType] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'MEDICINE' as 'MEDICINE' | 'EQUIPMENT' | 'SUPPLY',
    quantity: '',
    unit: '',
    min_stock: '',
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filtered =
    itemType === 'ALL' ? inventory : inventory.filter((item) => item.category === itemType)

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingId(item.id)
      setFormData({
        name: item.name,
        category: item.category,
        quantity: String(item.quantity),
        unit: item.unit,
        min_stock: String(item.min_stock),
      })
    } else {
      setEditingId(null)
      setFormData({ name: '', category: 'MEDICINE', quantity: '', unit: '', min_stock: '' })
    }
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.quantity || !formData.unit || !formData.min_stock) {
      alert('Please fill all fields')
      return
    }

    if (editingId) {
      updateInventoryItem(editingId, {
        name: formData.name,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        min_stock: Number(formData.min_stock),
      })
    } else {
      addInventoryItem({
        name: formData.name,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        min_stock: Number(formData.min_stock),
      })
    }

    setShowModal(false)
    setFormData({ name: '', category: 'MEDICINE', quantity: '', unit: '', min_stock: '' })
  }

  const handleDelete = (id: string) => {
    deleteInventoryItem(id)
    setDeleteConfirm(null)
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-4">
            {['ALL', 'MEDICINE', 'EQUIPMENT', 'SUPPLY'].map((type) => (
              <button
                key={type}
                onClick={() => setItemType(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  itemType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No inventory items found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Unit</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Min Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium">{item.name}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">{item.quantity}</td>
                    <td className="px-6 py-3 text-sm">{item.unit}</td>
                    <td className="px-6 py-3 text-sm">{item.min_stock}</td>
                    <td className="px-6 py-3 text-sm">
                      {item.quantity <= item.min_stock ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle size={16} />
                          Low Stock
                        </div>
                      ) : (
                        <span className="text-green-600">In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm flex gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={18} />
                      </button>
                      {deleteConfirm === item.id ? (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Item' : 'Add New Item'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as 'MEDICINE' | 'EQUIPMENT' | 'SUPPLY',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="MEDICINE">Medicine</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="SUPPLY">Supply</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g., tablets, boxes, units"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock *</label>
                <input
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Add'} Item
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  )
}

export default function InventoryPage() {
  return (
    <ProtectedRoute>
      <InventoryContent />
    </ProtectedRoute>
  )
}
