// TaxDocument entity
import supabase from '@/integrations/supabaseClient.js';

class TaxDocument {
  constructor(data) {
    this.id = data.id;
    this.tax_return_id = data.tax_return_id;
    this.document_type = data.document_type; // 'w2', '1099', '1098', 'receipt', 'bank_statement', 'other'
    this.document_name = data.document_name;
    this.file_url = data.file_url;
    this.extracted_data = data.extracted_data;
    this.created_at = data.created_at || new Date().toISOString();
  }

  static async create(data) {
  const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'storage';
    const { file, document_type, document_name, tax_return_id } = data;

    let file_path = data.file_url || null;
    if (file) {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const safeName = `${Date.now()}_${file.name}`.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const path = `${userId || 'anonymous'}/${safeName}`;
      const { data: uploadRes, error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false });
      if (uploadErr) throw uploadErr;
      file_path = uploadRes.path;
    }

    // Insert DB row (optional if table exists)
    const payload = {
      tax_return_id: tax_return_id || null,
      document_type: document_type || 'other',
      document_name: document_name || (typeof file === 'object' ? file.name : 'document'),
      file_path,
    };
    const { data: inserted, error } = await supabase.from('tax_documents').insert([payload]).select().single();
    if (error) {
      console.warn('[TaxDocument] Insert failed; ensure table tax_documents exists:', error.message);
      return new TaxDocument({ id: Date.now().toString(), ...payload, file_url: file_path });
    }
    return new TaxDocument({ ...inserted, file_url: file_path });
  }

  static async list(taxReturnId) {
    // Prefer DB listing; fall back to storage list if table missing
    const { data, error } = await supabase
      .from('tax_documents')
      .select('*')
      .eq('tax_return_id', taxReturnId);
    if (!error && data) {
      return data.map((d) => new TaxDocument({ ...d, file_url: d.file_url || d.file_path }));
    }

    console.warn('[TaxDocument] Falling back to storage listing. Ensure table tax_documents exists.');
  const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'storage';
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const folder = `${userId || 'anonymous'}`;
    const { data: files, error: listErr } = await supabase.storage.from(bucket).list(folder, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (listErr) throw listErr;
    return (files || []).map((f) =>
      new TaxDocument({
        id: f.id || `${folder}/${f.name}`,
        tax_return_id: taxReturnId,
        document_type: 'other',
        document_name: f.name,
        file_url: `${folder}/${f.name}`,
        created_at: f.created_at,
      })
    );
  }

  static async get(id) {
    const { data, error } = await supabase.from('tax_documents').select('*').eq('id', id).single();
    if (error) return null;
    return new TaxDocument({ ...data, file_url: data.file_url || data.file_path });
  }

  static async delete(id) {
    const { data, error } = await supabase.from('tax_documents').delete().eq('id', id).select().single();
    if (error) throw error;
    // Optionally delete from storage if file_path present
    if (data?.file_path) {
      const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'tax-docs';
      await supabase.storage.from(bucket).remove([data.file_path]);
    }
    return true;
  }
}

export default TaxDocument;
