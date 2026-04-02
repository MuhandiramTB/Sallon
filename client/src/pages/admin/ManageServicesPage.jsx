import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Select from '../../ui/Select.jsx';
import Modal from '../../ui/Modal.jsx';
import Card from '../../ui/Card.jsx';
import EmptyState from '../../ui/EmptyState.jsx';
import ConfirmModal from '../../ui/ConfirmModal.jsx';
import Toast from '../../ui/Toast.jsx';
import { SkeletonPage } from '../../ui/Skeleton.jsx';

export default function ManageServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({ categoryId: '', name: '', description: '', durationMinutes: 30, price: 0, isPackage: false, packageServiceIds: [] });
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState('');

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
    catch (err) { setToast(err.message); }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try { await api(`/services/${deleteTarget.id}`, { method: 'DELETE' }); setDeleteTarget(null); loadData(); }
    catch (err) { setDeleteTarget(null); setToast(err.message); }
    finally { setIsDeleting(false); }
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
        <h1 className="text-2xl font-bold text-white">Manage Services</h1>
        <div className="flex gap-2">
          <Button onClick={() => openCreate(false)} disabled={categories.length === 0}>+ Service</Button>
          <Button variant="secondary" onClick={() => openCreate(true)} disabled={regularServices.length === 0}>+ Package</Button>
        </div>
      </div>

      {categories.length === 0 && (
        <Card className="bg-amber-500/10 border border-amber-500/20 mb-4">
          <p className="text-amber-400 text-sm font-medium">Create categories first before adding services.</p>
        </Card>
      )}

      {services.length === 0 ? (
        <EmptyState icon="✂️" title="No services yet" description="Add your salon services with pricing." actionLabel="Add Service" onAction={() => openCreate(false)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((svc) => (
            <Card key={svc.id} className={`transition-opacity ${!svc.isActive ? 'opacity-50' : ''}`}>
              <div className="flex flex-col gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-white">{svc.name}</h3>
                    <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">{svc.categoryName}</span>
                    {svc.isPackage ? (
                      <span className="text-xs font-semibold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">Package</span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 text-sm mb-2">
                    <span className="font-bold text-accent">Rs. {svc.price}</span>
                    <span className="text-white/70">{svc.durationMinutes} min</span>
                  </div>
                  {svc.isPackage && svc.packageItems?.length > 0 && (
                    <p className="text-xs text-white/60 mb-2">
                      Includes: {svc.packageItems.map((i) => i.name).join(' + ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => toggleActive(svc)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full min-h-[36px] transition-colors ${svc.isActive ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                    {svc.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => openEdit(svc)} className="text-xs font-medium bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/30 min-h-[36px] transition-colors">
                    Edit
                  </button>
                  <button onClick={() => setDeleteTarget(svc)} className="text-xs font-medium bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30 min-h-[36px] transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingService ? (form.isPackage ? 'Edit Package' : 'Edit Service') : (form.isPackage ? 'New Package' : 'New Service')}>
        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <Select label="Category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label={form.isPackage ? 'Package Name' : 'Service Name'} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={form.isPackage ? 'e.g. Groom Package' : 'e.g. Haircut'} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={form.isPackage ? 'e.g. Haircut + Beard Trim + Cleanup' : 'Optional description'} />

          {form.isPackage && regularServices.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">Select Services in Package</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-white/10 rounded-lg p-3">
                {regularServices.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer min-h-[36px]">
                    <input
                      type="checkbox"
                      checked={form.packageServiceIds.includes(s.id)}
                      onChange={() => togglePackageItem(s.id)}
                      className="w-4 h-4 rounded border-white/10 text-accent focus:ring-accent/50"
                    />
                    <span className="text-sm text-white/80">{s.name}</span>
                    <span className="text-xs text-white/60 ml-auto">Rs. {s.price} / {s.durationMinutes}min</span>
                  </label>
                ))}
              </div>
              {form.packageServiceIds.length > 0 && (
                <p className="text-xs text-white/60 mt-1">
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

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={deleteTarget?.isPackage ? 'Delete Package?' : 'Delete Service?'}
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep It"
        variant="danger"
      />

      {toast && <Toast message={toast} type="error" onClose={() => setToast('')} />}
    </div>
  );
}
