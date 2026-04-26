import React from 'react';
import { Briefcase, MapPin, Building, Calendar, ExternalLink, AlertTriangle } from 'lucide-react';
import { JOBS } from '../data/jobs';

export default function CareersPortal() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="orbitron" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '2rem' }}>
          <Briefcase color="var(--accent-blue)" />
          ISRO Careers Portal
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Live recruitment listings and opportunities across ISRO centres.
        </p>
      </div>

      <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--accent-amber)', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <AlertTriangle color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ color: 'var(--accent-amber)', marginBottom: '0.25rem', fontSize: '1rem' }}>Pro Tip: Bookmark the Official Careers Page</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            All official recruitment notifications are published through the ISRO Centralised Recruitment Board (ICRB). The links below will take you directly to the official ISRO careers website. Always verify notifications on the official portal.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {JOBS.map(job => (
          <div key={job.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span className={`badge ${job.type.includes('Permanent') ? 'badge-green' : 'badge-blue'}`}>
                {job.type}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} />
                {job.deadline}
              </span>
            </div>
            
            <h3 className="orbitron" style={{ fontSize: '1.2rem', marginBottom: '1rem', lineHeight: 1.3 }}>{job.title}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={16} />
                {job.organization}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} />
                {job.location}
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <a 
                href={job.link} 
                target="_blank" 
                rel="noreferrer"
                className="btn-primary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
              >
                Apply on ISRO.gov.in <ExternalLink size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
