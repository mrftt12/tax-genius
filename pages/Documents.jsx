import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { TaxDocument } from '@/entities/all';
import supabase from '@/integrations/supabaseClient.js';

export default function Documents() {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('other');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // For now, no specific tax_return_id filter
        const list = await TaxDocument.list(null);
        setDocs(list);
      } catch (e) {
        setError(e.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) return;
    setUploading(true);
    try {
      const created = await TaxDocument.create({ file, document_type: docType });
      setDocs((prev) => [created, ...prev]);
      setFile(null);
      setDocType('other');
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const publicUrlFor = (file_path) => {
  const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'storage';
    const { data } = supabase.storage.from(bucket).getPublicUrl(file_path);
    return data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-gray-600">Upload tax documents to your secure Supabase storage.</p>
        </div>

        <Card className="shadow">
          <CardHeader>
            <CardTitle>Upload a document</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onUpload}>
              <div>
                <label className="text-sm font-medium mb-1 block">Document type</label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  <option value="w2">W-2</option>
                  <option value="1099">1099</option>
                  <option value="1098">1098</option>
                  <option value="receipt">Receipt</option>
                  <option value="bank_statement">Bank Statement</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">File</label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={!file || uploading}>
                {uploading ? 'Uploading…' : 'Upload'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardHeader>
            <CardTitle>Your documents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading…</div>
            ) : docs.length === 0 ? (
              <div className="text-gray-600">No documents uploaded yet.</div>
            ) : (
              <div className="space-y-3">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-medium">{d.document_name || d.file_url || d.file_path}</div>
                      <div className="text-xs text-gray-500">{d.document_type}</div>
                    </div>
                    {d.file_url || d.file_path ? (
                      <a className="text-emerald-700 underline" href={publicUrlFor(d.file_url || d.file_path)} target="_blank" rel="noreferrer">
                        View
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}