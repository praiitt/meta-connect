import { Router } from 'express';
import axios from 'axios';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Codemagic API configuration
const CODEMAGIC_API_TOKEN = process.env.CODEMAGIC_API_TOKEN || '';
const CODEMAGIC_APP_ID = process.env.CODEMAGIC_APP_ID || '';

router.get('/history', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!CODEMAGIC_API_TOKEN || !CODEMAGIC_APP_ID) {
      return res.status(500).json({ 
        message: 'Codemagic configuration missing. Please set CODEMAGIC_API_TOKEN and CODEMAGIC_APP_ID in environment variables.' 
      });
    }

    // Fetch builds from Codemagic API
    const response = await axios.get(
      `https://api.codemagic.io/builds?appId=${CODEMAGIC_APP_ID}`,
      {
        headers: {
          'x-auth-token': CODEMAGIC_API_TOKEN,
        },
      }
    );

    const builds = response.data.builds || [];
    
    // Transform the response to a cleaner format
    const transformedBuilds = builds.map((build: any) => ({
      _id: build._id,
      buildNumber: build.buildNumber,
      status: build.status,
      startedAt: build.startedAt,
      finishedAt: build.finishedAt,
      artefacts: build.artefacts?.map((artifact: any) => ({
        name: artifact.name,
        type: artifact.type,
        url: artifact.url,
      })) || [],
    }));

    res.json(transformedBuilds);
  } catch (error: any) {
    console.error('Failed to fetch build history from Codemagic:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to fetch build history',
      error: error.response?.data?.message || error.message 
    });
  }
});

export default router;
