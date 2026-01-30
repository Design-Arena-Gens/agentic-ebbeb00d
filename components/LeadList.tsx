'use client';

import { Lead } from '../types/lead';

export type LeadListProps = {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  selectedLeadId?: string;
};

export function LeadList({ leads, onSelectLead, selectedLeadId }: LeadListProps) {
  if (!leads.length) {
    return (
      <div className="lead-list lead-list--empty">
        <p>Search for a location to start discovering leads.</p>
      </div>
    );
  }

  return (
    <div className="lead-list">
      <table>
        <thead>
          <tr>
            <th>Business</th>
            <th>Contact</th>
            <th>Rating</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.placeId}
              className={lead.placeId === selectedLeadId ? 'lead-list__row lead-list__row--active' : 'lead-list__row'}
              onClick={() => onSelectLead(lead)}
            >
              <td>
                <strong>{lead.name}</strong>
                <p>{lead.address}</p>
              </td>
              <td>
                {lead.phoneNumber ? <p>{lead.phoneNumber}</p> : <span className="lead-list__muted">No phone</span>}
                {lead.website ? (
                  <a href={lead.website} target="_blank" rel="noreferrer">
                    Website
                  </a>
                ) : (
                  <span className="lead-list__muted">No website</span>
                )}
              </td>
              <td>
                {lead.rating ? (
                  <div>
                    <span>{lead.rating.toFixed(1)}</span>
                    <span className="lead-list__muted"> ({lead.userRatingsTotal ?? 0})</span>
                  </div>
                ) : (
                  <span className="lead-list__muted">No reviews</span>
                )}
              </td>
              <td>{lead.primaryType ?? lead.types?.[0] ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
