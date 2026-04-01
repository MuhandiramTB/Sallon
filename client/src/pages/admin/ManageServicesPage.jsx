import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Select from '../../ui/Select.jsx';
import Modal from '../../ui/Modal.jsx';
import Card from '../../ui/Card.jsx';
import EmptyState from '../../ui/EmptyState.jsx';
import { SkeletonPage } from '../../ui/Skeleton.jsx';

export default function ManageServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({ categoryId: '', name: '', description: '', durationMinutes: 30, price: 0, isPackage: false, packageServiceIds: [] });
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [s, c] = await Promise.all([api('/services'), api('/categories')]);
      setServices(s.data);
      setCategories(c.data);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const regularServices = services.filter((s) => !s.isPackage);

  const openCreate = (isPackage = false) => {
    setEditingService(null);
    setForm({ categoryId: categories[0]?.id || '', name: '', description: '', durationMinutes: 30, price: 0, isPackage, packageServiceIds: [] });
    setShowModal(true);
  };

  const openEdit = (svc) => {
    setEditingService(svc);
    setForm({
      categoryId: svc.categoryId, name: svc.name, description: svc.description || '',
      durationMinutes: svc.durationMinutes, price: svc.price,
      isPackage: !!svc.isPackage,
      packageServiceIds: svc.packageItems?.map((i) => i.id) || [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const body = {
      ...form,
      categoryId: Number(form.categoryId),
      durationMinutes: Number(form.durationMinutes),
      price: Number(form.price),
    };
    try {
      if (editingService) await api(`/services/${editingService.id}`, { method: 'PUT', body });
      else await api('/services', { method: 'POST', body });
      setShowModal(false);
      loadData();
    } catch (err) { setError(err.message); }
  };

  const toggleActive = async (svc) => {
    try { await api(`/services/${svc.id}`, { method: 'PUT', body: { isActive: !svc.isActive } }); loadData(); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try { await api(`/services/${id}`, { method: 'DELETE' }); loadData(); }
    catch (err) { alert(err.message); }
  };

  const togglePackageItem = (svcId) => {
    const ids = form.packageServiceIds.includes(svcId)
      ? form.packageServiceIds.filter((id) => id !== svcId)
      : [...form.packageServiceIds, svcId];
    setForm({ ...form, packageServiceIds: ids });
    // Auto-calculate duration
    const selected = regularServices.filter((s) => ids.includes(s.id));
    if (selected.length) {
      setForm((prev) => ({ ...prev, packageServiceIds: ids, durationMinutes: selected.reduce((sum, s) => sum + s.durationMinutes, 0) }));
    }
  };

  if (isLoading) return <SkeletonPage cards={4} />;

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-text-primary">Manage Services</h1>
        <div className="flex gap-2">
          <Button onClick={() => openCreate(false)} disabled={categories.length === 0}>+ Service</Button>
          <Button variant="secondary" onClick={() => openCreate(true)} disabled={regularServices.length === 0}>+ Package</Button>
        </div>
      </div>

      {categories.length === 0 && (
        <Card className="bg-amber-50 border border-amber-200 mb-4">
          <p className="text-amber-700 text-sm font-medium">Create categories first before adding services.</p>
        </Card>
      )}

      {services.length === 0 ? (
        <EmptyState icon="✂️" title="No services yet" description="Add your salon services with pricing." actionLabel="Add Service" onAction={() => openCreate(false)} />
      ) : (
        <div className="space-y-3">
          {services.map((svc) => (
            <Card key={svc.id} className={`transition-opacity ${!svc.isActive ? 'opacity-50' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-text-primary">{svc.name}</h3>
                    <span className="text-xs text-primary bg-primary-light px-2 py-0.5 rounded-full">{svc.categoryName}</span>
                    {svc.isPackage ? (
                      <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">Package</span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <span className="font-bold text-primary">Rs. {svc.price}</span>
                    <span>{svc.durationMinutes} min</span>
                  </div>
                  {svc.isPackage && svc.packageItems?.length > 0 && (
                    <p className="text-xs text-text-muted mt-1">
                      Includes: {svc.packageItems.map((i) => i.name).join(' + ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(svc)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full min-h-[36px] transition-colors ${svc.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {svc.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <Button variant="ghost" onClick={() => openEdit(svc)} className="text-sm">Edit</Button>
                  <Button variant="ghost" onClick={() => handleDelete(svc.id)} className="text-sm text-error hover:text-error">Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingService ? (form.isPackage ? 'Edit Package' : 'Edit Service') : (form.isPackage ? 'New Package' : 'New Service')}>
        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-error p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <Select label="Category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label={form.isPackage ? 'Package Name' : 'Service Name'} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={form.isPackage ? 'e.g. Groom Package' : 'e.g. Haircut'} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={form.isPackage ? 'e.g. Haircut + Beard Trim + Cleanup' : 'Optional description'} />

          {form.isPackage && regularServices.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">Select Services in Package</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-3">
                {regularServices.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer min-h-[36px]">
                    <input
                      type="checkbox"
                      checked={form.packageServiceIds.includes(s.id)}
                      onChange={() => togglePackageItem(s.id)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{s.name}</span>
                    <span className="text-xs text-text-muted ml-auto">Rs. {s.price} / {s.durationMinutes}min</span>
                  </label>
                ))}
              </div>
              {form.packageServiceIds.length > 0 && (
                <p className="text-xs text-text-muted mt-1">
                  Total duration: {form.durationMinutes} min | Set your own package price below
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input label="Duration (min)" type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} required />
            <Input label={form.isPackage ? 'Package Price (Rs.)' : 'Price (Rs.)'} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <Button type="submit" className="w-full">{editingService ? 'Update' : 'Create'} {form.isPackage ? 'Package' : 'Service'}</Button>
        </form>
      </Modal>
    </div>
  );
}
