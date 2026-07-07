import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Loader2, Download, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Build {
  _id: string;
  buildNumber: number;
  status: string;
  startedAt: string;
  finishedAt?: string;
  artefacts?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

export default function BuildHistory() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBuilds();
  }, []);

  const fetchBuilds = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/builds/history');
      setBuilds(response.data);
    } catch (err: any) {
      console.error('Failed to fetch build history:', err);
      setError(err.response?.data?.message || 'Failed to load build history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'finished':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'building':
      case 'queued':
        return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'finished':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'building':
      case 'queued':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const calculateDuration = (start: string, end?: string) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Build History</h1>
        <button
          onClick={fetchBuilds}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {builds.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No builds found yet. Trigger your first build to see it here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {builds.map((build) => (
            <div
              key={build._id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getStatusIcon(build.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Build #{build.buildNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(build.status)}`}>
                        {build.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Started:</span> {formatDate(build.startedAt)}
                      </p>
                      {build.finishedAt && (
                        <p>
                          <span className="font-medium">Finished:</span> {formatDate(build.finishedAt)}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Duration:</span> {calculateDuration(build.startedAt, build.finishedAt)}
                      </p>
                    </div>

                    {build.artefacts && build.artefacts.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Artifacts:</p>
                        <div className="flex flex-wrap gap-2">
                          {build.artefacts.map((artifact, index) => (
                            <a
                              key={index}
                              href={artifact.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                            >
                              <Download className="w-4 h-4" />
                              {artifact.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
