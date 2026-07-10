import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { supabase } from "@/lib/supabase";
import { BRAND } from '@/lib/brand';
// Eliminamos Xenova/Transformers para usar OpenAI directamente (más preciso)
const getQueryEmbedding = async (text: string): Promise<number[]> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'embed', input: text }),
  });

  if (!response.ok) throw new Error('Embedding Error');
  const data = await response.json();
  return data.data[0].embedding;
};

const formatMessage = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(/^https?:\/\//)) {
      const cleanUrl = part.replace(/[.,;:!?)\]}>]+$/, '');
      // Caso 1: WhatsApp
      if (part.includes('wa.me') || part.includes('whatsapp')) {
        return (
          <a
            key={index}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-[#25D366] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-[#20BD5A] transition-all hover:scale-105 shadow-md shadow-green-500/20 active:scale-95"
          >
            <span>Hablar por WhatsApp</span>
          </a>
        );
      }
      
      // Caso 2: Producto de la tienda
      if (part.includes('/producto/')) {
        return (
          <a
            key={index}
            href={cleanUrl}
            className="flex items-center justify-between mt-4 px-6 py-4 bg-secondary text-white text-[10px] font-black uppercase tracking-[0.2em] italic rounded-2xl hover:bg-primary transition-all group shadow-xl shadow-secondary/10 active:scale-[0.98]"
          >
            <span>Ver Producto</span>
            <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
              <Send className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </a>
        );
      }

      // Caso 3: Otras URLs (links genéricos)
      return (
        <a
          key={index}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-bold underline hover:text-primary/80 break-all"
        >
          {cleanUrl}
        </a>
      );
    }
    return <span key={index} className="leading-relaxed">{part}</span>;
  });
};

interface Message {
  id: string;
  text: string;
  isBot: boolean;
}

import { useChatStore } from "@/store/useChatStore";

