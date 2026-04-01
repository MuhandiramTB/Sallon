import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Modal from '../../ui/Modal.jsx';

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', displayOrder: 0 });
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      const res = await api('/categories');
      setCategories(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setForm({ name: '', displayOrder: categories.length });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingCategory(cat);
    setForm({ name: cat.name, displayOrder: cat.displayOrder });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingCategory) {
        await api(`/categories/${editingCategory.id}`, { method: 'PUT', body: form });
      } else {
        await api('/categories', { method: 'POST', body: form });
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api(`/categories/${id}`, { method: 'DELETE' });
      loadCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Categories</h2>
        <Button onClick={openCreate}>Add Category</Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No categories yet. Create your first one!</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Order</th>
                <th className="text-right p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t">
                  <td className="p-4 font-medium">{cat.name}</td>
                  <td className="p-4 text-gray-500">{cat.displayOrder}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(cat)} className="text-indigo-600 hover:underline mr-4 min-h-[44px]">Edit</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:underline min-h-[44px]">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCategory ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
          <Input label="Category Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Display Order" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} />
          <Button type="submit" className="w-full">{editingCategory ? 'Update' : 'Create'}</Button>
        </form>
      </Modal>
    </div>
  );
}
