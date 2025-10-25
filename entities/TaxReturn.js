// TaxReturn entity
import supabase from '@/integrations/supabaseClient.js';

class TaxReturn {
  constructor(data) {
    this.id = data.id;
    this.tax_year = data.tax_year || new Date().getFullYear();
    this.state = data.state || 'Federal';
    this.status = data.status || 'draft';
    this.personal_info = data.personal_info || {};
    this.income_info = data.income_info || {};
    this.deductions = data.deductions || { standard_deduction: true };
    this.ca = data.ca || { resident: true, months_in_ca: 12, ca_withholding: 0, sdi_withheld: 0, adjustments: 0 };
    this.calculated_tax = data.calculated_tax || {};
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  static async create(data) {
    const { data: inserted, error } = await supabase
      .from('tax_returns')
      .insert([{ ...data }])
      .select()
      .single();
    if (error) throw error;
    return new TaxReturn(inserted);
  }

  static async list(orderBy = '-created_at', limit = null) {
    let query = supabase.from('tax_returns').select('*');
    // orderBy string like '-created_at' or 'created_at'
    const desc = orderBy?.startsWith('-');
    const col = orderBy?.replace('-', '') || 'created_at';
    query = query.order(col, { ascending: !desc });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((r) => new TaxReturn(r));
  }

  static async filter(filters, orderBy = '-created_at', limit = null) {
    let query = supabase.from('tax_returns').select('*');
    Object.entries(filters || {}).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const desc = orderBy?.startsWith('-');
    const col = orderBy?.replace('-', '') || 'created_at';
    query = query.order(col, { ascending: !desc });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((r) => new TaxReturn(r));
  }

  static async get(id) {
    const { data, error } = await supabase.from('tax_returns').select('*').eq('id', id).single();
    if (error) return null;
    return new TaxReturn(data);
  }

  async save() {
    this.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('tax_returns')
      .update({
        tax_year: this.tax_year,
        state: this.state,
        status: this.status,
        personal_info: this.personal_info,
        income_info: this.income_info,
        deductions: this.deductions,
        ca: this.ca,
        calculated_tax: this.calculated_tax,
        updated_at: this.updated_at,
      })
      .eq('id', this.id)
      .select()
      .single();
    if (error) throw error;
    return new TaxReturn(data);
  }

  async update(data) {
    Object.assign(this, data);
    return this.save();
  }

  async delete() {
    const { error } = await supabase.from('tax_returns').delete().eq('id', this.id);
    if (error) throw error;
    return true;
  }
}

export default TaxReturn;
