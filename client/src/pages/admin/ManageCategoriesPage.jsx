import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import Button from '../../ui/Button.jsx';
import Input from '../../ui/Input.jsx';
import Modal from '../../ui/Modal.jsx';
import Card from '../../ui/Card.jsx';
import EmptyState from '../../ui/EmptyState.jsx';
import ConfirmModal from '../../ui/ConfirmModal.jsx';
import { SkeletonPage } from '../../ui/Skeleton.jsx';

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', displayOrder: 0 });
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    try { const res = await api('/categories'); setCategories(res.data); }
    catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadCategories(); }, []);

  const openCreate = () => { setEditingCategory(null); setForm({ name: '', displayOrder: categories.length }); setShowModal(true); };
  const openEdit = (cat) => { setEditingCategory(cat); setForm({ name: cat.name, displayOrder: cat.displayOrder }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingCategory) await api(`/categories/${editingCategory.id}`, { method: 'PUT', body: form });
      else await api('/categories', { method: 'POST', body: form });
      setShowModal(false);
      loadCategories();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api(`/categories/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      setDeleteTarget(null);
      alert(err.message);
    } finally { setIsDeleting(false); }
  };

  if (isLoading) return <SkeletonPage cards={3} />;

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Manage Categories</h1>
        <Button onClick={openCreate}>+ Add Category</Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon="📁" title="No categories yet" description="Create your first category to organize services." actionLabel="Create Category" onAction={openCreate} />
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="flex items-center justify-between py-4">
              <div>
                <span className="font-medium text-text-primary">{cat.name}</span>
                <span className="text-text-muted text-sm ml-3">Order: {cat.displayOrder}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => openEdit(cat)} className="text-sm">Edit</Button>
                <Button variant="ghost" onClick={() => setDeleteTarget(cat)} className="text-sm text-error hover:text-error">Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCategory ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-error p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <Input label="Category Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Boys, Ladies, Spa" required />
          <Input label="Display Order" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} />
          <Button type="submit" className="w-full">{editingCategory ? 'Update Category' : 'Create Category'}</Button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Category?"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep It"
        variant="danger"
      />
    </div>
  );
}
