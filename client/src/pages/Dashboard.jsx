import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { InsightsPanel } from '../components/dashboard/InsightsPanel';
import { getInsights } from '../api/index.js';
import { Spinner } from '../components/common/Spinner';

export function Dashboard() {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await getInsights();
        setInsights(response.data);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <InsightsPanel insights={insights} />
      )}
    </div>
  );
}
