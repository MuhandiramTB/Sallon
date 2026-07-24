import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({ categoryId: '', name: '', description: '', imageUrl: '', colors: [], durationMinutes: 30, price: 0, isPackage: false, packageServiceIds: [] });
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [isToggling, setIsToggling] = useState(false);
  const [toast, setToast] = useState('');

  const loadData = async () => {
    try {
      // Admin endpoint returns ALL services, including inactive ones.
      const [s, c] = await Promise.all([api('/services/admin/all'), api('/categories')]);
      setServices(s.data);
      setCategories(c.data);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const regularServices = services.filter((s) => !s.isPackage);

  const openCreate = (isPackage = false) => {
    setEditingService(null);
    setImageError('');
    setForm({ categoryId: categories[0]?.id || '', name: '', description: '', imageUrl: '', colors: [], durationMinutes: 30, price: 0, isPackage, packageServiceIds: [] });
    setShowModal(true);
  };

  const openEdit = (svc) => {
    setEditingService(svc);
    setImageError('');
    setForm({
      categoryId: svc.categoryId, name: svc.name, description: svc.description || '',
      imageUrl: svc.imageUrl || '',
      colors: Array.isArray(svc.colors) ? svc.colors : [],
      durationMinutes: svc.durationMinutes, price: svc.price,
      isPackage: !!svc.isPackage,
      packageServiceIds: svc.packageItems?.map((i) => i.id) || [],
    });
    setShowModal(true);
  };

  const handleImageFile = (file) => {
    setImageError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please pick an image file (PNG, JPG).');
      return;
    }
    if (file.size > 250 * 1024) {
      setImageError(`Image is too large (${Math.round(file.size / 1024)} KB). Max 250 KB — please compress first.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setForm((f) => ({ ...f, imageUrl: e.target.result }));
    reader.onerror = () => setImageError('Could not read the file.');
    reader.readAsDataURL(file);
  };

  // --- Color options (e.g. for hair coloring services) ---
  const addColor = () => setForm((f) => ({ ...f, colors: [...(f.colors || []), { name: '', hex: '#c9a96e' }] }));
  const updateColor = (idx, key, value) =>
    setForm((f) => ({ ...f, colors: f.colors.map((c, i) => (i === idx ? { ...c, [key]: value } : c)) }));
  const removeColor = (idx) =>
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const body = {
      ...form,
      categoryId: Number(form.categoryId),
      durationMinutes: Number(form.durationMinutes),
      price: Number(form.price),
      // Drop half-filled color rows (name required by the API).
      colors: (form.colors || []).filter((c) => c.name?.trim() && c.hex).map((c) => ({ name: c.name.trim(), hex: c.hex })),
    };
    try {
      if (editingService) await api(`/services/${editingService.id}`, { method: 'PUT', body });
      else await api('/services', { method: 'POST', body });
      setShowModal(false);
      loadData();
    } catch (err) { setError(err.message); }
  };

  const confirmToggle = async () => {
    if (!toggleTarget) return;
    setIsToggling(true);
    try {
      await api(`/services/${toggleTarget.id}`, { method: 'PUT', body: { isActive: !toggleTarget.isActive } });
      setToggleTarget(null);
      loadData();
    } catch (err) {
      setToggleTarget(null);
      setToast(err.message);
    } finally { setIsToggling(false); }
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
      <div className="flex items-center justify-between mb-6 gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex-shrink-0">Manage Services</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/services')}
            aria-label="Preview customer view"
            title="Preview customer view"
            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          <button
            onClick={() => openCreate(false)}
            disabled={categories.length === 0}
            aria-label="Add service"
            title="Add service"
            className="w-10 h-10 flex items-center justify-center bg-gradient-gold text-primary rounded-lg font-bold hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          </button>
          <button
            onClick={() => openCreate(true)}
            disabled={regularServices.length === 0}
            aria-label="Add package"
            title="Add package"
            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {/* package/box + plus */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => (
            <Card key={svc.id} className={`py-4 transition-opacity ${!svc.isActive ? 'opacity-50' : ''}`}>
              {svc.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-white/10 mb-3 -mt-1">
                  <img src={svc.imageUrl} alt={svc.name} className="w-full h-24 object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
              )}
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{svc.name || 'Unnamed Service'}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">{svc.categoryName || 'No category'}</span>
                    {!!svc.isPackage && (
                      <span className="text-xs font-semibold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">Package</span>
                    )}
                    {!svc.isActive && (
                      <span className="text-xs font-semibold text-white/50 bg-white/10 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-lg font-bold text-accent">Rs. {svc.price ?? 0}</span>
                <span className="text-white/70 text-sm">&middot; {svc.durationMinutes ?? '?'} min</span>
              </div>

              {!!svc.isPackage && svc.packageItems?.length > 0 && (
                <p className="text-xs text-white/60 mb-3 line-clamp-2">
                  <span className="text-white/40">Includes: </span>
                  {svc.packageItems.map((i) => i.name).join(' + ')}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-white/5">
                <button onClick={() => setToggleTarget(svc)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg min-h-[36px] transition-colors ${svc.isActive ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                  {svc.isActive ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => openEdit(svc)} className="text-xs font-medium bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/30 min-h-[36px] transition-colors">
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(svc)} className="text-xs font-medium bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30 min-h-[36px] transition-colors ml-auto">
                  Delete
                </button>
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

          {/* Service image */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1.5">Service Image</label>
            {form.imageUrl && (
              <div className="relative mb-2 rounded-lg overflow-hidden border border-white/10">
                <img src={form.imageUrl} alt="service" className="w-full h-32 object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                  className="absolute top-2 right-2 text-xs bg-black/60 text-red-300 hover:text-red-200 px-2 py-1 rounded">Remove</button>
              </div>
            )}
            <label className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/30 transition-colors cursor-pointer min-h-[40px]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {form.imageUrl ? 'Replace Image' : 'Upload Image'}
              <input type="file" accept="image/*" onChange={(e) => handleImageFile(e.target.files?.[0])} className="hidden" />
            </label>
            <p className="text-xs text-white/50 mt-1.5">PNG or JPG, max 250 KB. Wide (landscape) images look best on cards.</p>
            {imageError && <p className="text-red-400 text-xs mt-1.5">{imageError}</p>}
          </div>

          {/* Color options — for services like hair coloring */}
          {!form.isPackage && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-1.5">Color Options <span className="text-white/40 font-normal">(optional — e.g. hair coloring)</span></label>
              {form.colors?.length > 0 && (
                <div className="space-y-2 mb-2">
                  {form.colors.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={c.hex}
                        onChange={(e) => updateColor(idx, 'hex', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer flex-shrink-0"
                        title="Pick color"
                      />
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => updateColor(idx, 'name', e.target.value)}
                        placeholder="Color name (e.g. Red)"
                        className="flex-1 min-w-0 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-accent min-h-[40px]"
                      />
                      <button type="button" onClick={() => removeColor(idx)}
                        className="w-9 h-9 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg flex-shrink-0" title="Remove">✕</button>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={addColor}
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover font-medium">
                + Add color
              </button>
            </div>
          )}

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

      <ConfirmModal
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={confirmToggle}
        isLoading={isToggling}
        title={toggleTarget?.isActive ? 'Deactivate Service?' : 'Activate Service?'}
        message={
          toggleTarget
            ? toggleTarget.isActive
              ? `"${toggleTarget.name}" will be hidden from customers and can't be booked. You can reactivate it anytime.`
              : `"${toggleTarget.name}" will become visible to customers and available for booking.`
            : ''
        }
        confirmLabel={toggleTarget?.isActive ? 'Yes, Deactivate' : 'Yes, Activate'}
        cancelLabel="Cancel"
        variant="warning"
      />

      {toast && <Toast message={toast} type="error" onClose={() => setToast('')} />}
    </div>
  );
}
