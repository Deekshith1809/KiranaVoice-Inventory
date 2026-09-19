import React, { useState, useEffect } from 'react';
import { X, Check, Package, Plus } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const AddProductModal = ({ isOpen, onClose, initialData = null }) => {
  const { addProduct, editProduct, settings } = useInventory();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Grains & Pulses',
    unit: 'Bags',
    quantity: '',
    price: '',
    reorderLevel: '10'
  });

  const [customUnitInput, setCustomUnitInput] = useState('');
  const [showCustomUnit, setShowCustomUnit] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        unit: initialData.unit,
        quantity: initialData.quantity,
        price: initialData.price,
        reorderLevel: initialData.reorderLevel
      });
    } else {
      setFormData({
        name: '',
        category: 'Grains & Pulses',
        unit: 'Bags',
        quantity: '',
        price: '',
        reorderLevel: '10'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    let finalUnit = formData.unit;
    if (showCustomUnit && customUnitInput) {
      finalUnit = customUnitInput;
    }

    if (initialData) {
      editProduct(initialData.id, {
        name: formData.name,
        category: formData.category,
        unit: finalUnit,
        quantity: Number(formData.quantity) || 0,
        price: Number(formData.price) || 0,
        reorderLevel: Number(formData.reorderLevel) || 5
      });
    } else {
      addProduct({
        name: formData.name,
        category: formData.category,
        unit: finalUnit,
        quantity: Number(formData.quantity) || 0,
        price: Number(formData.price) || 0,
        reorderLevel: Number(formData.reorderLevel) || 5
      });
    }

    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content animate-slide-up">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-icon">
            <Package size={22} />
          </div>
          <h2>{initialData ? 'Edit Product' : 'Add New Product'}</h2>
          <p>Configure item details and stock parameters</p>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Basmati Rice, Sunflower Oil..."
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Grains & Pulses">Grains & Pulses</option>
                <option value="Groceries">Groceries</option>
                <option value="Snacks & Bakery">Snacks & Bakery</option>
                <option value="Dairy">Dairy</option>
                <option value="Edible Oils">Edible Oils</option>
                <option value="Beverages">Beverages</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="form-group">
              <label>Trade Unit</label>
              {!showCustomUnit ? (
                <div className="unit-select-wrapper">
                  <select
                    value={formData.unit}
                    onChange={e => {
                      if (e.target.value === 'CUSTOM') {
                        setShowCustomUnit(true);
                      } else {
                        setFormData({ ...formData, unit: e.target.value });
                      }
                    }}
                  >
                    {settings.customUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                    <option value="CUSTOM">+ Add Custom Unit</option>
                  </select>
                </div>
              ) : (
                <div className="custom-unit-input">
                  <input
                    type="text"
                    placeholder="Enter unit name..."
                    value={customUnitInput}
                    onChange={e => setCustomUnitInput(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowCustomUnit(false)}>Cancel</button>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Opening Quantity</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Unit Price (₹)</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="₹ 0.00"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reorder Alert Threshold Level</label>
            <input
              type="number"
              min="0"
              placeholder="Minimum count to trigger alert"
              value={formData.reorderLevel}
              onChange={e => setFormData({ ...formData, reorderLevel: e.target.value })}
            />
            <span className="field-hint">Triggers low-stock warning when inventory drops below this number.</span>
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-btn">
              <Check size={18} />
              <span>{initialData ? 'Save Changes' : 'Save Product'}</span>
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1rem;
        }

        .modal-content {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          width: 100%;
          max-width: 500px;
          padding: 1.75rem;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .modal-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(99, 102, 241, 0.2);
          color: #818cf8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .modal-header p {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .product-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        input, select {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.7rem 0.85rem;
          border-radius: 12px;
          font-size: 0.9rem;
        }

        select option {
          background: #1e293b;
          color: white;
        }

        .custom-unit-input {
          display: flex;
          gap: 0.5rem;
        }

        .custom-unit-input button {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0 0.5rem;
          border-radius: 8px;
          font-size: 0.75rem;
        }

        .field-hint {
          font-size: 0.7rem;
          color: #64748b;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .save-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #6366f1;
          color: white;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
