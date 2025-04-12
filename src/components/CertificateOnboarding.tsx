'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { importCertificateFromCertaas } from "../app/actions";
import { useParams } from "next/navigation";

export function CertificateOnboarding() {
  const { teamId } = useParams() as { teamId: string }; // Type assertion for route params
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    serialNumber: '',
    commonName: ''
  });

  // In the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!teamId) throw new Error("Team context missing");
      
      await importCertificateFromCertaas({
        serialNumber: formData.serialNumber,
        commonName: formData.commonName,
        teamId,
        // Add missing required field
        isAmexCert: true, // Assuming this component handles CertaaS certs
        // Add temporary defaults
        serverName: '', 
        keystorePath: '',
        uri: '',
        applicationId: ''
      });
      
      setSuccess('Certificate onboarded successfully!');
      setFormData({ serialNumber: '', commonName: '' });
    } catch (err: any) {
      setError(err.message.includes('Failed to fetch') 
        ? 'Could not connect to CertaaS API'
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-semibold">Onboard Certificate from CertaaS</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Common Name</label>
          <Input
            value={formData.commonName}
            onChange={(e) => setFormData({...formData, commonName: e.target.value})}
            placeholder="e.g. valified.aexp.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Serial Number</label>
          <Input
            value={formData.serialNumber}
            onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
            placeholder="Enter certificate serial number"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Onboarding...' : 'Import Certificate'}
        </Button>
      </form>
    </div>
  );
}