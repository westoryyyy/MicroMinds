"use client";
import { useState } from "react";
import { parseEther } from "viem";
import { useCreateListing } from "@/lib/hooks";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateListingModal({ isOpen, onClose }: Props) {
  const createListing = useCreateListing();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    apiUrl: "",
    price: "",
    schemaInput: "{\n  \"type\": \"object\",\n  \"properties\": {}\n}",
    schemaOutput: "{\n  \"type\": \"object\",\n  \"properties\": {}\n}",
    maxTimeout: 10,
    category: "Utility",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse price to wei
    let priceWei = "0";
    try {
      priceWei = parseEther(formData.price || "0").toString();
    } catch {
      alert("Invalid price format");
      return;
    }

    let parsedInputSchema, parsedOutputSchema;
    try {
      parsedInputSchema = JSON.parse(formData.schemaInput);
      parsedOutputSchema = JSON.parse(formData.schemaOutput);
    } catch {
      alert("Invalid JSON format in schema");
      return;
    }

    createListing.mutate({
      name: formData.name,
      description: formData.description,
      endpoint: formData.apiUrl,
      priceWei,
      inputSchema: parsedInputSchema,
      outputSchema: parsedOutputSchema,
      timeoutMs: Number(formData.maxTimeout),
      category: formData.category,
    }, {
      onSuccess: () => {
        alert("API Listing successfully created!");
        onClose();
        // Reset form or let it be
      },
      onError: (err: any) => {
        alert("Failed to create listing: " + (err.message || String(err)));
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-paper border-[3px] border-solid border-ink w-full max-w-2xl rounded-[20px_8px_20px_8px] shadow-crayon my-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-transparent border-none text-2xl cursor-pointer hover:scale-110 transition-transform z-10"
        >
          ✖️
        </button>
        
        <div className="p-6 md:p-8">
          <h2 className="text-3xl m-0 mb-2 flex items-center gap-3">
            <span className="bg-blu text-white w-10 h-10 rounded-full flex items-center justify-center font-bold font-sans text-xl shadow-sm -rotate-2">➕</span>
            Tawarkan API Kamu
          </h2>
          <p className="text-mut font-sans mb-6">Isi detail API yang ingin kamu jual di MicroMinds.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-ink text-sm uppercase tracking-wider">Nama API</label>
                <input required name="name" value={formData.name} onChange={handleChange} placeholder="Misal: JSON Formatter" className="w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-ink text-sm uppercase tracking-wider">Kategori</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full">
                  <option value="AI Agent">AI Agent</option>
                  <option value="Data Processing">Data Processing</option>
                  <option value="Utility">Utility</option>
                  <option value="Crypto">Crypto</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-ink text-sm uppercase tracking-wider">Deskripsi Lengkap</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} placeholder="Jelaskan apa fungsi API ini secara detail..." className="!min-h-[80px]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-ink text-sm uppercase tracking-wider">URL Endpoint (API)</label>
                <input required type="url" name="apiUrl" value={formData.apiUrl} onChange={handleChange} placeholder="https://api.punyaku.com/generate" className="w-full font-mono text-sm" />
              </div>
              <div className="flex flex-col gap-2 relative">
                <label className="font-bold text-ink text-sm uppercase tracking-wider">Harga per Panggilan</label>
                <div className="relative">
                  <input required type="number" step="0.000001" min="0" name="price" value={formData.price} onChange={handleChange} placeholder="0.005" className="w-full !pr-16 font-mono" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-mut font-sans text-sm font-bold">tMON</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-ink text-sm uppercase tracking-wider">Input JSON Schema</label>
                <textarea required name="schemaInput" value={formData.schemaInput} onChange={handleChange} className="!min-h-[120px] !bg-ink !text-grn !border-ink shadow-inner text-xs" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-ink text-sm uppercase tracking-wider">Output JSON Schema</label>
                <textarea required name="schemaOutput" value={formData.schemaOutput} onChange={handleChange} className="!min-h-[120px] !bg-ink !text-grn !border-ink shadow-inner text-xs" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-ink text-sm uppercase tracking-wider">Max Timeout</label>
              <select name="maxTimeout" value={formData.maxTimeout} onChange={handleChange} className="w-full md:w-1/2">
                <option value={5}>5 Detik (Cepat)</option>
                <option value={10}>10 Detik (Standar)</option>
                <option value={25}>25 Detik (Maksimal)</option>
              </select>
            </div>

            <div className="mt-4 flex gap-4">
              <button type="button" onClick={onClose} className="btn bg-paper !text-ink !w-full" disabled={createListing.isPending}>Batal</button>
              <button type="submit" className="btn b-b !w-full flex items-center justify-center gap-2" disabled={createListing.isPending}>
                {createListing.isPending ? "Loading..." : "Submit Listing 🚀"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
