import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Select from '../../ui/Select.jsx';
import Modal from '../../ui/Modal.jsx';

export default function ManageServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({ categoryId: '', name: '', description: '', durationMinutes: 30, price: 0 });
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        api('/services'),
        api('/categories'),
      ]);
      setServices(servicesRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setEditingService(null);
    setForm({ categoryId: categories[0]?.id || '', name: '', description: '', durationMinutes: 30, price: 0 });
    setShowModal(true);
  };

  const openEdit = (svc) => {
    setEditingService(svc);
    setForm({ categoryId: svc.categoryId, name: svc.name, description: svc.description || '', durationMinutes: svc.durationMinutes, price: svc.price });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const body = { ...form, categoryId: Number(form.categoryId), durationMinutes: Number(form.durationMinutes), price: Number(form.price) };
    try {
      if (editingService) {
        await api(`/services/${editingService.id}`, { method: 'PUT', body });
      } else {
        await api('/services', { method: 'POST', body });
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (svc) => {
    try {
      await api(`/services/${svc.id}`, { method: 'PUT', body: { isActive: !svc.isActive } });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await api(`/services/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Services</h2>
        <Button onClick={openCreate} disabled={categories.length === 0}>Add Service</Button>
      </div>

      {categories.length === 0 && (
        <p className="text-amber-600 bg-amber-50 p-4 rounded mb-4">Create categories first before adding services.</p>
      )}

      {services.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No services yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Service</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600 hidden sm:table-cell">Category</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Duration</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Price</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-right p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc.id} className={`border-t ${!svc.isActive ? 'opacity-50' : ''}`}>
                  <td className="p-4 font-medium">{svc.name}</td>
                  <td className="p-4 text-gray-500 hidden sm:table-cell">{svc.categoryName}</td>
                  <td className="p-4 text-gray-500">{svc.durationMinutes} min</td>
                  <td className="p-4 text-gray-500">Rs. {svc.price}</td>
                  <td className="p-4">
                    <button onClick={() => toggleActive(svc)} className={`text-sm px-2 py-1 rounded min-h-[44px] ${svc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {svc.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(svc)} className="text-indigo-600 hover:underline mr-4 min-h-[44px]">Edit</button>
                    <button onClick={() => handleDelete(svc.id)} className="text-red-600 hover:underline min-h-[44px]">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingService ? 'Edit Service' : 'New Service'}>
        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
          <Select label="Category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label="Service Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Duration (minutes)" type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} required />
          <Input label="Price (Rs.)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <Button type="submit" className="w-full">{editingService ? 'Update' : 'Create'}</Button>
        </form>
      </Modal>
    </div>
  );
}