export const AIChatAgent = () => {
  const { pathname } = useLocation();
  const { messages, isOpen, setIsOpen, addMessage, isLoading: isChatLoading } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (pathname.startsWith('/admin') || pathname.startsWith('/cuenta')) {
    return null;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    addMessage({ id: Date.now().toString(), text: userMsg, isBot: false });
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.isBot ? 'assistant' : 'user',
        content: m.text
      }));

      let productsInfo = '';
      let useProductSearch = true;

      try {
        const embedding = await getQueryEmbedding(userMsg);
        const { data, error: rpcError } = await supabase.rpc('match_products', {
          query_embedding: embedding,
          match_threshold: 0.35,
          match_count: 12
        });

        if (rpcError) throw rpcError;

        const matchedProducts = data || [];
        productsInfo = matchedProducts.length > 0
          ? matchedProducts.map((p: any) => {
              const stockInfo = p.variants?.map((v: any) => {
                const label = v.color ? `${v.size}/${v.color}` : v.size;
                return `${label}: ${v.stock}uds`;
              }).join(', ') || 'Sin info de stock';
              const novelty = p.is_new ? '✨ NOVEDAD ✨' : '';
              return `Artículo: ${p.name} ${novelty}. Precio: ${p.price}€. URL: /producto/${p.slug}. Tallas/Stock: ${stockInfo}. Descripción: ${p.description}`;
            }).join('\n---\n')
          : 'No hay artículos específicos en el catálogo que coincidan.';
      } catch {
        useProductSearch = false;
        productsInfo = '';
      }

      const baseInfo = `
Eres el asistente virtual experto de "Asfalto y Gas", tienda especializada en cascos y equipación motera. Tu objetivo es asesorar a los clientes con conocimiento técnico, amabilidad y un tono cercano.

IMPORTANTE: Los nombres de productos y categorías están en español y NO deben traducirse ni reinterpretarse. Usa siempre el nombre exacto del producto tal cual aparece en el inventario.

INFORMACIÓN DE LA TIENDA:
- Ubicación: ${BRAND.address.street}, ${BRAND.address.city} (${BRAND.address.region}).
- Teléfono/WhatsApp: ${BRAND.phoneDisplay}.
- Envíos: 5,50€ tarifa plana a Península (Nacex). Gratis en compras > 50€. Entrega en 24-48h laborables. No enviamos fuera de la Península.
- Recogida: Gratis en tienda física.
- Devoluciones: 14 días naturales desde la recepción. El producto debe estar sin usar y en su embalaje original. Los gastos de envío de devolución corren a cargo del cliente.
- Pagos: Aceptamos Tarjeta y Bizum (pasarela segura Redsys).
- Sobre nosotros: Especialistas en cascos de moto (integrales, modulares, jet), equipaje y mantenimiento. Marcas como HJC, AGV, Shoei, Nolan, Airoh.
`;

      const inventoryBlock = useProductSearch
        ? `
INVENTARIO REAL (Usa esta info para recomendar):
${productsInfo}

REGLAS CRÍTICAS DE RESPUESTA:
1. SOLO recomienda artículos que estén en el "INVENTARIO REAL" arriba indicado. NUNCA inventes un producto que no aparezca en la lista.
2. Si el cliente pide una categoría (ej: Casco integral) y no hay ninguno en el inventario real, NO inventes ni recomiendes otra cosa de distinta categoría. Di amablemente que no tienes stock de eso ahora mismo y ofrece mirar el "Top ventas" o contactar por WhatsApp.
3. Los enlaces a producto DEBEN ser copiados EXACTAMENTE del inventario real. No modifiques ni inventes URLs. Usa siempre la forma relativa (/producto/...) NUNCA con dominio completo.
4. Sé persuasiva pero muy concisa.
5. Si un producto es "NOVEDAD", menciónalo con entusiasmo.
6. NUNCA digas "Excelente elección" ni frases similares si el cliente solo preguntó o pidió recomendaciones. Responde de forma natural como un asesor de tienda motera. Si el cliente aún no ha elegido nada, no finjas que ya lo hizo.
7. NO compartas la URL completa del sitio web (https://www.asfaltoygas.es) porque el usuario ya está en él. Si quieres dirigir a una sección, usa solo el enlace relativo (ej: /#novedades).`
        : `
NOTA: En este momento no tengo acceso al catálogo de productos en tiempo real. NO inventes productos ni generes URLs de producto bajo ninguna circunstancia. Ayuda al cliente con información general de la tienda (envíos, devoluciones, tallas de casco, homologaciones) y sugiérele estas secciones reales de la web usando enlaces relativos:

- Cascos: /categoria/cascos
- Equipaje: /categoria/equipaje
- Aceites y lubricantes: /categoria/aceites-y-lubricantes
- Mantenimiento: /categoria/mantenimiento
- Top ventas: /#novedades

Para dudas de stock, que contacte por WhatsApp (${BRAND.phoneDisplay}). NUNCA escribas enlaces que no estén en esta lista. NUNCA incluyas el dominio completo (https://...) en los enlaces, usa siempre la forma relativa como se muestra arriba.`;

      const systemPrompt = baseInfo + inventoryBlock;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          systemPrompt,
          messages: [
            ...conversationHistory,
            { role: 'user', content: userMsg },
          ],
        }),
      });

      if (!response.ok) throw new Error('Groq API Error');
      
      const resData = await response.json();
      const botResponse = resData.choices[0].message.content;

      addMessage({ id: Date.now().toString(), text: botResponse, isBot: true });
    } catch (error) {
      console.error('AIChat Error:', error);
      addMessage({ id: Date.now().toString(), text: 'Lo siento, estoy teniendo un problema técnico. ¿Podrías repetirme la pregunta o contactarnos por WhatsApp?', isBot: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      <div
        className={`fixed bottom-6 right-6 z-50 w-[90vw] sm:w-[380px] bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 transform origin-bottom-right flex flex-col border border-primary/10 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={{ height: '550px', maxHeight: '85vh' }}
      >
        <div className="bg-primary p-5 flex justify-between items-center text-white relative">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Asfalto y Gas AI</h3>
              <p className="text-[10px] opacity-80 uppercase tracking-widest">Asistente Virtual</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-3 text-sm rounded-2xl max-w-[85%] ${msg.isBot ? 'bg-white border border-gray-100 shadow-sm' : 'bg-secondary text-white shadow-md'}`}>
                {msg.isBot ? formatMessage(msg.text) : msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 bg-white border border-gray-100 rounded-2xl animate-pulse text-xs text-gray-400">
                Pensando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="¿En qué puedo ayudarte?"
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-primary"
            />
            <button type="submit" className="absolute right-1 p-2 bg-primary text-white rounded-full">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
