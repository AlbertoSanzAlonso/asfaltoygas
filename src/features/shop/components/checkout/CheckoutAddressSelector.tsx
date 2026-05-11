import React from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import type { Address } from '@/types';

interface CheckoutAddressSelectorProps {
  addresses: Address[];
  selectedAddressId: number | 'new';
  onSelect: (id: number | 'new') => void;
  isChanging: boolean;
  setIsChanging: (val: boolean) => void;
}

export const CheckoutAddressSelector: React.FC<CheckoutAddressSelectorProps> = ({
  addresses,
  selectedAddressId,
  onSelect,
  isChanging,
  setIsChanging
}) => {
  const selectedAddress = addresses.find(a => a.shipping_address_id === selectedAddressId);

  return (
    <section className="mb-12">
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-xs font-black tracking-[0.4em] uppercase text-primary">Dirección de Envío</h3>
        <button 
          type="button"
          onClick={() => setIsChanging(!isChanging)}
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4"
        >
          {isChanging ? 'Cancelar' : 'Cambiar Dirección'}
        </button>
      </div>

      {isChanging ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {addresses.map((addr) => (
            <div 
              key={addr.shipping_address_id}
              onClick={() => {
                onSelect(addr.shipping_address_id!);
                setIsChanging(false);
              }}
              className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                selectedAddressId === addr.shipping_address_id ? 'bg-primary/5 border-primary shadow-lg' : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest">{addr.type}</span>
                {selectedAddressId === addr.shipping_address_id && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-[11px] text-secondary/60">{addr.street}</p>
              <p className="text-[11px] text-secondary/40 uppercase tracking-tighter mt-1">{addr.zip} {addr.city} ({addr.province})</p>
            </div>
          ))}
          <div 
            onClick={() => {
              onSelect('new');
              setIsChanging(false);
            }} 
            className={`p-6 rounded-2xl border border-dashed cursor-pointer transition-all flex items-center justify-center gap-3 ${
              selectedAddressId === 'new' ? 'bg-primary/5 border-primary text-primary' : 'bg-transparent border-white/10 text-gray-500 hover:border-white/30'
            }`}
          >
            <Plus className="w-4 h-4" /> 
            <span className="text-[10px] font-black uppercase tracking-widest">Nueva Dirección</span>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white/5 border border-white/10 rounded-4xl flex items-center justify-between group">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-primary/10 text-primary rounded-full">
                {selectedAddressId === 'new' ? 'Nueva Dirección' : selectedAddress?.type}
              </span>
              {selectedAddress?.isDefault && (
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 italic">(Principal)</span>
              )}
            </div>
            {selectedAddressId === 'new' ? (
              <p className="text-sm font-medium text-gray-400">Introduce los datos abajo</p>
            ) : (
              <>
                <p className="text-base font-bold">{selectedAddress?.street}</p>
                <p className="text-xs text-gray-500 font-medium">
                  {selectedAddress?.zip} {selectedAddress?.city}, {selectedAddress?.province}
                </p>
              </>
            )}
          </div>
          <CheckCircle2 className="w-6 h-6 text-primary opacity-50" />
        </div>
      )}
    </section>
  );
};
